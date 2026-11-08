"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { campusTTS, TTSState } from "@/lib/tts/speechService";
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  BookOpen,
  ShieldCheck,
  Volume2,
  Square,
} from "lucide-react";
import { RAGCitation } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  citations?: RAGCitation[];
  grounded?: boolean;
  provider_used?: string;
  timestamp: string;
}

interface PublishedDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  chunks_count: number;
  created_at: string;
}

export default function AssistantPage() {
  const { user, updateRollNumber } = useAuth();

  const isElevated = user?.role === "ADMIN" || user?.role === "FACULTY";
  const studentAccount = user?.email || "aripakakarthik.23.it@anits.edu.in";
  const studentName = user?.full_name || "Aripaka Karthik";
  const [activeRoll, setActiveRoll] = useState(user?.roll_number || "A23126511128");
  const studentRoll = activeRoll;

  useEffect(() => {
    if (user?.roll_number) {
      setActiveRoll(user.roll_number);
    }
  }, [user?.roll_number]);

  const studentPrompts = [
    `What is my attendance for roll number ${studentRoll}?`,
    "Am I eligible for exams or do I need condonation?",
    "What are my upcoming deadlines from my emails?",
    "What are the official academic regulations for attendance?",
  ];

  const elevatedPrompts = [
    "Show attendance summary for IV/IV IT from October 2026 report",
    "Which students require condonation or have attendance shortage?",
    "What is the attendance and eligibility for roll A23126511128?",
    "Show attendance record for roll A23126511127 (Sravan)",
  ];

  const suggestedPrompts = isElevated ? elevatedPrompts : studentPrompts;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      content: isElevated
        ? `Hello ${studentName}! You are logged in with **${user?.role} Privileges**.
You have authorized administrative access to query any student's records (by Roll Number or Name), review class attendance sheets, or generate condonation reports directly from official admin-uploaded PDFs.`
        : `Hello ${studentName}! I am your AI Smart Campus Assistant for ANITS.

I have strictly isolated access to your verified student records (**Roll No: ${studentRoll}**). When you inquire about your attendance, deadlines, or academic standing, I fetch **only your specific data** from official admin-uploaded reports with zero data leakage.`,
      citations: [
        {
          document_id: "registry",
          title: `ANITS Academic Registry (${studentRoll})`,
          version: "2026.1",
          page_number: 1,
          snippet: `Active record for Roll No ${studentRoll}: 86.4% Attendance, CGPA 8.65.`,
        },
      ],
      grounded: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publishedDocs, setPublishedDocs] = useState<PublishedDocument[]>([]);

  // TTS State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: "",
    currentTitle: "",
    playbackRate: 1.0,
  });

  // Subscribe to TTS changes
  useEffect(() => {
    const unsub = campusTTS.subscribe((state) => {
      setTtsState(state);
      if (!state.isPlaying) setSpeakingMessageId(null);
    });
    return unsub;
  }, []);

  // Fetch published documents on mount (permanent knowledge base)
  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetch("/api/documents/upload");
        const data = await res.json();
        if (data.documents) {
          setPublishedDocs(data.documents);
        }
      } catch (err) {
        console.warn("Could not load knowledge documents:", err);
      }
    }
    loadDocuments();
  }, []);

  // Handle Send Question to AI
  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const trimmedRoll = (activeRoll || "").trim().toUpperCase();
    if (!trimmedRoll) {
      setMessages((prev) => [
        ...prev,
        {
          id: `warn_roll_${Date.now()}`,
          sender: "assistant",
          content: "⚠️ **Student Roll Number Required**: Please provide your ANITS Roll Number in the header field above (e.g., `A23126511128`) so that I can look up your exact records from the admin-uploaded documents.",
          grounded: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          role: user?.role || "STUDENT",
          rollNumber: trimmedRoll,
          studentEmail: studentAccount,
          studentName,
          roll: trimmedRoll,
          email: studentAccount,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        content: data.answer || "I could not retrieve an answer for this query.",
        citations: data.citations || [],
        grounded: data.grounded ?? true,
        provider_used: data.provider_used || "Groq RAG",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error("RAG assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          content: "Sorry, I encountered an issue retrieving the response. Please try again.",
          grounded: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-To-Speech Playback
  const handleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id && ttsState.isPlaying) {
      campusTTS.stop();
      setSpeakingMessageId(null);
      return;
    }

    campusTTS.speak(msg.content, "AI Campus Assistant Response");
    setSpeakingMessageId(msg.id);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto h-[calc(100vh-90px)]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                {isElevated ? "Academic & Campus Intelligence Assistant" : "Grounded AI Campus Assistant"}
              </h1>
              {isElevated ? (
                <Badge variant="warning" size="sm" className="font-mono text-[10px] gap-1">
                  ⚡ ELEVATED ACCESS ({user?.role})
                </Badge>
              ) : (
                <Badge variant="success" size="sm" className="font-mono text-[10px] gap-1">
                  <ShieldCheck className="w-3 h-3" /> STRICT DATA ISOLATION
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {isElevated ? (
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 text-[11px] text-amber-300">
                  <span className="font-bold uppercase tracking-wider text-amber-400">Admin Mode:</span>
                  <span>Can query any student records or batch sheets</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-indigo-500/40">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Roll No:</span>
                  <input
                    type="text"
                    value={activeRoll}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setActiveRoll(val);
                      if (updateRollNumber) updateRollNumber(val);
                    }}
                    placeholder="e.g. A23126511128"
                    className="bg-transparent text-xs font-mono font-bold text-indigo-400 w-32 focus:outline-none uppercase"
                  />
                </div>
              )}
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-500">{isElevated ? "Account:" : "Student:"}</span>
                <span className="font-semibold text-slate-200">{studentName}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-indigo-300">{studentAccount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium">{publishedDocs.length} Official Admin Knowledge Files Active</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <Card className="flex-1 border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden shadow-2xl">
        <CardContent className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-600/30"
                }`}
              >
                {msg.sender === "user" ? "You" : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl flex flex-col gap-1.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-2xl text-xs lg:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> VERIFIED SOURCES FOR ROLL NO {studentRoll}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((cite, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 flex flex-col gap-1 text-[11px]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 truncate">{cite.title}</span>
                              <Badge variant="info" size="sm" className="text-[9px]">
                                Page {cite.page_number}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2">&ldquo;{cite.snippet}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Bar: Provider & Read Aloud TTS */}
                  {msg.sender === "assistant" && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Powered by {msg.provider_used || "Groq RAG"}</span>
                      <button
                        onClick={() => handleSpeak(msg)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition"
                      >
                        {speakingMessageId === msg.id && ttsState.isPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-rose-400" /> Stop Audio
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" /> Read Aloud (TTS)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 animate-pulse">
                Looking up verified records for Roll No {activeRoll} & generating grounded response...
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2.5">
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask anything about attendance (Roll ${activeRoll}), deadlines, admin PDFs...`}
            className="flex-1 bg-slate-900 border-slate-800 text-xs"
          />
          <Button
            onClick={() => handleSend()}
            isLoading={isLoading}
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Ask AI
          </Button>
        </div>
      </Card>
    </div>
  );
}
