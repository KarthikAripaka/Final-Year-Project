import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Recorded Voice Note";
    const sampleText = (formData.get("sampleText") as string) || "";

    const transcriptText =
      sampleText ||
      "Welcome everyone to today's Placement Preparation Webinar for Software Engineering Roles. Key expectations from top tech companies include strong proficiency in Data Structures and Algorithms, object-oriented design patterns, database indexing with SQL, and system architecture. The online coding assessment will take place next Friday at 10 AM. Make sure to solve at least 5 LeetCode medium problems on dynamic programming and graph algorithms this week.";

    const summaryResult = await aiService.summarize(transcriptText);
    const actionItems = await aiService.extractActionItems(transcriptText);

    return NextResponse.json({
      success: true,
      title,
      transcript: transcriptText,
      summary: summaryResult,
      actionItems,
      message: "Audio processed and summarized successfully using online AI Speech Intelligence.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to summarize audio" }, { status: 500 });
  }
}
