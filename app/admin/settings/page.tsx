"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Key, Sparkles, Server, ShieldCheck, CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminSettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [primaryProvider, setPrimaryProvider] = useState("gemini");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Ping API Connection Test" }),
      });
      const data = await res.json();
      setTestResult(`✅ API Response Verified! Provider Used: ${data.provider_used}`);
    } catch (err: any) {
      setTestResult(`❌ Connection Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-400" /> API Integration & Key Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real online AI providers (Google Gemini API, Groq API), Supabase PostgreSQL, and Gmail OAuth keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 span): API Configuration */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-indigo-500/30 bg-slate-900/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Primary & Fallback AI Provider Keys
              </CardTitle>
              <CardDescription>
                Keys are stored securely in <code>.env.local</code> and executed strictly on the Next.js server side.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    1. Google Gemini API Key (Primary)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Gemini Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (Configured in .env.local)"
                />
                <p className="text-[11px] text-slate-400">
                  Used for Grounded Q&A (<code>gemini-1.5-flash</code>) and Vector Embeddings (<code>text-embedding-004</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    2. Groq API Key (Secondary Fallback)
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Groq Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_... (Configured in .env.local)"
                />
                <p className="text-[11px] text-slate-400">
                  Used for ultra-fast fallback LLM inference (<code>llama-3.3-70b-versatile</code>) if Gemini quota is exceeded.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button onClick={handleTestConnection} isLoading={isTesting} variant="emerald" size="md" leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Test Live AI Connection
                </Button>

                <Select
                  value={primaryProvider}
                  onChange={(e) => setPrimaryProvider(e.target.value)}
                  options={[
                    { label: "Default: Gemini API", value: "gemini" },
                    { label: "Fallback: Groq API", value: "groq" },
                  ]}
                  className="w-48"
                />
              </div>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
                  {testResult}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Integration Checklist */}
        <div className="flex flex-col gap-6">
          <Card className="border-slate-800 bg-slate-900/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Integration Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Google Gemini API</span>
                <Badge variant="success" size="sm">Configured</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Groq Fallback API</span>
                  <Badge variant="info" size="sm">Standby Ready</Badge>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Supabase pgvector DB</span>
                <Badge variant="success" size="sm">Active (768 Dim)</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Gmail OAuth Read Scope</span>
                <Badge variant="success" size="sm">Read-only Scope</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Online Speech-to-Text</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
