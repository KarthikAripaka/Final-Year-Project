"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
} from "lucide-react";
import Link from "next/link";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { notices, addNotice, placements } = useCampusStore();

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<any>("ACADEMIC");
  const [noticePriority, setNoticePriority] = useState<any>("HIGH");
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Sample student capstone abstracts pending review
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
    <div className="flex flex-col gap-8">
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
          <Link href="/student/assistant" prefetch={true}>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Academic AI Assistant
            </Button>
          </Link>
          <Link href="/admin/notices" prefetch={true}>
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Manage All Circulars
            </Button>
          </Link>
        </div>
      </div>

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

        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Capstone Phase-1</span>
              <strong className="text-xl font-bold text-white">12 Pending Review</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Attendance & Condonation</span>
              <strong className="text-xl font-bold text-white">8 Condonations</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Post Notice / Department Circular */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Dispatch Department Circular / Notice
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Immediately alerts students via Student Dashboard, Notification Bell, and Desktop Push.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Notice dispatched to all departmental students successfully!
              </div>
            )}
            <form onSubmit={handlePostNotice} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. IV/IV B.Tech IT Project Review Schedule & Guidelines"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="EXAM">EXAM</option>
                    <option value="PROJECT">CAPSTONE PROJECT</option>
                    <option value="PLACEMENT">PLACEMENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Circular Details</label>
                <textarea
                  rows={3}
                  value={noticeDesc}
                  onChange={(e) => setNoticeDesc(e.target.value)}
                  placeholder="State guidelines, submission deadlines, and lab requirements..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <Button type="submit" isLoading={isPosting} variant="primary" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500">
                Publish & Broadcast Circular
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Final Year Capstone Review Submissions */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Capstone Project Review Submissions
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Review Phase-1 project abstracts and evaluation marks for 2023-2027 batch.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {capstoneProjects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lead: <strong className="text-slate-300">{p.leadStudent}</strong> • Guide: {p.guide}
                    </p>
                  </div>
                  <Badge variant={p.status === "APPROVED" ? "success" : "warning"} size="sm">
                    {p.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">Evaluation: <strong className="text-indigo-400">{p.score}</strong></span>
                  {p.status !== "APPROVED" ? (
                    <Button
                      onClick={() => handleApproveProject(p.id)}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                    >
                      Approve Abstract
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
    </div>
  );
}
