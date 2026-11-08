import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "KarthikAripaka";

    const stats = await leetcodeService.fetchGitHubProfile(username);
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch GitHub profile";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

