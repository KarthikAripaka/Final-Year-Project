import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "karthikaripaka";

    const stats = await leetcodeService.fetchLeetCodeProfile(username);
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch LeetCode profile";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username || "karthikaripaka";

    const stats = await leetcodeService.fetchLeetCodeProfile(username);
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch LeetCode profile";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

