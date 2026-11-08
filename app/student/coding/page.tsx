"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Code2,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Github,
  BookOpen,
  Play,
  Check,
  FileCode,
  X,
} from "lucide-react";
import { CodingAssignment, CodingProblem, LeetCodeStats, GitHubStats } from "@/types";
import { StudentScoreRecord } from "@/lib/coding/codingStore";

interface CodeRunTestDetail {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface CodeRunResultState {
  passed: boolean;
  message: string;
  details?: CodeRunTestDetail[];
}

export default function StudentCodingPage() {
  const { user } = useAuth();
  const studentRoll = user?.roll_number || "A23126511128";
  const studentName = user?.full_name || "Aripaka Karthik";

  // Platform Handles
  const [leetcodeUsername, setLeetcodeUsername] = useState("karthikaripaka");
  const [githubUsername, setGithubUsername] = useState("KarthikAripaka");

  // Profile Stats (Loaded dynamically from Real APIs)
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [isSyncingLeetCode, setIsSyncingLeetCode] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Active Assignments & Submissions
  const [assignments, setAssignments] = useState<CodingAssignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("assign_1");

  // Live Student Assessment State
  const [studentScore, setStudentScore] = useState<number>(0);
  const [studentMaxScore, setStudentMaxScore] = useState<number>(100);
  const [studentRank, setStudentRank] = useState<number>(1);
  const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);

  // Verification state
  const [verifyingSlug, setVerifyingSlug] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Code Runner Modal State
  const [activeCodeProblem, setActiveCodeProblem] = useState<CodingProblem | null>(null);
  const [userCode, setUserCode] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeRunResult, setCodeRunResult] = useState<CodeRunResultState | null>(null);

  // Starter templates for popular problems
  const starterCodeTemplates: Record<string, string> = {
    "two-sum": `// Two Sum: Given an array of integers and a target, return indices of two numbers that add up to target.
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    "best-time-to-buy-and-sell-stock": `// Best Time to Buy and Sell Stock: Return maximum profit you can achieve from one transaction.
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  return maxProfit;
}`,
    "valid-parentheses": `// Valid Parentheses: Determine if the input string has valid matching brackets.
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
    "container-with-most-water": `// Container With Most Water: Find two lines that together with the x-axis form a container containing the most water.
function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    max = Math.max(max, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}`,
  };

  // Sync Live LeetCode Data (100% Free GraphQL API)
  const fetchRealLeetCodeProfile = useCallback(async (usernameToFetch: string) => {
    setIsSyncingLeetCode(true);
    try {
      const res = await fetch(`/api/coding/leetcode/profile?username=${encodeURIComponent(usernameToFetch.trim())}`);
      const data = await res.json();
      if (data.stats) {
        setLeetcodeStats(data.stats);
        return data.stats;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("LeetCode fetch error:", errMsg);
    } finally {
      setIsSyncingLeetCode(false);
    }
    return null;
  }, []);

  // Sync Live GitHub Data (100% Free REST API)
  const fetchRealGitHubProfile = useCallback(async (usernameToFetch: string) => {
    setIsSyncingGitHub(true);
    try {
      const res = await fetch(`/api/coding/github/profile?username=${encodeURIComponent(usernameToFetch.trim())}`);
      const data = await res.json();
      if (data.stats) {
        setGithubStats(data.stats);
        return data.stats;
      }
    } catch (err: unknown) {
      console.warn("GitHub fetch error:", err);
    } finally {
      setIsSyncingGitHub(false);
    }
    return null;
  }, []);

  // Load student's saved submissions & current rank
  const loadSubmissions = useCallback(async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/coding/submissions?assignmentId=${assignmentId}`);
      const data = await res.json();
      if (data.scores) {
        const myRecord = data.scores.find((s: StudentScoreRecord) => s.rollNumber === studentRoll);
        if (myRecord) {
          setStudentScore(myRecord.score);
          setStudentMaxScore(myRecord.maxScore);
          setStudentRank(myRecord.rank);
          setSolvedSlugs(myRecord.solvedProblemSlugs || []);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load submissions:", err);
    }
  }, [studentRoll]);

  // Initial Load on Mount
  useEffect(() => {
    async function initPage() {
      setIsLoadingStats(true);

      // Load assignments
      try {
        const res = await fetch("/api/coding/assignments");
        const data = await res.json();
        if (data.assignments && data.assignments.length > 0) {
          setAssignments(data.assignments);
          setSelectedAssignmentId(data.assignments[0].id);
        }
      } catch (err: unknown) {
        console.error("Error loading assignments:", err);
      }

      // Fetch Real API Data
      await Promise.all([
        fetchRealLeetCodeProfile(leetcodeUsername),
        fetchRealGitHubProfile(githubUsername),
        loadSubmissions(selectedAssignmentId),
      ]);

      setIsLoadingStats(false);
    }

    initPage();
  }, [fetchRealLeetCodeProfile, fetchRealGitHubProfile, githubUsername, leetcodeUsername, loadSubmissions, selectedAssignmentId]);

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  // Manual LeetCode Refresh Button
  const handleManualSyncLeetCode = async () => {
    if (!leetcodeUsername.trim()) return;
    setSyncFeedback("Querying live LeetCode GraphQL endpoint...");
    const stats = await fetchRealLeetCodeProfile(leetcodeUsername);
    if (stats) {
      setSyncFeedback(`✅ Live LeetCode Synced: @${stats.username} (${stats.totalSolved} solved, Rank: #${stats.ranking.toLocaleString()})`);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Manual GitHub Refresh Button
  const handleManualSyncGitHub = async () => {
    if (!githubUsername.trim()) return;
    const stats = await fetchRealGitHubProfile(githubUsername);
    if (stats) {
      setSyncFeedback(`✅ Live GitHub Synced: @${stats.username} (${stats.publicRepos} public repositories)`);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Verify Single Problem via Live LeetCode GraphQL
  const handleVerifyOnLeetCode = async (problem: CodingProblem) => {
    setVerifyingSlug(problem.titleSlug);
    setVerificationMessage(null);

    try {
      const res = await fetch("/api/coding/assignments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: leetcodeUsername.trim(),
          problemSlug: problem.titleSlug,
          assignmentId: activeAssignment?.id || "assign_1",
          rollNumber: studentRoll,
          studentName,
          githubUsername,
        }),
      });

      const data = await res.json();
      setVerificationMessage(data.message);

      if (data.isSolved) {
        // Reload submissions to reflect score and rank
        await loadSubmissions(activeAssignment?.id || "assign_1");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setVerificationMessage(`⚠️ Verification error: ${errMsg}`);
    } finally {
      setVerifyingSlug(null);
    }
  };

  // Open Lab Code Runner for a Problem
  const handleOpenCodeRunner = (problem: CodingProblem) => {
    setActiveCodeProblem(problem);
    setUserCode(starterCodeTemplates[problem.titleSlug] || `// Solution for ${problem.title}\nfunction solution(input) {\n  // Write your code here\n  return input;\n}`);
    setCodeRunResult(null);
  };

  // Run Code against Official Test Cases & Submit
  const handleRunAndSubmit = async () => {
    if (!activeCodeProblem) return;
    setIsRunningCode(true);

    try {
      // 1. Evaluate Code locally/server-side against official test cases
      const evalRes = await fetch("/api/coding/submissions?action=evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: activeCodeProblem.titleSlug,
          code: userCode,
        }),
      });

      const evalData = await evalRes.json();
      const evaluation = evalData.evaluation;
      setCodeRunResult(evaluation);

      // 2. If test cases passed, record problem solved in persistent store
      if (evaluation.passed) {
        const subRes = await fetch("/api/coding/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId: activeAssignment?.id || "assign_1",
            rollNumber: studentRoll,
            studentName,
            leetcodeUsername,
            githubUsername,
            problemSlug: activeCodeProblem.titleSlug,
            verifiedLive: true,
          }),
        });

        const subData = await subRes.json();
        if (subData.record) {
          setStudentScore(subData.record.score);
          setStudentRank(subData.record.rank);
          setSolvedSlugs(subData.record.solvedProblemSlugs || []);
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setCodeRunResult({
        passed: false,
        message: `Execution failed: ${errMsg}`,
        details: [],
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5">
              Live Coding Assessment Engine
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">100% Real API Data • Zero Mock Data</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-500" />
            LeetCode Tracking & Lab Exam Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Student: <strong className="text-slate-900 dark:text-white">{studentName}</strong> ({studentRoll}) • Department of Information Technology (ANITS)
          </p>
        </div>

        {/* Global Score & Rank Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Your Exam Score</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {studentScore} / {studentMaxScore} pts
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Batch Rank</div>
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              Rank #{studentRank}
            </Badge>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Real Platform Profiles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real LeetCode Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-500">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    LeetCode Profile (Live GraphQL API)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Queried directly from <code className="text-[10px] text-emerald-500">leetcode.com/graphql</code>
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSyncLeetCode}
                disabled={isSyncingLeetCode}
                className="h-7 text-xs border-slate-300 dark:border-slate-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingLeetCode ? "animate-spin text-emerald-500" : ""}`} />
                <span>{isSyncingLeetCode ? "Fetching..." : "Sync"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Handle Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Handle:</span>
              <Input
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="Enter LeetCode username..."
                className="h-8 text-xs font-mono"
              />
              <a
                href={`https://leetcode.com/u/${leetcodeUsername}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="View on LeetCode"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Live Stats Display */}
            {isLoadingStats ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading real LeetCode data...
              </div>
            ) : leetcodeStats ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {leetcodeStats.totalSolved}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Solved</div>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {leetcodeStats.easySolved}
                    </div>
                    <div className="text-[10px] text-emerald-600">Easy</div>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                    <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {leetcodeStats.mediumSolved}
                    </div>
                    <div className="text-[10px] text-amber-600">Medium</div>
                  </div>
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800/40">
                    <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {leetcodeStats.hardSolved}
                    </div>
                    <div className="text-[10px] text-rose-600">Hard</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Global Ranking:{" "}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      #{leetcodeStats.ranking.toLocaleString()}
                    </strong>
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-[10px]">
                    ● Live GraphQL Verified
                  </Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Real GitHub Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    GitHub Profile (Live REST API)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Queried directly from <code className="text-[10px] text-indigo-500">api.github.com/users</code>
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSyncGitHub}
                disabled={isSyncingGitHub}
                className="h-7 text-xs border-slate-300 dark:border-slate-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingGitHub ? "animate-spin text-indigo-500" : ""}`} />
                <span>{isSyncingGitHub ? "Fetching..." : "Sync"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Handle Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Handle:</span>
              <Input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter GitHub username..."
                className="h-8 text-xs font-mono"
              />
              <a
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="View on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Live Stats Display */}
            {isLoadingStats ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading real GitHub data...
              </div>
            ) : githubStats ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {githubStats.publicRepos}
                    </div>
                    <div className="text-[10px] text-slate-400">Public Repos</div>
                  </div>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                    <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      {githubStats.followers}
                    </div>
                    <div className="text-[10px] text-indigo-600">Followers</div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {new Date(githubStats.createdAt).getFullYear()}
                    </div>
                    <div className="text-[10px] text-slate-400">Member Since</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Portfolio: <strong className="text-slate-800 dark:text-slate-200">github.com/{githubStats.username}</strong></span>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 text-[10px]">
                    ● Real GitHub Verified
                  </Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Active Assignment / Exam Section */}
      <div className="space-y-4">
        {/* Assignment Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Exam / Assignment:</span>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                loadSubmissions(e.target.value);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.problems.length} problems, {a.totalPoints} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Due Date: <strong className="text-slate-700 dark:text-slate-300">{activeAssignment ? new Date(activeAssignment.deadline).toLocaleString() : ""}</strong>
          </div>
        </div>

        {/* Verification Message Alert */}
        {verificationMessage && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between">
            <span>{verificationMessage}</span>
            <button onClick={() => setVerificationMessage(null)} className="text-indigo-400 hover:text-indigo-600 font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* Problems List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Assigned Problems in Exam
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {activeAssignment?.problems.map((problem) => {
              const isSolved = solvedSlugs.includes(problem.titleSlug.toLowerCase());

              return (
                <div
                  key={problem.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSolved
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSolved
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isSolved ? <Check className="w-4 h-4" /> : `#${problem.frontendId}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {problem.title}
                          </h4>
                          <Badge
                            className={`text-[9px] px-1.5 py-0 ${
                              problem.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : problem.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}
                          >
                            {problem.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500">
                            {problem.points} Points
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {problem.topicTags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Open on LeetCode</span>
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyOnLeetCode(problem)}
                        disabled={verifyingSlug === problem.titleSlug}
                        className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${verifyingSlug === problem.titleSlug ? "animate-spin" : ""}`}
                        />
                        <span>{verifyingSlug === problem.titleSlug ? "Checking..." : "Verify on LeetCode"}</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenCodeRunner(problem)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Solve in Lab Code Runner</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CODE RUNNER MODAL (IN-BROWSER LAB EXAM IDE) */}
      {activeCodeProblem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-emerald-500" />
                  Lab Exam Code Runner: #{activeCodeProblem.frontendId} {activeCodeProblem.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Write and test your solution. Passes are automatically submitted and reflected in Faculty Score Listing.
                </p>
              </div>
              <button
                onClick={() => setActiveCodeProblem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Solution Code (JavaScript / Node):</span>
                  <span className="text-[10px] text-slate-400">Award: {activeCodeProblem.points} Points upon Accepted (AC)</span>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={12}
                  className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  spellCheck={false}
                />
              </div>

              {/* Test Results Output Box */}
              {codeRunResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    codeRunResult.passed
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-2">
                    {codeRunResult.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{codeRunResult.message}</span>
                  </div>

                  {codeRunResult.details && codeRunResult.details.length > 0 && (
                    <div className="space-y-1.5 mt-2 font-mono text-[11px]">
                      {codeRunResult.details.map((t: CodeRunTestDetail, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-black/10 dark:bg-black/30 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-slate-500">Test {idx + 1}:</span> {t.input}
                            <span className="text-slate-500 block text-[10px]">
                              Expected: {t.expected} | Actual: {t.actual}
                            </span>
                          </div>
                          <Badge
                            className={`text-[9px] ${
                              t.passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}
                          >
                            {t.passed ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {codeRunResult.passed && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      🎉 Problem Marked as Solved! +{activeCodeProblem.points} Points Recorded. Faculty Score Listing &amp; Batch Rank Updated!
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Evaluation executes tests safely against official LeetCode cases
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCodeProblem(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunAndSubmit}
                  disabled={isRunningCode}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? "animate-spin" : ""}`} />
                  <span>{isRunningCode ? "Evaluating..." : "Run Test Cases & Submit"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
