"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Briefcase,
  Award,
  Mail,
  Mic,
  Calendar as CalendarIcon,
  Bell,
  CheckSquare,
  Shield,
  PieChart,
  History,
  Settings,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/student/coding", label: "LeetCode & Lab Exams", icon: <Code2 className="w-4 h-4 text-emerald-400" /> },
    { href: "/student/skills", label: "Skills & Learning", icon: <Award className="w-4 h-4 text-amber-400" /> },
    { href: "/student/placements", label: "Placements & Careers", icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
    { href: "/student/assistant", label: "AI Campus Assistant", icon: <Bot className="w-4 h-4 text-indigo-400" /> },
    { href: "/student/gmail", label: "Gmail Intelligence & TTS", icon: <Mail className="w-4 h-4 text-sky-400" /> },
    { href: "/student/voice", label: "Voice Summarizer", icon: <Mic className="w-4 h-4 text-rose-400" /> },
    { href: "/student/deadlines", label: "Deadlines", icon: <CheckSquare className="w-4 h-4" /> },
    { href: "/student/calendar", label: "Campus Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Faculty Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/faculty/coding", label: "LeetCode Exam & Score Listing", icon: <Code2 className="w-4 h-4 text-emerald-400" /> },
    { href: "/admin/notices", label: "Post Circulars & Notices", icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { href: "/student/placements", label: "Placement Tracker", icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
    { href: "/student/assistant", label: "AI Academic Query Assistant", icon: <Bot className="w-4 h-4 text-indigo-400" /> },
    { href: "/admin/documents", label: "Curriculum & Regulations", icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { href: "/student/calendar", label: "Academic Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Admin Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/admin/documents", label: "Official Knowledge Base", icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { href: "/admin/notices", label: "Official Notices", icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { href: "/admin/placements", label: "Placement Management", icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
    { href: "/admin/analytics", label: "System Analytics", icon: <PieChart className="w-4 h-4 text-sky-400" /> },
    { href: "/admin/audit", label: "Audit Logs", icon: <History className="w-4 h-4" /> },
    { href: "/admin/settings", label: "API Configuration", icon: <Settings className="w-4 h-4 text-indigo-400" /> },
  ];

  let links = studentLinks;
  if (role === "ADMIN") links = adminLinks;
  else if (role === "FACULTY") links = facultyLinks;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-57px)]">
      <div className="flex flex-col gap-6">
        <div className="px-3">
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {role === "ADMIN"
              ? "Administrator Console"
              : role === "FACULTY"
              ? "Faculty Member Workspace"
              : "Student Workspace"}
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 select-none",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold">Groq AI Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          ANITS Knowledge Base with Grounded RAG & Speech Intelligence.
        </p>
      </div>
    </aside>
  );
};
