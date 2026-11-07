"use client";

import React, { useState, useRef } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Mic, Square, Upload, Sparkles, CheckCircle2, FileText, Calendar, Clock, Volume2, Bot } from "lucide-react";
import { AudioSummary } from "@/types";

export default function VoicePage() {
  const { voiceNotes, addVoiceNote } = useCampusStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [titleInput, setTitleInput] = useState("Placement Preparation Webinar");
  const timerRef = useRef<any>(null);

  const activeNote = voiceNotes.length > 0 ? voiceNotes[0] : null;

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("title", titleInput);

      const res = await fetch("/api/voice/summarize", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.summary) {
        const newNote: AudioSummary = {
          id: Math.random().toString(),
          student_id: "demo",
          title: titleInput,
          audio_url: "/uploads/recorded_audio.mp3",
          transcript: data.transcript,
          short_summary: data.summary.shortSummary,
          detailed_summary: data.summary.detailedSummary,
          key_points: data.summary.keyPoints || [],
          action_items: data.actionItems || [],
          extracted_dates: ["2026-10-15T10:00:00Z"],
          created_at: new Date().toISOString(),
        };

        addVoiceNote(newNote);
      }
    } catch (err) {
      console.error("Voice processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Mic className="w-6 h-6 text-rose-400" /> Online Voice & Lecture Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Record or upload lectures, faculty explanations, or placement webinars. Online Speech-to-Text & AI summarizer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Voice Recorder */}
        <div className="flex flex-col gap-6">
          <Card className="border-slate-800 bg-slate-900/90 text-center">
            <CardHeader>
              <CardTitle>Capture Audio Note</CardTitle>
              <CardDescription>Record microphone audio live in browser.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Title e.g. Operating Systems Lecture 4"
              />

              <div className="flex flex-col items-center justify-center my-4">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-rose-600/20 text-rose-500 border-2 border-rose-500 animate-pulse"
                      : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  <Mic className="w-10 h-10" />
                </div>
                {isRecording && (
                  <span className="text-sm font-bold text-rose-400 mt-3">
                    Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                  </span>
                )}
              </div>

              {!isRecording ? (
                <Button onClick={startRecording} variant="emerald" size="lg" leftIcon={<Mic className="w-4 h-4" />}>
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="danger" size="lg" leftIcon={<Square className="w-4 h-4" />}>
                  Stop & Process Audio
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 span): Transcripts & AI Summaries */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {isProcessing && (
            <Card className="border-slate-800 bg-slate-900/90">
              <CardContent className="p-8 text-center flex flex-col items-center gap-3">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                <h3 className="text-sm font-bold text-white">Transcribing & Extracting Key Insights...</h3>
                <p className="text-xs text-slate-400">Running online STT and LLM summary pipeline.</p>
              </CardContent>
            </Card>
          )}

          {activeNote && !isProcessing && (
            <div className="flex flex-col gap-6">
              <Card className="border-indigo-500/30 bg-slate-900/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Executive AI Audio Summary — {activeNote.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-200 leading-relaxed font-medium">
                    {activeNote.short_summary}
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Analysis:</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{activeNote.detailed_summary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                      <span className="text-xs font-bold text-indigo-400">Key Points:</span>
                      <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
                        {activeNote.key_points.map((kp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                      <span className="text-xs font-bold text-emerald-400">Extracted Action Items:</span>
                      <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
                        {activeNote.action_items.map((act, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transcript Box */}
              <Card className="border-slate-800 bg-slate-900/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Full Audio Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                    {activeNote.transcript}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
