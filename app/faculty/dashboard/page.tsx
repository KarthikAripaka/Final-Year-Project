"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Users,
  Briefcase,
  Bell,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  BookOpen,
  Send,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Download,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface StudentReadinessRecord {
  id: string;
  name: string;
  rollNumber: string;
  cgpa: number;
  backlogs: number;
  targetRole: string;
  readinessScore: number; // 0 - 100%
  verifiedSkills: string[];
  skillGaps: string[];
  recommendedAction: string;
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { notices, addNotice, placements } = useCampusStore();

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<any>("ACADEMIC");
  const [noticePriority, setNoticePriority] = useState<any>("HIGH");
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Student Search & Filter in Faculty Readiness Dashboard
  const [studentSearch, setStudentSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentReadinessRecord | null>(null);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Student Capstone Abstracts
  const [capstoneProjects, setCapstoneProjects] = useState([
    {
      id: "proj_01",
      title: "AI Smart Campus Assistant with Grounded RAG & Gmail Intelligence",
      leadStudent: "Aripaka Karthik (A23126511128)",
      batch: "2023-2027 (IV/IV B.Tech IT)",
      guide: "Prof. K. Srinivas",
      status: "APPROVED",
      score: "9.2/10",
    },
    {
      id: "proj_02",
      title: "Decentralized Credential Verification using Polygon Blockchain",
      leadStudent: "P. Sneha (323126511082)",
      batch: "2023-2027 (IV/IV B.Tech IT)",
      guide: "Dr. B. Rama Devi",
      status: "PENDING_REVIEW",
      score: "--",
    },
    {
      id: "proj_03",
      title: "Deep Learning for Automated Diabetic Retinopathy Screening",
      leadStudent: "V. Sai Teja (323126511099)",
      batch: "2023-2027 (IV/IV B.Tech IT)",
      guide: "Prof. M. Ramakrishna",
      status: "APPROVED",
      score: "8.8/10",
    },
  ]);

  // Batch Placement Readiness Records (Calculated from Student Profile Analysis & Skill Gap Analyzer)
  const [readinessRecords] = useState<StudentReadinessRecord[]>([
    {
      id: "stud_1",
      name: "Aripaka Karthik",
      rollNumber: "A23126511128",
      cgpa: 8.65,
      backlogs: 0,
      targetRole: "Full Stack Software Engineer",
      readinessScore: 88,
      verifiedSkills: ["Java", "DSA", "SQL", "Git", "React", "Next.js", "TypeScript", "Tailwind CSS"],
      skillGaps: ["System Design (HLD/LLD)", "Distributed Caching (Redis)", "Docker"],
      recommendedAction: "Eligible for Tier-1 Super Dream Drives. Recommended: Complete 2 System Design mock interviews.",
    },
    {
      id: "stud_2",
      name: "P. Sneha",
      rollNumber: "323126511082",
      cgpa: 8.92,
      backlogs: 0,
      targetRole: "Cloud & DevOps Engineer",
      readinessScore: 82,
      verifiedSkills: ["Python", "Linux", "Git", "Docker", "AWS Cloud Practitioner"],
      skillGaps: ["Kubernetes (K8s)", "Terraform IaC", "CI/CD Pipeline Security"],
      recommendedAction: "High potential. Complete end-to-end Kubernetes cluster deployment lab.",
    },
    {
      id: "stud_3",
      name: "V. Sai Teja",
      rollNumber: "323126511099",
      cgpa: 8.41,
      backlogs: 0,
      targetRole: "AI / Machine Learning Engineer",
      readinessScore: 85,
      verifiedSkills: ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "SQL", "Deep Learning"],
      skillGaps: ["MLOps (Model Serving)", "Vector Databases (RAG)", "CUDA Optimization"],
      recommendedAction: "Strong ML foundation. Focus on production RAG inference pipelines and FastAPI deployment.",
    },
    {
      id: "stud_4",
      name: "K. Rohit",
      rollNumber: "323126511054",
      cgpa: 7.28,
      backlogs: 0,
      targetRole: "Full Stack Software Engineer",
      readinessScore: 68,
      verifiedSkills: ["C++", "HTML/CSS", "JavaScript", "SQL"],
      skillGaps: ["DSA (Dynamic Programming & Graphs)", "React.js", "Git Collaboration"],
      recommendedAction: "Requires DSA remedial sessions. Target at least 40 LeetCode Medium problems before campus drives.",
    },
    {
      id: "stud_5",
      name: "M. Divya",
      rollNumber: "323126511071",
      cgpa: 7.95,
      backlogs: 0,
      targetRole: "Data Analyst / BI Specialist",
      readinessScore: 78,
      verifiedSkills: ["Python", "SQL", "PowerBI", "Excel Advanced", "Statistics"],
      skillGaps: ["Tableau Advanced", "ETL Pipelines (Airflow)", "NoSQL (MongoDB)"],
      recommendedAction: "Solid analytical capability. Build capstone project featuring automated ETL pipeline.",
    },
    {
      id: "stud_6",
      name: "Sravan Kumar",
      rollNumber: "A23126511127",
      cgpa: 6.94,
      backlogs: 1,
      targetRole: "Software Engineer",
      readinessScore: 58,
      verifiedSkills: ["Java", "HTML", "Basics of C"],
      skillGaps: ["DSA Core Concepts", "Database Management (DBMS)", "OOP Design Patterns", "Clear Active Backlog"],
      recommendedAction: "Critical: Priority backlog clearance and mandatory department coding practice.",
    },
  ]);

  // Aggregate Departmental Skill Gaps for the batch
  const departmentalGaps = useMemo(() => [
    { skill: "System Design & Architecture", deficitCount: 88, percentage: 48 },
    { skill: "Docker & Containerization", deficitCount: 72, percentage: 39 },
    { skill: "Advanced DSA (Graphs & DP)", deficitCount: 65, percentage: 35 },
    { skill: "Cloud Services (AWS/GCP)", deficitCount: 58, percentage: 31 },
    { skill: "CI/CD & DevOps Automation", deficitCount: 46, percentage: 25 },
  ], []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return readinessRecords.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.targetRole.toLowerCase().includes(studentSearch.toLowerCase());
      const matchRole = roleFilter === "ALL" || s.targetRole.includes(roleFilter);
      return matchQuery && matchRole;
    });
  }, [readinessRecords, studentSearch, roleFilter]);

  // Average batch readiness score
  const averageReadiness = useMemo(() => {
    const total = readinessRecords.reduce((acc, curr) => acc + curr.readinessScore, 0);
    return Math.round(total / readinessRecords.length);
  }, [readinessRecords]);

  // Export / Generate Placement Readiness Report (as depicted in Architecture Diagram)
  const handleRequestReadinessReport = () => {
    setIsExportingReport(true);
    setExportSuccessMessage(null);

    setTimeout(() => {
      // Create and trigger download of CSV report
      const headers = ["Roll Number", "Student Name", "CGPA", "Active Backlogs", "Target Role", "Readiness Score (%)", "Skill Gaps", "Recommended Action"];
      const rows = readinessRecords.map((r) => [
        `"${r.rollNumber}"`,
        `"${r.name}"`,
        r.cgpa,
        r.backlogs,
        `"${r.targetRole}"`,
        `${r.readinessScore}%`,
        `"${r.skillGaps.join("; ")}"`,
        `"${r.recommendedAction}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ANITS_IT_Placement_Readiness_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportingReport(false);
      setExportSuccessMessage("✅ Official ANITS Departmental Placement Readiness Report downloaded successfully!");
      setTimeout(() => setExportSuccessMessage(null), 5000);
    }, 800);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeDesc) return;

    setIsPosting(true);
    setTimeout(() => {
      addNotice({
        title: noticeTitle,
        description: noticeDesc,
        category: noticeCategory,
        priority: noticePriority,
        status: "PUBLISHED",
        created_by: user?.full_name || "Faculty Office",
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
      });
      setNoticeTitle("");
      setNoticeDesc("");
      setIsPosting(false);
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    }, 500);
  };

  const handleApproveProject = (id: string) => {
    setCapstoneProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "APPROVED", score: "9.0/10" } : p))
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {user?.full_name || "Prof. K. Srinivas"}
              </h1>
              <Badge variant="success" size="sm">FACULTY PORTAL</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Department of {user?.department_name || "Information Technology"} • ANITS Autonomous (R20/R23)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRequestReadinessReport}
            isLoading={isExportingReport}
            variant="primary"
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500"
          >
            <Download className="w-4 h-4" /> Request Readiness Report
          </Button>
          <Link href="/student/assistant" prefetch={true}>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Academic AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {exportSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">B.Tech IT Students</span>
              <strong className="text-xl font-bold text-white">184 Enrolled</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-800/40 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Avg Placement Readiness</span>
              <strong className="text-xl font-bold text-emerald-400">{averageReadiness}% Ready</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Active Placement Drives</span>
              <strong className="text-xl font-bold text-white">{placements.length} Companies</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Skill Deficit Attention</span>
              <strong className="text-xl font-bold text-rose-400">88 Students</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PLACEMENT READINESS DASHBOARD (As in System Architecture Diagram) */}
      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Faculty Placement Readiness Dashboard
              </CardTitle>
              <Badge variant="success" size="sm" className="font-mono text-[10px]">
                READINESS SCORE CALCULATOR
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Monitors individual student readiness scores, analyzes departmental skill gaps, and dispenses targeted learning interventions.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student or roll..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="DevOps">DevOps</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Target Career Role</th>
                  <th className="py-3 px-4">Academic Status</th>
                  <th className="py-3 px-4">Readiness Score</th>
                  <th className="py-3 px-4">Key Skill Gaps</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((stud) => {
                  const scoreColor =
                    stud.readinessScore >= 80
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      : stud.readinessScore >= 65
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/30";

                  const progressColor =
                    stud.readinessScore >= 80 ? "bg-emerald-500" : stud.readinessScore >= 65 ? "bg-amber-500" : "bg-rose-500";

                  return (
                    <tr key={stud.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-white block font-medium">{stud.name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">{stud.rollNumber}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {stud.targetRole}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-indigo-300 font-mono">CGPA: {stud.cgpa}</span>
                        <span className="text-[10px] block text-slate-400">
                          {stud.backlogs === 0 ? "0 Backlogs" : `${stud.backlogs} Active Backlog`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold font-mono ${scoreColor}`}>
                            {stud.readinessScore}%
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div className={`h-full ${progressColor}`} style={{ width: `${stud.readinessScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {stud.skillGaps.slice(0, 2).map((gap, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              {gap}
                            </span>
                          ))}
                          {stud.skillGaps.length > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{stud.skillGaps.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => setSelectedStudent(stud)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                        >
                          Analyze
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: INDIVIDUAL STUDENT PROFILE ANALYSIS (As in Architecture Diagram) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Student Profile & Skill Gap Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedStudent.name} ({selectedStudent.rollNumber}) • Target: {selectedStudent.targetRole}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Calculated Readiness</span>
                <strong className="text-emerald-400 text-lg font-bold font-mono">{selectedStudent.readinessScore}%</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Academic Standing</span>
                <strong className="text-white text-sm font-semibold">CGPA {selectedStudent.cgpa} ({selectedStudent.backlogs} Backlogs)</strong>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-2">Verified Mastered Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.verifiedSkills.map((sk, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 mb-2">Identified Skill Gaps for {selectedStudent.targetRole}</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skillGaps.map((gap, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {gap}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Faculty Learning Recommendation:</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">{selectedStudent.recommendedAction}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button onClick={() => setSelectedStudent(null)} variant="primary" size="sm">
                Close Analysis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENTAL SKILL GAP AGGREGATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Department-Wide Skill Gap Intelligence
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Aggregated across 184 IV/IV B.Tech IT students to prioritize technical workshops and faculty electives.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {departmentalGaps.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.skill}</span>
                  <span className="text-rose-400 font-mono text-[11px] font-semibold">
                    {item.deficitCount} students deficit ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Post Notice / Department Circular */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Dispatch Department Circular
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Broadcasts to students via Student Dashboard, Notification Bell, and Gmail sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Notice dispatched to all departmental students successfully!
              </div>
            )}
            <form onSubmit={handlePostNotice} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Headline</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. System Design Remedial Workshop Schedule"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="PLACEMENT">PLACEMENT</option>
                    <option value="PROJECT">PROJECT</option>
                    <option value="EXAM">EXAM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Details</label>
                <textarea
                  rows={2}
                  value={noticeDesc}
                  onChange={(e) => setNoticeDesc(e.target.value)}
                  placeholder="State guidelines and schedule..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <Button type="submit" isLoading={isPosting} variant="primary" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500">
                Publish Circular
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Capstone Project Review Submissions */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Capstone Project Review Submissions
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Review Phase-1 project abstracts and evaluation marks for 2023-2027 batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {capstoneProjects.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <Badge variant={p.status === "APPROVED" ? "success" : "warning"} size="sm">
                    {p.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lead: <strong className="text-slate-300">{p.leadStudent}</strong>
                </p>
                <p className="text-[11px] text-slate-500">Guide: {p.guide}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Score: <strong className="text-indigo-400">{p.score}</strong></span>
                {p.status !== "APPROVED" ? (
                  <Button
                    onClick={() => handleApproveProject(p.id)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                  >
                    Approve
                  </Button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guide Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
