"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { campusTTS, TTSState } from "@/lib/tts/speechService";
import { campusNotification } from "@/lib/firebase/notificationService";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  Volume2,
  Square,
  Filter,
  Lock,
  Plus,
  Key,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  ArrowUpDown,
} from "lucide-react";

interface AnalyzedEmail {
  message_id: string;
  sender: string;
  subject: string;
  body: string;
  email_date: string;
  analysis: {
    category: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    summary: string;
    extractedDeadline?: string;
    actionItems: string[];
  };
  priorityScore?: number;
}

export default function GmailPage() {
  const { user } = useAuth();
  const { emails: storeEmails, syncGmailInbox } = useCampusStore();

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"PRIORITY" | "DEADLINE" | "DATE">("PRIORITY");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isBriefingPlaying, setIsBriefingPlaying] = useState(false);
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: "",
    currentTitle: "",
    playbackRate: 1.0,
  });

  // Real emails state (initialized from store immediately for instant page render)
  const [emails, setEmails] = useState<AnalyzedEmail[]>(() => (storeEmails && storeEmails.length > 0 ? storeEmails : []));

  // Manual real email ingest modal / drawer state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualSubject, setManualSubject] = useState("");
  const [manualSender, setManualSender] = useState("examcell@anits.edu.in");
  const [manualBody, setManualBody] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Access Token direct input state
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [customAccessToken, setCustomAccessToken] = useState("");

  const studentAccount = user?.email || "aripakakarthik.23.it@anits.edu.in";

  // Subscribe to TTS changes
  useEffect(() => {
    const unsubscribe = campusTTS.subscribe((state) => {
      setTtsState(state);
      if (!state.isPlaying) {
        setIsBriefingPlaying(false);
        setCurrentlyPlayingId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Sync with storeEmails if changed
  useEffect(() => {
    if (storeEmails && storeEmails.length > 0 && emails.length === 0) {
      setEmails(storeEmails);
    }
  }, [storeEmails]);

  // Fetch real stored or live emails in background without blocking initial paint
  useEffect(() => {
    let isMounted = true;

    async function loadInitialEmails() {
      // If store is empty, fetch stored emails from backend API
      if (emails.length === 0) {
        try {
          const res = await fetch(`/api/gmail/sync?email=${encodeURIComponent(studentAccount)}`);
          const data = await res.json();
          if (isMounted && data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
            setEmails(data.emails);
          }
        } catch (e) {
          console.warn("Initial email fetch error:", e);
        }
      }
    }

    loadInitialEmails();

    return () => {
      isMounted = false;
    };
  }, [studentAccount]);

  // Handle Sync / Fetch Real Gmail
  const handleSync = async (passedToken?: string) => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id,
          studentEmail: studentAccount,
          accessToken: passedToken || customAccessToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize Gmail inbox");
      }

      if (Array.isArray(data.emails)) {
        setEmails(data.emails);
        await syncGmailInbox(studentAccount);

        if (data.emails.length > 0) {
          setSyncMessage(
            `Synchronized and prioritized ${data.syncedCount} real institutional emails for ${studentAccount}!`
          );
          campusNotification.sendNotification({
            title: "ANITS Gmail Prioritized",
            body: `Fetched ${data.syncedCount} real emails. Prioritized dates and deadlines are active.`,
            url: "/student/gmail",
          });
        } else {
          setSyncMessage(
            data.message || `Connected to ${studentAccount}. No unread campus notices found in inbox.`
          );
        }
      }
    } catch (err: any) {
      console.error("Gmail sync error:", err);
      setSyncError(err.message || "Sync failed. Please check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Google OAuth Direct Connect handler
  const handleGoogleOAuthConnect = async () => {
    try {
      const res = await fetch(`/api/gmail/auth?email=${encodeURIComponent(studentAccount)}`);
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        handleSync();
      }
    } catch (err) {
      console.error("Google connect error:", err);
      handleSync();
    }
  };

  // Manual Real Notice / Email Ingestion
  const handleIngestRealEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSubject || !manualBody) return;

    setManualSubmitting(true);
    try {
      const realEmailItem = {
        message_id: `manual_${Date.now()}`,
        sender: manualSender,
        subject: manualSubject,
        body: manualBody,
        email_date: new Date().toISOString(),
      };

      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id,
          studentEmail: studentAccount,
          rawEmails: [realEmailItem],
        }),
      });

      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
        setShowAddModal(false);
        setManualSubject("");
        setManualBody("");
        setSyncMessage("Real ANITS email parsed and prioritized into system successfully!");
      }
    } catch (err: any) {
      setSyncError("Failed to parse notice: " + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Text-To-Speech: Read Individual Email
  const handleSpeakEmail = (email: AnalyzedEmail) => {
    if (currentlyPlayingId === email.message_id && ttsState.isPlaying) {
      campusTTS.stop();
      setCurrentlyPlayingId(null);
      return;
    }

    const script = campusTTS.generateEmailSpeechScript(email);
    campusTTS.speak(script, email.subject);
    setCurrentlyPlayingId(email.message_id);
    setIsBriefingPlaying(false);
  };

  // Text-To-Speech: Prioritized Dates & Deadlines Briefing
  const handlePlayPrioritizedBriefing = () => {
    if (isBriefingPlaying && ttsState.isPlaying) {
      campusTTS.stop();
      setIsBriefingPlaying(false);
      return;
    }

    // Pass prioritized emails to generate speech script
    const script = campusTTS.generatePrioritizedDateBriefingScript(
      user?.full_name || "Student",
      emails.map((e) => ({
        sender: e.sender,
        subject: e.subject,
        email_date: e.email_date,
        analysis: e.analysis,
      }))
    );

    campusTTS.speak(script, "ANITS Prioritized Dates & Deadlines Briefing");
    setIsBriefingPlaying(true);
    setCurrentlyPlayingId(null);
  };

  // Change Speech Speed Rate
  const handleRateChange = (newRate: number) => {
    campusTTS.setPlaybackRate(newRate);
  };

  // Filter & Sort Emails
  const filteredEmails = emails
    .filter((e) => {
      if (activeCategory === "ALL") return true;
      return e.analysis?.category === activeCategory;
    })
    .sort((a, b) => {
      if (sortBy === "PRIORITY") {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === "DEADLINE") {
        if (!a.analysis?.extractedDeadline) return 1;
        if (!b.analysis?.extractedDeadline) return -1;
        return (
          new Date(a.analysis.extractedDeadline).getTime() -
          new Date(b.analysis.extractedDeadline).getTime()
        );
      }
      // Sort by Date received
      return new Date(b.email_date).getTime() - new Date(a.email_date).getTime();
    });

  const categories = ["ALL", "PLACEMENT", "EXAM", "PROJECT", "ACADEMIC", "ADMINISTRATIVE"];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-sky-400" /> Gmail AI Intelligence & Voice Engine
            </h1>
            <Badge variant="info" size="sm" className="font-mono">
              REAL DATA ONLY
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connected to verified institutional account:{" "}
            <strong className="text-indigo-400 font-mono">{studentAccount}</strong> • AI Powered by Groq
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* TTS Prioritized Date Audio Briefing Button */}
          <Button
            onClick={handlePlayPrioritizedBriefing}
            disabled={emails.length === 0}
            variant="outline"
            size="sm"
            className={`gap-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/10 ${
              isBriefingPlaying ? "ring-2 ring-indigo-400 bg-indigo-600/20" : ""
            }`}
          >
            {isBriefingPlaying && ttsState.isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current text-rose-400" /> Stop Briefing
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" /> Listen to Prioritized Dates (TTS)
              </>
            )}
          </Button>

          {/* Sync Button */}
          <Button
            onClick={() => handleSync()}
            isLoading={isSyncing}
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Fetch & Prioritize Real Inbox
          </Button>

          {/* Parse Real Notice button */}
          <Button
            onClick={() => setShowAddModal(true)}
            variant="ghost"
            size="sm"
            className="border border-slate-800 text-slate-300 hover:text-white"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Analyze Real Notice
          </Button>
        </div>
      </div>

      {/* Floating Active TTS Player Bar */}
      {ttsState.isPlaying && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 flex items-center justify-between gap-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center animate-pulse">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Now Speaking (Voice Synthesis)</span>
              <p className="text-[11px] text-slate-300 truncate max-w-md">{ttsState.currentTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Rate Control */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-500">Speed:</span>
              {[1.0, 1.25, 1.5].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRateChange(r)}
                  className={`px-1.5 py-0.5 rounded ${
                    ttsState.playbackRate === r ? "bg-indigo-600 text-white font-bold" : "hover:text-white"
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {ttsState.isPaused ? (
              <Button size="sm" variant="ghost" onClick={() => campusTTS.resume()}>
                <Play className="w-4 h-4 text-emerald-400" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => campusTTS.pause()}>
                <Pause className="w-4 h-4 text-amber-400" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                campusTTS.stop();
                setIsBriefingPlaying(false);
                setCurrentlyPlayingId(null);
              }}
            >
              <Square className="w-4 h-4 text-rose-400 fill-current" />
            </Button>
          </div>
        </div>
      )}

      {/* Sync Status Notifications */}
      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {syncError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Institutional Gmail Connection Card */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">Google Workspace Gmail:</span>
              <span className="text-xs text-indigo-300 font-mono font-semibold">{studentAccount}</span>
              {customAccessToken ? (
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Gmail API Connected
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" className="gap-1">
                  <Key className="w-3 h-3" /> OAuth Access Token Needed for Personal Inbox
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              To fetch the exact first 5 emails from your private Google account, Google requires OAuth permission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/10 text-xs gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            {showTokenInput ? "Hide Token Input" : "Connect Live Gmail / Paste Token"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleGoogleOAuthConnect}
            className="text-xs gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Mail className="w-3.5 h-3.5" /> Google Cloud Sign-In
          </Button>
        </div>
      </div>

      {/* Token Input Drawer */}
      {showTokenInput && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col gap-3 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Key className="w-4 h-4 text-indigo-400" />
              Fetch Actual Personal Gmail Inbox (First 5 Emails)
            </div>
            <span className="text-[11px] text-slate-400">
              Scope required: <code className="text-indigo-400 font-mono">https://www.googleapis.com/auth/gmail.readonly</code>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Google does not allow third-party apps to read private inboxes without user authorization. Paste your temporary Google OAuth token below to fetch the literal 5 latest emails from your real Gmail inbox:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
            <div className="flex-1 w-full">
              <Input
                type="password"
                placeholder="Paste Google OAuth Access Token (starts with ya29...)"
                value={customAccessToken}
                onChange={(e) => setCustomAccessToken(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs font-mono"
              />
            </div>
            <Button
              size="sm"
              variant="primary"
              className="w-full sm:w-auto gap-2"
              onClick={() => handleSync(customAccessToken)}
              isLoading={isSyncing}
              disabled={!customAccessToken.trim()}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Fetch My 5 Real Emails
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              💡 <strong>Quick way to get a token:</strong> Open{" "}
              <a
                href="https://developers.google.com/oauthplayground"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline font-semibold"
              >
                Google OAuth 2.0 Playground
              </a>
              , select <strong>Gmail API v1 → gmail.readonly</strong>, authorize with your account, and copy the Access Token.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Prioritization Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date / Priority Sorting Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <button
            onClick={() => setSortBy("PRIORITY")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              sortBy === "PRIORITY"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            Urgency & Deadline
          </button>
          <button
            onClick={() => setSortBy("DEADLINE")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              sortBy === "DEADLINE"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            Earliest Deadline
          </button>
          <button
            onClick={() => setSortBy("DATE")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              sortBy === "DATE"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            Received Date
          </button>
        </div>
      </div>

      {/* Zero Mock Data Empty State */}
      {filteredEmails.length === 0 && !isSyncing && (
        <Card className="border-dashed border-slate-800 bg-slate-950 p-10 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Real Institutional Emails Loaded Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your account is connected to <span className="text-indigo-400 font-mono">{studentAccount}</span>.
              Click below to fetch and extract prioritized dates from your actual inbox, or paste a real notice.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => handleSync()}
            >
              Fetch & Synchronize Real Inbox
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Analyze Real Notice
            </Button>
          </div>
        </Card>
      )}

      {/* Real Prioritized Email Feed */}
      <div className="flex flex-col gap-4">
        {filteredEmails.map((email) => {
          const isPlaying = currentlyPlayingId === email.message_id && ttsState.isPlaying;
          const deadline = email.analysis?.extractedDeadline;
          const deadlineDate = deadline ? new Date(deadline) : null;
          const isUrgent = email.analysis?.priority === "URGENT";

          return (
            <Card
              key={email.message_id}
              className={`border-slate-800 bg-slate-900/90 hover:border-slate-700 transition ${
                isPlaying
                  ? "ring-2 ring-indigo-500/60 border-indigo-500"
                  : isUrgent
                  ? "border-rose-500/40"
                  : ""
              }`}
            >
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge
                        variant={
                          email.analysis?.category === "PLACEMENT"
                            ? "success"
                            : email.analysis?.category === "EXAM"
                            ? "danger"
                            : email.analysis?.category === "PROJECT"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {email.analysis?.category || "ANITS NOTICE"}
                      </Badge>

                      <Badge
                        variant={
                          email.analysis?.priority === "URGENT" || email.analysis?.priority === "HIGH"
                            ? "warning"
                            : "outline"
                        }
                        size="sm"
                      >
                        Priority: {email.analysis?.priority || "NORMAL"}
                      </Badge>

                      {deadlineDate && (
                        <Badge variant="danger" size="sm" className="gap-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Due: {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Badge>
                      )}

                      <span className="text-[11px] text-slate-500">
                        {new Date(email.email_date).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2">{email.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sender: {email.sender}</p>
                  </div>

                  {/* Text-To-Speech Button */}
                  <Button
                    onClick={() => handleSpeakEmail(email)}
                    variant="outline"
                    size="sm"
                    className={`gap-1.5 h-8 text-xs ${
                      isPlaying
                        ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                        : "border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Read Aloud (TTS)
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Date & Deadline Extraction Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                      <Sparkles className="w-4 h-4" /> Structured AI Analysis:
                    </div>
                    {deadlineDate && (
                      <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Extracted Target Date
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{email.analysis?.summary}</p>

                  {deadlineDate && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Official Deadline:{" "}
                        <strong className="text-white">
                          {deadlineDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  )}

                  {email.analysis?.actionItems && email.analysis.actionItems.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-slate-400">Action Items for Student:</span>
                      <div className="flex flex-col gap-1.5">
                        {email.analysis.actionItems.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Real Notice Ingestion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Analyze Real ANITS Email / Circular
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Paste real text from an email or notice you received at ANITS. The AI model will parse dates, deadlines, urgency, and turn them into speech.
              </p>

              <form onSubmit={handleIngestRealEmail} className="flex flex-col gap-3 mt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Sender Institutional Address
                  </label>
                  <Input
                    type="text"
                    value={manualSender}
                    onChange={(e) => setManualSender(e.target.value)}
                    placeholder="e.g. placements@anits.edu.in"
                    required
                    className="bg-slate-950 border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    placeholder="e.g. Campus Recruitment Drive or Mid-Sem Timetable"
                    required
                    className="bg-slate-950 border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Email Content / Circular Body
                  </label>
                  <textarea
                    rows={5}
                    value={manualBody}
                    onChange={(e) => setManualBody(e.target.value)}
                    placeholder="Paste the full email or announcement text containing dates, requirements, or instructions..."
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={manualSubmitting}
                    className="gap-2"
                  >
                    Extract Dates & Prioritize
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
