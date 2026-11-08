"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  BookOpen,
  Terminal,
  GraduationCap,
  Layers,
  FileCheck2,
  BarChart,
} from "lucide-react";
import { SkillGapAnalysis, LearningRoadmap, StudentSkill } from "@/types";

export default function SkillsPage() {
  const { user } = useAuth();
  const { skills, addSkill } = useCampusStore();

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<StudentSkill["proficiency_level"]>("INTERMEDIATE");
  const [newSkillCategory, setNewSkillCategory] = useState<StudentSkill["category"]>("Programming");

  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isLoading, setIsLoading] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>({
    role_title: "Full Stack Software Engineer",
    strong_skills: ["Java", "SQL", "Git", "React", "Next.js", "TypeScript", "Tailwind CSS"],
    needs_improvement: ["Data Structures & Algorithms (Advanced DP & Graphs)", "RESTful API Security"],
    missing_skills: ["System Design (High & Low Level Design)", "Distributed Caching (Redis)", "Docker & Containerization"],
    readiness_summary: "High potential candidate with strong full-stack web and core programming fundamentals (88% Industry Readiness Score). Eligible for Tier-1 Super Dream placement drives (Accenture, Amazon, TCS Digital). Focus next 4 weeks on High-Level System Design and Redis caching.",
  });
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>({
    role_title: "Full Stack Software Engineer",
    total_days: 28,
    daily_schedule: [
      {
        day: 1,
        topic: "System Design Fundamentals — Scalability & Load Balancing",
        objective: "Understand horizontal vs vertical scaling, load balancers (Nginx, Round Robin, Least Connections), and stateless app servers.",
        resources: ["System Design Primer (GitHub)", "Grokking the System Design Interview"],
      },
      {
        day: 7,
        topic: "Database Indexing & Distributed Caching with Redis",
        objective: "Implement Redis cache-aside pattern, TTL eviction policies, and compare B-Tree vs Hash indexing in PostgreSQL.",
        resources: ["Redis University RU101", "PostgreSQL Official Indexing Guide"],
      },
      {
        day: 14,
        topic: "Advanced Graph Algorithms & Dynamic Programming",
        objective: "Solve 10 LeetCode Medium/Hard problems on Topological Sort, Dijkstra's algorithm, and Knapsack memoization.",
        resources: ["LeetCode 75", "NeetCode Graph & 2D-DP Roadmap"],
      },
      {
        day: 21,
        topic: "Docker Containerization & Microservice Deployment",
        objective: "Containerize multi-container Next.js + Node.js backend using Dockerfile and Docker Compose with health checks.",
        resources: ["Docker Official Hands-On Labs", "FullStack Open Part 12 (Containers)"],
      },
      {
        day: 28,
        topic: "Mock Technical Interview & Behavioral STAR Presentation",
        objective: "Conduct full mock technical rounds covering DSA whiteboard coding and capstone architecture walkthrough.",
        resources: ["Pramp Mock Interviews", "ANITS Placement Cell Mock Guidelines"],
      },
    ],
    tips: [
      "Prepare STAR-method explanations for your Final Year Capstone Project.",
      "Review time complexity analysis for all data structures before company coding rounds.",
    ],
  });

  // Student Profile Data
  const studentName = user?.full_name || "Aripaka Karthik";
  const studentRoll = user?.roll_number || "A23126511128";
  const studentDept = user?.department_name || "Information Technology";
  const studentCgpa = user?.cgpa || 8.65;
  const studentBacklogs = user?.active_backlogs ?? 0;

  // Coding Profiles Data
  const [codingProfiles] = useState({
    leetcode: {
      username: "karthikaripaka",
      solvedTotal: 185,
      easy: 60,
      medium: 105,
      hard: 20,
      contestRating: 1620,
      badge: "Knight (Top 12%)",
    },
    github: {
      username: "KarthikAripaka",
      publicRepos: 14,
      totalCommits: 320,
      topLanguages: ["TypeScript", "Java", "Python", "SQL"],
    },
    hackerrank: {
      username: "karthikaripaka",
      badges: ["5-Star Problem Solving", "Gold Badge (Java)", "Silver Badge (SQL)"],
    },
  });

  // Verified Academic Projects
  const [projects] = useState([
    {
      title: "AI Smart Campus Assistant with Grounded RAG & Gmail Intelligence",
      category: "Final Year Capstone Project (IT415)",
      techStack: ["Next.js", "TypeScript", "Groq LLM", "pgvector", "Web Speech API"],
      status: "Guide Verified (9.2/10)",
    },
    {
      title: "Distributed Enterprise Microservices Architecture",
      category: "Advanced Lab Project (IT411)",
      techStack: ["Java Spring Boot", "PostgreSQL", "Docker", "Redis"],
      status: "Completed",
    },
    {
      title: "Automated Student Attendance & Condonation Auditor",
      category: "Department Practical",
      techStack: ["Node.js", "Express", "PostgreSQL", "Tailwind CSS"],
      status: "Completed",
    },
  ]);

  // Industry Certifications
  const [certifications] = useState([
    {
      name: "AWS Certified Cloud Practitioner (CLF-C02)",
      issuer: "Amazon Web Services (AWS)",
      issuedDate: "August 2026",
      status: "Verified",
    },
    {
      name: "Oracle Certified Associate, Java SE 8 Programmer (OCAJP)",
      issuer: "Oracle University",
      issuedDate: "May 2026",
      status: "Verified",
    },
    {
      name: "NPTEL Elite Certificate: Programming in Java & DSA",
      issuer: "IIT Kharagpur / Ministry of Education",
      issuedDate: "April 2026",
      status: "Score: 84% (Elite)",
    },
  ]);

  // Assessment Results
  const [assessmentResults] = useState({
    examName: "Campus Pre-Placement Diagnostic Assessment (AMCAT / CoCubes)",
    percentile: "88.5th Percentile",
    quantitative: 85,
    logical: 92,
    programming: 90,
    verbal: 87,
  });

  // Industry Readiness Score Breakdown (Weighted Formula)
  // Academic (25%): 92%, Coding (25%): 85%, Skills (30%): 89%, Certifications/Assessments (20%): 86% -> Total: 88%
  const readinessScore = 88;

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    addSkill(newSkillName.trim(), newSkillCategory, newSkillLevel);
    setNewSkillName("");
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/skills/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentSkills: skills,
          targetRole: {
            id: "role_1",
            title: targetRole,
            description: "Full-stack software engineering role",
            required_skills: ["Java", "DSA", "OOP", "DBMS", "SQL", "Git", "System Design", "Docker"],
          },
        }),
      });
      const data = await res.json();
      if (data.gapAnalysis) setGapAnalysis(data.gapAnalysis);
      if (data.learningRoadmap) setRoadmap(data.learningRoadmap);
    } catch (err) {
      console.error("Skill gap analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">Placement Preparedness & Industry Readiness</h1>
              <Badge variant="success" size="sm" className="font-mono text-[10px]">
                READINESS CALCULATOR
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {studentName} ({studentRoll}) • Department of {studentDept} • ANITS Autonomous Class of 2027
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            options={[
              { label: "Software Engineer", value: "Software Engineer" },
              { label: "Cloud & DevOps Engineer", value: "Cloud Consultant" },
              { label: "AI / ML Engineer", value: "Data Engineer" },
            ]}
          />
          <Button onClick={handleRunAnalysis} isLoading={isLoading} variant="primary" size="sm" className="gap-2 bg-amber-600 hover:bg-amber-500 text-white">
            <Sparkles className="w-4 h-4" /> Recalculate Readiness
          </Button>
        </div>
      </div>

      {/* COMPREHENSIVE INDUSTRY READINESS SCORE METER */}
      <Card className="border-amber-500/30 bg-slate-900/90 shadow-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Overall Score Circle Gauge */}
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Industry Readiness Score</span>
              <div className="my-3 relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-amber-400 font-mono">{readinessScore}%</span>
                </div>
              </div>
              <Badge variant="success" size="sm" className="gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> TIER-1 SUPER DREAM READY
              </Badge>
              <span className="text-[10px] text-slate-400 mt-1.5">Eligible: Accenture (₹9.5L), Amazon (₹44L)</span>
            </div>

            {/* Score Breakdown Bars (Academic, Coding, Skills, Certs) */}
            <div className="md:col-span-3 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-indigo-400" /> Multi-Dimensional Profile Evaluation Breakdown
                </h3>
                <span className="text-xs text-slate-400 font-mono">Weighted Cumulative Model</span>
              </div>

              {/* 1. Academic Performance */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Academic Standing (25% weight): CGPA {studentCgpa}, {studentBacklogs} Backlogs, 86.4% Attendance
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              {/* 2. Coding Profiles */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" /> Coding Profiles (25% weight): LeetCode 185 Solved, GitHub 14 Repos, HackerRank 5-Star
                  </span>
                  <span className="text-sky-400 font-mono font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              {/* 3. Tech Skills & Projects */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" /> Technical Skills & Capstone Projects (30% weight): Java, DSA, SQL, Next.js Capstone
                  </span>
                  <span className="text-amber-400 font-mono font-bold">89%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "89%" }} />
                </div>
              </div>

              {/* 4. Certifications & Assessments */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-rose-400" /> Certifications & Diagnostic Assessments (20% weight): AWS Certified, 88.5th Percentile
                  </span>
                  <span className="text-rose-400 font-mono font-bold">86%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "86%" }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-GRID PROFILE PILLARS (Academic, Coding, Projects, Certifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Academic Performance */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" /> Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Cumulative CGPA</span>
              <strong className="text-white font-mono">{studentCgpa} / 10.0</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Active Backlogs</span>
              <span className="text-emerald-400 font-bold">0 Backlogs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Semester Attendance</span>
              <span className="text-indigo-400 font-mono font-bold">86.4%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Condonation Status</span>
              <span className="text-emerald-400 font-medium">Eligible</span>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 2: Coding Profiles */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" /> Coding Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">LeetCode Solved</span>
              <strong className="text-amber-400 font-mono">{codingProfiles.leetcode.solvedTotal} Problems</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Difficulty Split</span>
              <span className="text-slate-300 font-mono text-[11px]">60E / 105M / 20H</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">GitHub Repos</span>
              <strong className="text-white font-mono">{codingProfiles.github.publicRepos} Repos (320 Commits)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">HackerRank</span>
              <span className="text-emerald-400 font-medium">{codingProfiles.hackerrank.badges[0]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 3: Verified Projects */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Technical Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            {projects.slice(0, 2).map((proj, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <strong className="text-white block text-[11px] truncate">{proj.title}</strong>
                <span className="text-[10px] text-indigo-400 block mt-0.5">{proj.category}</span>
                <span className="text-[9px] text-emerald-400 font-medium">{proj.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pillar 4: Certifications & Assessment */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-rose-400" /> Certifications & Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">AMCAT Diagnostic</span>
              <strong className="text-rose-400 font-mono font-bold">{assessmentResults.percentile}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Logical Reasoning</span>
              <span className="text-white font-mono">{assessmentResults.logical}% Score</span>
            </div>
            {certifications.slice(0, 1).map((cert, idx) => (
              <div key={idx} className="py-1">
                <span className="text-[11px] text-slate-300 block truncate font-medium">{cert.name}</span>
                <span className="text-[10px] text-emerald-400">{cert.issuer} • {cert.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SKILLS MATRIX & SKILL GAP ANALYZER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Skills Matrix Manager */}
        <div className="flex flex-col gap-6">
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm text-white">Your Technical Skills Matrix ({skills.length})</CardTitle>
              <CardDescription className="text-xs text-slate-400">Add or update your verified competencies.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Docker, Redis, Kubernetes"
                />
                <div className="flex gap-2">
                  <Select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as StudentSkill["category"])}
                    options={[
                      { label: "Programming", value: "Programming" },
                      { label: "Frameworks", value: "Frameworks" },
                      { label: "Databases", value: "Databases" },
                      { label: "DSA", value: "DSA" },
                      { label: "Cloud", value: "Cloud" },
                      { label: "Tools", value: "Tools" },
                    ]}
                  />
                  <Select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as StudentSkill["proficiency_level"])}
                    options={[
                      { label: "Beginner", value: "BEGINNER" },
                      { label: "Intermediate", value: "INTERMEDIATE" },
                      { label: "Advanced", value: "ADVANCED" },
                    ]}
                  />
                </div>
                <Button onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />} variant="primary" size="sm">
                  Add Skill to Matrix
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {skills.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{s.skill_name}</span>
                      <p className="text-[10px] text-slate-400">{s.category}</p>
                    </div>
                    <Badge variant={s.proficiency_level === "ADVANCED" ? "success" : s.proficiency_level === "INTERMEDIATE" ? "primary" : "outline"} size="sm">
                      {s.proficiency_level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 span): Skill Gap Analysis & Personalized Roadmap */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Skill Gap Analysis Box */}
          <Card className="border-indigo-500/30 bg-slate-900/90 shadow-xl">
            <CardHeader className="flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Skill Gap Analysis — {targetRole}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Evaluated against top recruiters (Accenture, Amazon, Deloitte, TCS Digital).
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 pt-4">
              {gapAnalysis && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-200 leading-relaxed font-medium">
                    <strong className="text-white block mb-1">Executive AI Evaluation:</strong>
                    {gapAnalysis.readiness_summary}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Strong Verified Skills ({gapAnalysis.strong_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.strong_skills.map((sk, i) => (
                          <Badge key={i} variant="success" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Needs Practice ({gapAnalysis.needs_improvement.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.needs_improvement.map((sk, i) => (
                          <Badge key={i} variant="warning" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/60">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Missing Industry Gaps ({gapAnalysis.missing_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.missing_skills.map((sk, i) => (
                          <Badge key={i} variant="danger" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalized Learning Roadmap */}
          {roadmap && (
            <Card className="border-slate-800 bg-slate-900/90 shadow-xl animate-in fade-in duration-200">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" /> Personalized {roadmap.total_days}-Day Placement Learning Roadmap
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Customized day-by-day technical curriculum bridging identified gaps for {roadmap.role_title}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                {roadmap.daily_schedule.map((item) => (
                  <div key={item.day} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      D{item.day}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{item.topic}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.objective}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.resources.map((res, idx) => (
                          <span key={idx} className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-900/60">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
