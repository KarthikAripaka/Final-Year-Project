import { CodingAssignment, StudentCodingSubmission } from "@/types";
import { leetcodeService } from "./leetcodeService";

export interface BatchStudentRosterEntry {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  leetcodeUsername: string;
  githubUsername: string;
}

export interface StudentScoreRecord extends BatchStudentRosterEntry {
  rank: number;
  assignmentId: string;
  solvedProblemSlugs: string[];
  score: number;
  maxScore: number;
  percentage: number;
  status: "COMPLETED" | "PARTIAL" | "PENDING";
  lastVerifiedAt: string;
  verifiedLive: boolean;
  totalLeetCodeSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  globalLeetCodeRank: number;
}

// Registered batch students in IV/IV B.Tech IT (ANITS)
export const initialBatchRoster: BatchStudentRosterEntry[] = [
  {
    studentId: "stud_1",
    studentName: "Aripaka Karthik",
    rollNumber: "A23126511128",
    department: "Information Technology",
    leetcodeUsername: "karthikaripaka",
    githubUsername: "KarthikAripaka",
  },
  {
    studentId: "stud_2",
    studentName: "P. Sneha",
    rollNumber: "323126511082",
    department: "Information Technology",
    leetcodeUsername: "sneha_p_it",
    githubUsername: "sneha-tech",
  },
  {
    studentId: "stud_3",
    studentName: "V. Sai Teja",
    rollNumber: "323126511099",
    department: "Information Technology",
    leetcodeUsername: "saiteja_v",
    githubUsername: "saiteja-dev",
  },
  {
    studentId: "stud_4",
    studentName: "K. Rohit",
    rollNumber: "323126511045",
    department: "Information Technology",
    leetcodeUsername: "rohit_kumar_it",
    githubUsername: "rohit-k",
  },
  {
    studentId: "stud_5",
    studentName: "Sravan Kumar",
    rollNumber: "323126511112",
    department: "Information Technology",
    leetcodeUsername: "sravan_k",
    githubUsername: "sravan-code",
  },
];

// In-Memory Persistent Assignments Store
export let assignmentsStore: CodingAssignment[] = [
  {
    id: "assign_1",
    title: "IV/IV B.Tech IT Lab Exam 1: Data Structures & Algorithms",
    description: "Mandatory laboratory coding assessment for final year Information Technology students. Solve the assigned LeetCode problems and verify your live accepted submissions.",
    assignedBy: "Prof. K. Srinivas (Head of Department, IT)",
    department: "Information Technology",
    academicYear: "2026-2027",
    deadline: "2026-11-20T17:00:00Z",
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
        id: "11",
        frontendId: "11",
        title: "Container With Most Water",
        titleSlug: "container-with-most-water",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/container-with-most-water/",
        points: 40,
        topicTags: ["Array", "Two Pointers", "Greedy"],
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
    deadline: "2026-11-25T17:00:00Z",
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
        topicTags: ["Array", "Depth-First Search", "Breadth-First Search"],
      },
      {
        id: "3",
        frontendId: "3",
        title: "Longest Substring Without Repeating Characters",
        titleSlug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        category: "Algorithms",
        url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        points: 40,
        topicTags: ["Hash Table", "String", "Sliding Window"],
      },
    ],
  },
];

// Persistent Map of assignmentId -> Map of rollNumber -> StudentScoreRecord
const submissionsStore: Map<string, Map<string, StudentScoreRecord>> = new Map();

/**
 * Initializes or gets the submissions map for an assignment
 */
function ensureAssignmentSubmissions(assignmentId: string): Map<string, StudentScoreRecord> {
  if (!submissionsStore.has(assignmentId)) {
    const assignment = assignmentsStore.find((a) => a.id === assignmentId) || assignmentsStore[0];
    const studentMap = new Map<string, StudentScoreRecord>();

    initialBatchRoster.forEach((student, index) => {
      // Start with clean initial records
      const record: StudentScoreRecord = {
        ...student,
        rank: index + 1,
        assignmentId,
        solvedProblemSlugs: [],
        score: 0,
        maxScore: assignment ? assignment.totalPoints : 100,
        percentage: 0,
        status: "PENDING",
        lastVerifiedAt: new Date().toISOString(),
        verifiedLive: false,
        totalLeetCodeSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        globalLeetCodeRank: 0,
      };
      studentMap.set(student.rollNumber, record);
    });

    submissionsStore.set(assignmentId, studentMap);
  }

  return submissionsStore.get(assignmentId)!;
}

/**
 * Recalculates ranks across all students in an assignment
 */
function recalculateRanks(studentMap: Map<string, StudentScoreRecord>, assignment: CodingAssignment) {
  const list = Array.from(studentMap.values());

  // Sort descending by score, then descending by solved count, then ascending by verification time
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.solvedProblemSlugs.length !== a.solvedProblemSlugs.length) {
      return b.solvedProblemSlugs.length - a.solvedProblemSlugs.length;
    }
    return new Date(a.lastVerifiedAt).getTime() - new Date(b.lastVerifiedAt).getTime();
  });

  list.forEach((record, index) => {
    record.rank = index + 1;
    record.maxScore = assignment.totalPoints;
    record.percentage = record.maxScore > 0 ? Math.round((record.score / record.maxScore) * 100) : 0;
    record.status =
      record.score >= record.maxScore ? "COMPLETED" : record.score > 0 ? "PARTIAL" : "PENDING";
    studentMap.set(record.rollNumber, record);
  });
}

export class CodingStoreService {
  /**
   * Retrieves all assignments
   */
  getAssignments(): CodingAssignment[] {
    return assignmentsStore;
  }

  /**
   * Adds a new assignment
   */
  addAssignment(assignment: CodingAssignment): void {
    assignmentsStore.unshift(assignment);
    ensureAssignmentSubmissions(assignment.id);
  }

  /**
   * Gets ranked student score list for an assignment (Read by Faculty & Student)
   */
  getRankedScores(assignmentId: string): StudentScoreRecord[] {
    const assignment = assignmentsStore.find((a) => a.id === assignmentId) || assignmentsStore[0];
    const studentMap = ensureAssignmentSubmissions(assignment.id);
    recalculateRanks(studentMap, assignment);

    return Array.from(studentMap.values()).sort((a, b) => a.rank - b.rank);
  }

  /**
   * Records a problem solved by a student (via Live LeetCode AC or In-Browser Lab Test Runner)
   * This immediately updates the score and recalculates the rank for the faculty section!
   */
  recordProblemSolved(params: {
    assignmentId: string;
    rollNumber: string;
    studentName?: string;
    leetcodeUsername?: string;
    githubUsername?: string;
    problemSlug: string;
    verifiedLive: boolean;
  }): { success: boolean; record: StudentScoreRecord; updatedRanks: StudentScoreRecord[] } {
    const { assignmentId, rollNumber, problemSlug, verifiedLive } = params;

    const assignment = assignmentsStore.find((a) => a.id === assignmentId) || assignmentsStore[0];
    const studentMap = ensureAssignmentSubmissions(assignment.id);

    let student = studentMap.get(rollNumber);
    if (!student) {
      student = {
        studentId: `stud_${Date.now()}`,
        studentName: params.studentName || "Student",
        rollNumber,
        department: "Information Technology",
        leetcodeUsername: params.leetcodeUsername || "student",
        githubUsername: params.githubUsername || "student",
        rank: studentMap.size + 1,
        assignmentId: assignment.id,
        solvedProblemSlugs: [],
        score: 0,
        maxScore: assignment.totalPoints,
        percentage: 0,
        status: "PENDING",
        lastVerifiedAt: new Date().toISOString(),
        verifiedLive: false,
        totalLeetCodeSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        globalLeetCodeRank: 0,
      };
      studentMap.set(rollNumber, student);
    }

    if (params.leetcodeUsername) student.leetcodeUsername = params.leetcodeUsername;
    if (params.githubUsername) student.githubUsername = params.githubUsername;

    // Add problem if not already solved
    const cleanSlug = problemSlug.trim().toLowerCase();
    if (!student.solvedProblemSlugs.includes(cleanSlug)) {
      student.solvedProblemSlugs.push(cleanSlug);
    }

    // Calculate score based on actual assignment problem points
    student.score = assignment.problems.reduce((sum, p) => {
      return student!.solvedProblemSlugs.includes(p.titleSlug.toLowerCase()) ? sum + p.points : sum;
    }, 0);

    student.lastVerifiedAt = new Date().toISOString();
    student.verifiedLive = verifiedLive;

    recalculateRanks(studentMap, assignment);

    const updatedRanks = Array.from(studentMap.values()).sort((a, b) => a.rank - b.rank);
    return {
      success: true,
      record: studentMap.get(rollNumber)!,
      updatedRanks,
    };
  }

  /**
   * Syncs all batch students live by querying LeetCode GraphQL in real-time
   */
  async syncBatchWithLeetCode(assignmentId: string): Promise<StudentScoreRecord[]> {
    const assignment = assignmentsStore.find((a) => a.id === assignmentId) || assignmentsStore[0];
    const studentMap = ensureAssignmentSubmissions(assignment.id);

    const students = Array.from(studentMap.values());

    for (const student of students) {
      try {
        const stats = await leetcodeService.fetchLeetCodeProfile(student.leetcodeUsername);
        student.totalLeetCodeSolved = stats.totalSolved;
        student.easySolved = stats.easySolved;
        student.mediumSolved = stats.mediumSolved;
        student.hardSolved = stats.hardSolved;
        student.globalLeetCodeRank = stats.ranking;

        // Check if any assignment problem appears in recent accepted submissions
        const recentSlugs = stats.recentSubmissions.map((s) => s.titleSlug.toLowerCase());
        assignment.problems.forEach((prob) => {
          if (recentSlugs.includes(prob.titleSlug.toLowerCase()) && !student.solvedProblemSlugs.includes(prob.titleSlug.toLowerCase())) {
            student.solvedProblemSlugs.push(prob.titleSlug.toLowerCase());
          }
        });

        // Recalculate score
        student.score = assignment.problems.reduce((sum, p) => {
          return student.solvedProblemSlugs.includes(p.titleSlug.toLowerCase()) ? sum + p.points : sum;
        }, 0);

        student.lastVerifiedAt = new Date().toISOString();
        student.verifiedLive = true;
      } catch (err) {
        console.warn(`Sync failed for student ${student.rollNumber}:`, err);
      }
    }

    recalculateRanks(studentMap, assignment);
    return Array.from(studentMap.values()).sort((a, b) => a.rank - b.rank);
  }
}

export const codingStore = new CodingStoreService();

