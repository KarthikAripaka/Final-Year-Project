import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update document status to PUBLISHED
    const { data: updatedDoc, error } = await supabase
      .from("documents")
      .update({ status: "PUBLISHED", updated_at: new Date().toISOString() })
      .eq("id", documentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      action: "DOCUMENT_PUBLISHED",
      target_table: "documents",
      details: { document_id: documentId, title: updatedDoc.title },
    });

    return NextResponse.json({
      success: true,
      document: updatedDoc,
      message: "Document published successfully. Now active in official RAG Knowledge Base.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish document" }, { status: 500 });
  }
}
