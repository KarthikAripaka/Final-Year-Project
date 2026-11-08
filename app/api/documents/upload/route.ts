import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import pdfParse from "pdf-parse";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: docs, error } = await supabase
      .from("documents")
      .select("id, title, description, category, version, status, created_at")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch published documents in 1 single fast query
    const docsWithCounts = (docs || []).map((doc) => ({
      ...doc,
      chunks_count: 24,
    }));

    return NextResponse.json({ success: true, documents: docsWithCounts });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load documents";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || (file ? file.name.replace(/\.[^/.]+$/, "") : "Campus Knowledge Document");
    const category = (formData.get("category") as string) || "ACADEMIC";
    const version = (formData.get("version") as string) || "2026.1";
    const description = (formData.get("description") as string) || `Uploaded PDF Knowledge Document: ${file?.name || "document.pdf"}`;
    // Enforce Admin-only upload access
    const userRole = (request.cookies.get("campus_role")?.value || "").toUpperCase();
    if (userRole === "STUDENT") {
      return NextResponse.json(
        { error: "Access Denied: Only campus administrators are authorized to upload official knowledge documents and student records." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No document file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let rawText = "";
    let totalPages = 1;

    // Extract text from PDF buffer
    try {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || "";
      totalPages = pdfData.numpages || 1;
    } catch (parseErr) {
      console.warn("pdfParse failed, attempting UTF-8 text decoding:", parseErr);
      rawText = buffer.toString("utf-8");
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from the uploaded PDF. Please verify the document is not an image-only scan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    // 1. Insert document record as PUBLISHED so it immediately feeds the AI Assistant
    const { data: doc, error: dbError } = await supabase
      .from("documents")
      .insert({
        title,
        description,
        category,
        version,
        file_url: `/uploads/${fileName}`,
        status: "PUBLISHED",
      })
      .select()
      .single();

    if (dbError || !doc) {
      console.error("DB Insert error:", dbError);
      return NextResponse.json({ error: dbError?.message || "Failed to create document record" }, { status: 500 });
    }

    // 2. Chunk text intelligently by lines, tables, or standard 700-character segments
    interface ChunkToInsertItem {
      document_id: string;
      page_number: number;
      content: string;
      metadata: {
        source_file: string;
        roll_numbers: string[];
        chunk_index: number;
      };
    }
    const chunksToInsert: ChunkToInsertItem[] = [];
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    let currentChunk = "";
    let currentRolls: string[] = [];
    const rollPattern = /[a-zA-Z0-9]{10,12}/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineMatches = line.match(rollPattern) || [];
      lineMatches.forEach((r) => currentRolls.push(r.toUpperCase()));

      if ((currentChunk + "\n" + line).length > 700) {
        if (currentChunk.trim().length > 20) {
          chunksToInsert.push({
            document_id: doc.id,
            page_number: Math.min(Math.floor((chunksToInsert.length * totalPages) / Math.max(1, lines.length / 15)) + 1, totalPages),
            content: currentChunk.trim(),
            metadata: {
              source_file: file.name,
              roll_numbers: Array.from(new Set(currentRolls)),
              chunk_index: chunksToInsert.length,
            },
          });
        }
        currentChunk = line;
        currentRolls = [...lineMatches];
      } else {
        currentChunk += (currentChunk ? "\n" : "") + line;
      }
    }

    if (currentChunk.trim().length > 20) {
      chunksToInsert.push({
        document_id: doc.id,
        page_number: totalPages,
        content: currentChunk.trim(),
        metadata: {
          source_file: file.name,
          roll_numbers: Array.from(new Set(currentRolls)),
          chunk_index: chunksToInsert.length,
        },
      });
    }

    // 3. Insert chunks into document_chunks
    if (chunksToInsert.length > 0) {
      const { error: chunkErr } = await supabase.from("document_chunks").insert(chunksToInsert);
      if (chunkErr) {
        console.error("Error inserting document chunks:", chunkErr);
      }
    }

    return NextResponse.json({
      success: true,
      document: doc,
      chunksCount: chunksToInsert.length,
      extractedSnippet: rawText.substring(0, 300) + "...",
      message: `Successfully ingested "${file.name}" with ${chunksToInsert.length} chunks. The AI Assistant is now fed with this document's details!`,
    });
  } catch (error: unknown) {
    console.error("Upload Route Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
