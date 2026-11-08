"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { PieChart } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="w-6 h-6 text-sky-400" /> System & AI Provider Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time metrics on Gemini primary API usage, Groq fallback triggers, pgvector query performance, and user queries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-medium text-slate-400">Total RAG Queries</span>
          <p className="text-2xl font-bold text-white mt-2">1,482</p>
          <p className="text-[11px] text-indigo-400 mt-1 font-semibold">Grounded Context Matches</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-medium text-slate-400">Gemini Primary API</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">1,470 Calls</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">99.2% Success Rate</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-medium text-slate-400">Groq Fallback Triggers</span>
          <p className="text-2xl font-bold text-amber-400 mt-2">12 Calls</p>
          <p className="text-[11px] text-amber-400 mt-1 font-semibold">Automatic Rate-Limit Switch</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-medium text-slate-400">Average RAG Latency</span>
          <p className="text-2xl font-bold text-sky-400 mt-2">420 ms</p>
          <p className="text-[11px] text-sky-400 mt-1 font-semibold">Vector Index HNSW Search</p>
        </Card>
      </div>
    </div>
  );
}
