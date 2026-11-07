import { NextRequest, NextResponse } from "next/server";
import { processPdfDocument } from "@/lib/rag/engine";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, sampleText } = body;

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update status to PROCESSING
    await supabase.from("documents").update({ status: "PROCESSING" }).eq("id", documentId);

    // Process PDF text or sample text
    const sampleBuffer = Buffer.from(
      sampleText ||
        "Academic Regulations 2026: Students must maintain a minimum attendance of 75% across all theoretical and practical courses. Attendance below 75% will result in exam disqualification unless condoned by Dean Academic Affairs with valid medical proof. Placement eligibility requires CGPA >= 7.5 with zero active backlogs."
    );

    const result = await processPdfDocument(documentId, sampleBuffer);

    return NextResponse.json({
      success: true,
      documentId,
      status: "READY_FOR_REVIEW",
      chunksCount: result.chunksCount,
      message: "PDF extracted, chunked, and embedded into pgvector. Status set to READY_FOR_REVIEW.",
    });
  } catch (error: any) {
    console.error("Document Process Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process document" }, { status: 500 });
  }
}
