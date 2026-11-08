"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { parseCampusEmail, ParsedCampusEmail } from "@/lib/utils/campusEmail";
import { Sparkles, Mail, ShieldCheck, GraduationCap, Building2, UserCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("aripakakarthik.23.it@anits.edu.in");
  const [parsed, setParsed] = useState<ParsedCampusEmail>(parseCampusEmail("aripakakarthik.23.it@anits.edu.in"));
  const [rollNumber, setRollNumber] = useState("A23126511128");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const res = parseCampusEmail(email);
    setParsed(res);
    if (res.rollNumber) {
      setRollNumber(res.rollNumber);
    }
    if (email && !email.toLowerCase().endsWith("@anits.edu.in")) {
      setErrorMessage("Access restricted: Only official @anits.edu.in email accounts are permitted.");
    } else {
      setErrorMessage(null);
    }
  }, [email]);

  const handlePresetSelect = (presetEmail: string) => {
    setEmail(presetEmail);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!email.toLowerCase().endsWith("@anits.edu.in")) {
      setErrorMessage("Only @anits.edu.in email accounts can access this system.");
      return;
    }

    if (parsed.role === "STUDENT" && (!rollNumber || !rollNumber.trim())) {
      setErrorMessage("Student Roll Number is required (e.g. A23126511128). Please enter your roll number to access your records.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const userProfile = await login(email, parsed.role, rollNumber.trim().toUpperCase());

      if (userProfile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userProfile.role === "FACULTY") {
        router.push("/faculty/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);

    if (!email.toLowerCase().endsWith("@anits.edu.in")) {
      setErrorMessage("Google Workspace single sign-on is strictly restricted to @anits.edu.in accounts.");
      setGoogleLoading(false);
      return;
    }

    if (parsed.role === "STUDENT" && (!rollNumber || !rollNumber.trim())) {
      setErrorMessage("Please provide your Student Roll Number before signing in with Google Workspace.");
      setGoogleLoading(false);
      return;
    }

    try {
      const authRes = await fetch(`/api/gmail/auth?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .catch(() => null);

      if (authRes?.authUrl) {
        window.location.href = authRes.authUrl;
        return;
      }

      const userProfile = await login(email, parsed.role);
      if (userProfile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userProfile.role === "FACULTY") {
        router.push("/faculty/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: unknown) {
      console.error("Google Workspace Sign-in error:", err);
      const msg = err instanceof Error ? err.message : "Failed to authenticate with ANITS Google Workspace.";
      setErrorMessage(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col gap-6 z-10">
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            CAMPUS<span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm">
            ANITS Autonomous Academic & Intelligence Portal. Institutional mail access for Students, Faculty, and Administrators.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
            {/* Quick-Preset Chips for Demo / Testing */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Select Campus Role:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect("aripakakarthik.23.it@anits.edu.in")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                    email.includes("aripakakarthik")
                      ? "bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <GraduationCap className="w-4 h-4" /> Student
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">2023 Batch • IT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect("prof.srinivas.it@anits.edu.in")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                    email.includes("srinivas")
                      ? "bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <UserCheck className="w-4 h-4" /> Faculty
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">Prof. IT Dept</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect("admin@anits.edu.in")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                    email.includes("admin@")
                      ? "bg-rose-600/20 border-rose-500 text-white ring-1 ring-rose-500/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <Building2 className="w-4 h-4" /> Admin
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">Exam & Academic</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <Input
                  label="ANITS Institutional Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aripakakarthik.23.it@anits.edu.in"
                  required
                  className="bg-slate-950 border-slate-700 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format: <code className="text-indigo-400 font-mono">name.batch.branch@anits.edu.in</code> (23 = 2023 batch)
                </span>
              </div>

              {parsed.role === "STUDENT" && (
                <div>
                  <Input
                    label="Student Registration / Roll Number"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. A23126511128"
                    required
                    className="bg-slate-950 border-slate-700 text-sm font-mono font-bold text-indigo-400 uppercase"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Required for the AI Assistant to isolate and match your exact attendance and records from admin-uploaded PDFs.
                  </span>
                </div>
              )}

              {/* Dynamic Institutional Identity Inspector */}
              {parsed.isValid && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Identified Campus Profile
                    </span>
                    <Badge
                      variant={
                        parsed.role === "ADMIN" ? "danger" : parsed.role === "FACULTY" ? "success" : "info"
                      }
                      size="sm"
                    >
                      {parsed.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Name:</span>
                      <strong className="text-slate-200 font-semibold">{parsed.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Department:</span>
                      <strong className="text-slate-200 font-semibold">{parsed.departmentName}</strong>
                    </div>
                    {parsed.admissionYear && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Batch / Class:</span>
                        <span className="text-slate-300 font-medium">
                          {parsed.admissionYear} Batch (Grad. {parsed.graduationYear})
                        </span>
                      </div>
                    )}
                    {parsed.rollNumber && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Roll / Reg. No:</span>
                        <code className="text-indigo-400 font-mono text-[11px] font-bold">
                          {parsed.rollNumber}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!email || !email.toLowerCase().endsWith("@anits.edu.in")}
                variant="primary"
                size="lg"
                className="w-full mt-2 gap-2 shadow-lg shadow-indigo-600/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In with Institutional Mail <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
                or
              </span>
            </div>

            {/* Google / Gmail Workspace Auth */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
              variant="outline"
              size="lg"
              className="w-full border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-2.5 font-medium"
            >
              <Mail className="w-4 h-4 text-rose-400" /> Sign In with ANITS Google Workspace
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Row Level Security (RLS) & Verified OAuth 2.0 Encryption Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
