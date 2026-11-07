import { NextRequest, NextResponse } from "next/server";
import { leetcodeService } from "@/lib/coding/leetcodeService";
import { CodingAssignment } from "@/types";

// In-memory persistent store across requests for demonstration
let assignmentsStore: CodingAssignment[] = [
  {
    id: "assign_1",
    title: "IV/IV B.Tech IT Lab Exam 1: Data Structures & Algorithms",
    description: "Mandatory laboratory coding assessment for final year Information Technology students. Solve the assigned LeetCode problems and verify your live accepted submissions.",
    assignedBy: "Prof. K. Srinivas (Head of Department, IT)",
    department: "Information Technology",
    academicYear: "2026-2027",
    deadline: "2026-10-30T17:00:00Z",
    totalPoints: 100,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    problems: [
      {
        id: "1",
        frontendId: "1",
        title: "Two Sum",
        titleSlug: "two-sum",
        difficulty: "Easy",
        category: "Algorithms",
        url: "https://leetcode.com/problems/two-sum/",
        points: 20,
        topicTags: ["Array", "Hash Table"],
      },
      {
        id: "121",
        frontendId: "121",
        title: "Best Time to Buy and Sell Stock",
        titleSlug: "best-time-to-buy-and-sell-stock",
        difficulty: "Easy",
        category: "Algorithms",
        url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        points: 20,
        topicTags: ["Array", "Dynamic Programming"],
      },
      {
        id: "11",
        frontendId: "11",
        title: "Container With Most Water",
        titleSlug: "container-with-most-water",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/container-with-most-water/",
        points: 30,
        topicTags: ["Array", "Two Pointers", "Greedy"],
      },
      {
        id: "3",
        frontendId: "3",
        title: "Longest Substring Without Repeating Characters",
        titleSlug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        points: 30,
        topicTags: ["Hash Table", "String", "Sliding Window"],
      },
    ],
  },
  {
    id: "assign_2",
    title: "Accenture & Amazon Placement Screening: Graph & Stack Assessment",
    description: "Pre-placement company diagnostic test. Covers core topics required by Accenture Solutions (₹9.5 LPA) and Amazon AWS (₹44 LPA).",
    assignedBy: "ANITS Training & Placement Cell",
    department: "Information Technology",
    academicYear: "2026-2027",
    deadline: "2026-11-10T17:00:00Z",
    totalPoints: 100,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    problems: [
      {
        id: "20",
        frontendId: "20",
        title: "Valid Parentheses",
        titleSlug: "valid-parentheses",
        difficulty: "Easy",
        category: "Algorithms",
        url: "https://leetcode.com/problems/valid-parentheses/",
        points: 20,
        topicTags: ["String", "Stack"],
      },
      {
        id: "200",
        frontendId: "200",
        title: "Number of Islands",
        titleSlug: "number-of-islands",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/number-of-islands/",
        points: 40,
        topicTags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find"],
      },
      {
        id: "207",
        frontendId: "207",
        title: "Course Schedule",
        titleSlug: "course-schedule",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/course-schedule/",
        points: 40,
        topicTags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json({ success: true, assignments: assignmentsStore });
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

    assignmentsStore.unshift(newAssignment);

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create assignment" }, { status: 500 });
  }
}

