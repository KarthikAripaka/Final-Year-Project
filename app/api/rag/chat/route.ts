import { NextRequest, NextResponse } from "next/server";
import { queryGroundedRAG } from "@/lib/rag/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, rollNumber, studentEmail, studentName, roll, email, name } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question parameter is required" }, { status: 400 });
    }

    const finalRoll = (
      rollNumber ||
      roll ||
      request.cookies.get("campus_roll_number")?.value ||
      "A23126511128"
    ).toString().trim().toUpperCase();

    const finalEmail = (
      studentEmail ||
      email ||
      request.cookies.get("campus_email")?.value ||
      "aripakakarthik.23.it@anits.edu.in"
    ).toString().trim().toLowerCase();

    const finalName = (studentName || name || "Aripaka Karthik").toString().trim();

    const role = (
      body.role ||
      request.cookies.get("campus_role")?.value ||
      "STUDENT"
    ).toString().trim().toUpperCase();

    const ragResult = await queryGroundedRAG(question, {
      role,
      studentEmail: finalEmail,
      rollNumber: finalRoll,
      studentName: finalName,
    });

    return NextResponse.json(ragResult);
  } catch (error: any) {
    console.error("RAG Chat API error:", error);
    return NextResponse.json(
      {
        answer: "AI service is temporarily unavailable. Please try again in a moment.",
        citations: [],
        grounded: false,
        provider_used: "Error Fallback",
      },
      { status: 500 }
    );
  }
}
