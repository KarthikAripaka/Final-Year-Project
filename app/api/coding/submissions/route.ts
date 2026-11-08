import { NextRequest, NextResponse } from "next/server";
import { codingStore } from "@/lib/coding/codingStore";
import { leetcodeService } from "@/lib/coding/leetcodeService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId") || "assign_1";

  const scores = codingStore.getRankedScores(assignmentId);
  return NextResponse.json({ success: true, assignmentId, scores });
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Action: Sync All with LeetCode GraphQL
    if (action === "sync") {
      const body = await request.json().catch(() => ({}));
      const assignmentId = body.assignmentId || "assign_1";
      const scores = await codingStore.syncBatchWithLeetCode(assignmentId);
      return NextResponse.json({
        success: true,
        message: "Batch successfully synchronized live with LeetCode GraphQL API",
        scores,
      });
    }

    // Action: Evaluate Code Solution (In-Browser Lab Test Runner)
    if (action === "evaluate") {
      const body = await request.json();
      const { problemSlug, code } = body;
      if (!problemSlug || !code) {
        return NextResponse.json({ error: "Problem slug and code are required" }, { status: 400 });
      }

      const evalResult = leetcodeService.evaluateSolution(problemSlug, code);
      return NextResponse.json({ success: true, evaluation: evalResult });
    }

    // Default Action: Record Problem Solved / Verified
    const body = await request.json();
    const {
      assignmentId = "assign_1",
      rollNumber,
      studentName,
      leetcodeUsername,
      githubUsername,
      problemSlug,
      verifiedLive = true,
    } = body;

    if (!rollNumber || !problemSlug) {
      return NextResponse.json({ error: "Roll number and problemSlug are required" }, { status: 400 });
    }

    const result = codingStore.recordProblemSolved({
      assignmentId,
      rollNumber,
      studentName,
      leetcodeUsername,
      githubUsername,
      problemSlug,
      verifiedLive,
    });

    return NextResponse.json({
      success: true,
      message: `Problem "${problemSlug}" verified! Score and rank updated in Faculty Score Listing.`,
      record: result.record,
      updatedRanks: result.updatedRanks,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process submission";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

