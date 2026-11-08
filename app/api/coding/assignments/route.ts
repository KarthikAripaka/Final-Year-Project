import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";
import { codingStore } from "@/lib/coding/codingStore";
import { CodingAssignment } from "@/types";

export async function GET() {
  const assignments = codingStore.getAssignments();
  return NextResponse.json({ success: true, assignments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, assignedBy, department, deadline, problemSlugs } = body;

    if (!title || !problemSlugs || !Array.isArray(problemSlugs) || problemSlugs.length === 0) {
      return NextResponse.json({ error: "Title and at least one problem slug are required" }, { status: 400 });
    }

    // Fetch live problem details from LeetCode for each slug
    const problems = await Promise.all(
      problemSlugs.map(async (slug: string) => {
        return await leetcodeService.fetchProblemDetails(slug);
      })
    );

    const totalPoints = problems.reduce((acc, p) => acc + p.points, 0);

    const newAssignment: CodingAssignment = {
      id: `assign_${Date.now()}`,
      title,
      description: description || "Department coding assignment conducted via LeetCode.",
      assignedBy: assignedBy || "Faculty Member (ANITS)",
      department: department || "Information Technology",
      academicYear: "2026-2027",
      deadline: deadline || new Date(Date.now() + 86400000 * 7).toISOString(),
      totalPoints,
      problems,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    codingStore.addAssignment(newAssignment);

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create assignment";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
