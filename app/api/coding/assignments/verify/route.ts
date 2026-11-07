import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, problemSlug, assignmentId } = body;

    if (!username || !problemSlug) {
      return NextResponse.json({ error: "LeetCode username and problemSlug are required" }, { status: 400 });
    }

    const verification = await leetcodeService.verifyStudentProblemSolved(username, problemSlug);

    return NextResponse.json({
      success: true,
      username,
      problemSlug,
      assignmentId,
      isSolved: verification.isSolved,
      verifiedAt: verification.verifiedAt || new Date().toISOString(),
      verifiedLive: true,
      message: verification.isSolved
        ? `✅ Live LeetCode Verification Confirmed: Problem "${problemSlug}" solved by @${username}.`
        : `⚠️ Problem "${problemSlug}" not yet detected in recent accepted submissions for @${username}. Please submit your solution on LeetCode and verify again.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify problem" }, { status: 500 });
  }
}

