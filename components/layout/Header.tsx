"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import {
  Search as SearchIcon,
  Bell,
  Shield,
  User,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  ChevronRight,
  Check,
  GraduationCap,
  Building2,
  UserCheck,
} from "lucide-react";
import { Dropdown } from "../ui/Dropdown";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { AudioSpeechPlayer } from "../ui/AudioSpeechPlayer";
import { campusNotification } from "@/lib/firebase/notificationService";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, role, switchRole, logout, updateRollNumber } = useAuth();
  const { notifications, markNotificationRead } = useCampusStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [tempRoll, setTempRoll] = useState(user?.roll_number || "A23126511128");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const markAllRead = () => {
    notifications.forEach((n) => markNotificationRead(n.id));
  };

  const handleEnablePush = async () => {
    await campusNotification.requestPermission();
  };

  const userMenuItems = [
    {
      id: "profile",
      label: `${user?.full_name || "User"} (${role})`,
      icon: <User className="w-4 h-4 text-indigo-500" />,
      onClick: () => {},
    },
    {
      id: "switch_student",
      label: "Switch to Student Portal",
      icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
      onClick: () => {
        switchRole("STUDENT");
        router.push("/student/dashboard");
      },
    },
    {
      id: "switch_faculty",
      label: "Switch to Faculty Portal",
      icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
      onClick: () => {
        switchRole("FACULTY");
        router.push("/faculty/dashboard");
      },
    },
    {
      id: "switch_admin",
      label: "Switch to Admin Console",
      icon: <Building2 className="w-4 h-4 text-rose-400" />,
      onClick: () => {
        switchRole("ADMIN");
        router.push("/admin/dashboard");
      },
    },
    {
      id: "enable_push",
      label: "Enable Push Alerts",
      icon: <Bell className="w-4 h-4 text-amber-400" />,
      onClick: handleEnablePush,
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: <LogOut className="w-4 h-4" />,
      onClick: async () => {
        await logout();
        router.push("/login");
      },
      danger: true,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 px-4 lg:px-8 py-3 flex items-center justify-between transition-colors">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link
            href={role === "ADMIN" ? "/admin/dashboard" : role === "FACULTY" ? "/faculty/dashboard" : "/student/dashboard"}
            prefetch={true}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
                CAMPUS<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                ANITS Autonomous Assistant
              </p>
            </div>
          </Link>
        </div>

        {/* Middle Natural Language Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-indigo-500/50 w-72 lg:w-96 transition shadow-inner"
        >
          <SearchIcon className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left">Search ANITS circulars, syllabus, drives...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Campus Alerts</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEnablePush}
                      className="text-[10px] font-medium text-amber-400 hover:underline"
                    >
                      Enable Push
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-3 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                  )}
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link_url || "#"}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-xs transition flex items-start gap-3 ${
                        !n.read
                          ? "bg-indigo-950/40 border-indigo-900/60 text-slate-200"
                          : "bg-slate-950/60 border-slate-800/80 text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.read ? "bg-indigo-500" : "bg-slate-600"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-100">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {role === "STUDENT" && (
            <button
              onClick={() => {
                setTempRoll(user?.roll_number || "A23126511128");
                setIsRollModalOpen(true);
              }}
              title="Registered Student Roll Number for AI queries"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold transition shadow-sm"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Roll:
              </span>
              <span className="text-indigo-300 font-bold">{user?.roll_number || "Set Roll No"}</span>
            </button>
          )}

          <span
            className={`hidden sm:inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border ${
              role === "ADMIN"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : role === "FACULTY"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
            }`}
          >
            {role} PORTAL
          </span>

          <Dropdown
            trigger={
              <button className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </header>

      {/* Student Roll Number Configuration Modal */}
      {isRollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Student Roll Number
              </h3>
              <button
                onClick={() => setIsRollModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your Roll Number is strictly required to query your isolated attendance, marks, and official admin-uploaded PDF records with zero data leakage.
            </p>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                ANITS Roll Number
              </label>
              <input
                type="text"
                value={tempRoll}
                onChange={(e) => setTempRoll(e.target.value.toUpperCase())}
                placeholder="e.g. A23126511128"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-400 font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none uppercase"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format: <code className="text-indigo-400">A23126511128</code> (23 Batch, 128 Roll)
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRollModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempRoll.trim()) {
                    updateRollNumber(tempRoll.trim().toUpperCase());
                    setIsRollModalOpen(false);
                  }
                }}
                disabled={!tempRoll.trim()}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                Save Roll Number
              </button>
            </div>
          </div>
        </div>
      )}

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {/* Global Text-To-Speech Floating Controller */}
      <AudioSpeechPlayer />
    </>
  );
};
