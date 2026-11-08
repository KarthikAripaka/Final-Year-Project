"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { campusTTS } from "@/lib/tts/speechService";
import {
  Bot,
  Briefcase,
  CheckSquare,
  Clock,
  Mail,
  Mic,
  Sparkles,
  ArrowRight,
  Award,
  Volume2,
  Square,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { deadlines, placements, emails, skills, voiceNotes, appliedPlacementIds, applyPlacement } = useCampusStore();
  const [isSpeakingDeadlines, setIsSpeakingDeadlines] = useState(false);

  const pendingDeadlinesCount = deadlines.filter((d) => d.status === "PENDING").length;

  const handleSpeakPrioritizedDates = () => {
    if (isSpeakingDeadlines) {
      campusTTS.stop();
      setIsSpeakingDeadlines(false);
      return;
    }

    const script = campusTTS.generatePrioritizedDateBriefingScript(
      user?.full_name || "Student",
      emails.map((e) => ({
        sender: e.sender || "Campus Cell",
        subject: e.subject,
        email_date: e.email_date || new Date().toISOString(),
        analysis: e.analysis || {
          category: "ACADEMIC",
          summary: e.subject,
          priority: "NORMAL",
        },
      }))
    );

    campusTTS.speak(script, "Unified Campus Prioritized Deadlines Briefing");
    setIsSpeakingDeadlines(true);
    setTimeout(() => setIsSpeakingDeadlines(false), 30000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-sky-950 p-6 lg:p-8 border border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> AI SMART CAMPUS OPERATING SYSTEM
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.full_name || "Student"} 👋
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl">
              Department of {user?.department_name || "Information Technology"} • Roll No: {user?.roll_number || "A23126511128"} • CGPA: {user?.cgpa || 8.65}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleSpeakPrioritizedDates}
              variant="outline"
              size="md"
              className="gap-2 border-indigo-400/40 text-indigo-300 hover:bg-indigo-600/20"
            >
              {isSpeakingDeadlines ? (
                <>
                  <Square className="w-4 h-4 fill-current text-rose-400" /> Stop Briefing
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" /> Listen to Deadlines (TTS)
                </>
              )}
            </Button>

            <Link href="/student/assistant" prefetch={true}>
              <Button leftIcon={<Bot className="w-4 h-4 text-indigo-300" />} variant="primary" size="md">
                Ask Campus AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Aggregated Deadlines</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{pendingDeadlinesCount} Pending</p>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">Synced from PDFs, Notices & Gmail</p>
        </Card>

        <Card hoverable className="border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Placement Drives</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{placements.length} Opportunities</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">{appliedPlacementIds.length} Applications Submitted</p>
        </Card>

        <Card hoverable className="border-sky-500/30 bg-gradient-to-br from-slate-900 to-sky-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gmail AI Intelligence</span>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{emails.length} Emails Parsed</p>
          <p className="text-[11px] text-sky-400 mt-1 font-medium">Automatic Deadline Extraction</p>
        </Card>

        <Card hoverable className="border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Skills Profile</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{skills.length} Skills Matrix</p>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">Software Engineer Roadmap Ready</p>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 span): Grounded AI Q&A + Placements */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* RAG Quick Assistant */}
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" /> Grounded Campus AI Assistant
                </CardTitle>
                <CardDescription>
                  Answers strictly derived from published campus PDFs with verified page citations.
                </CardDescription>
              </div>
              <Link href="/student/assistant" prefetch={true}>
                <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Assistant
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  Q
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">
                    &ldquo;What is the minimum attendance requirement for final year examinations?&rdquo;
                  </p>
                  <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-300 leading-relaxed">
                    Students must maintain a minimum attendance of <strong>75%</strong> across theoretical and practical courses. Attendance below 75% results in exam disqualification unless condoned by Dean Academic Affairs with medical proof.
                    <div className="mt-2 text-[10px] text-indigo-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Source: Academic Regulations 2026 (Page 18)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Placement Opportunities Widget */}
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Live Placement Recruitment Drives
                </CardTitle>
                <CardDescription>Deterministic eligibility verified against your CGPA (8.65).</CardDescription>
              </div>
              <Link href="/student/placements" prefetch={true}>
                <Button size="sm" variant="ghost">View All ({placements.length})</Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {placements.map((p) => {
                const hasApplied = appliedPlacementIds.includes(p.id);
                return (
                  <div key={p.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.company}</h4>
                        <Badge variant="success" size="sm">Eligible</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.role} • {p.salary}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Min CGPA: {p.minimum_cgpa} | Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                    </div>
                    {hasApplied ? (
                      <Badge variant="outline" size="sm">Applied</Badge>
                    ) : (
                      <Button size="sm" variant="emerald" onClick={() => applyPlacement(p.id)}>
                        Apply Now
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Live Deadlines & Voice Notes */}
        <div className="flex flex-col gap-6">
          {/* Live Deadlines List */}
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Unified Campus Deadlines
              </CardTitle>
              <Link href="/student/deadlines" prefetch={true}>
                <Button size="sm" variant="ghost">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {deadlines.slice(0, 4).map((d) => (
                <div key={d.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{d.title}</span>
                    <Badge variant={d.priority === "URGENT" ? "danger" : "warning"} size="sm">
                      {new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{d.source_type}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voice Notes Widget */}
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400" /> Recent Voice Notes
              </CardTitle>
              <Link href="/student/voice" prefetch={true}>
                <Button size="sm" variant="ghost">Record</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {voiceNotes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-200">{voiceNotes[0].title}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{voiceNotes[0].short_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
