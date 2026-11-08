import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";
import { codingStore } from "@/lib/coding/codingStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      problemSlug,
      assignmentId = "assign_1",
      rollNumber = "A23126511128",
      studentName = "Aripaka Karthik",
      githubUsername = "KarthikAripaka",
    } = body;

    if (!username || !problemSlug) {
      return NextResponse.json({ error: "LeetCode username and problemSlug are required" }, { status: 400 });
    }

    const verification = await leetcodeService.verifyStudentProblemSolved(username, problemSlug);

    if (verification.isSolved) {
      // Automatically record in the persistent store so Faculty sees the score and rank updated immediately
      codingStore.recordProblemSolved({
        assignmentId,
        rollNumber,
        studentName,
        leetcodeUsername: username,
        githubUsername,
        problemSlug,
        verifiedLive: true,
      });
    }

    return NextResponse.json({
      success: true,
      username,
      problemSlug,
      assignmentId,
      isSolved: verification.isSolved,
      verifiedAt: verification.verifiedAt || new Date().toISOString(),
      verifiedLive: true,
      message: verification.isSolved
        ? `✅ Live LeetCode Verification Confirmed: Problem "${problemSlug}" solved by @${username}. Recorded in Faculty Score Listing!`
        : `⚠️ Problem "${problemSlug}" not found in recent accepted submissions for @${username}. You can also use the In-Browser Code Runner to submit directly.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to verify problem";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
