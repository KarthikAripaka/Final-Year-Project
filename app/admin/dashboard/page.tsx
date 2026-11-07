"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, FileText, Bell, Briefcase, Activity, ShieldCheck, Upload, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950 p-6 lg:p-8 border border-rose-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-3 border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> AUTHORIZED ADMIN CONSOLE
          </div>
          <h1 className="text-2xl font-bold text-white">Campus Knowledge & System Administration</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Only authorized administrators can modify official knowledge documents, publish notices, or alter placement criteria.
          </p>
        </div>

        <Link href="/admin/documents" prefetch={true}>
          <Button leftIcon={<Upload className="w-4 h-4" />} variant="primary" size="md">
            Upload Official PDF
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">1,240</p>
          <p className="text-[11px] text-indigo-400 mt-1 font-semibold">Active Profiles Isolated</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Published RAG Knowledge</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">8 Documents</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">142 pgvector Chunks Indexed</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Active Placement Drives</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">3 Companies</p>
          <p className="text-[11px] text-amber-400 mt-1 font-semibold">Eligibility Engine Active</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">AI Query Success</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">99.4%</p>
          <p className="text-[11px] text-sky-400 mt-1 font-semibold">Gemini Primary / Groq Fallback</p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Official Knowledge Status</CardTitle>
              <CardDescription>Documents currently active in Grounded RAG index.</CardDescription>
            </div>
            <Link href="/admin/documents" prefetch={true}>
              <Button size="sm" variant="ghost">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Academic Regulations 2026.pdf</h4>
                <p className="text-[11px] text-slate-400">Category: REGULATION • Chunks: 48</p>
              </div>
              <Badge variant="success" size="sm">PUBLISHED</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Placement Guidelines 2026.pdf</h4>
                <p className="text-[11px] text-slate-400">Category: PLACEMENT • Chunks: 32</p>
              </div>
              <Badge variant="success" size="sm">PUBLISHED</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>System Health & AI Providers</CardTitle>
              <CardDescription>Multi-provider strategy status.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-300">Primary Provider (Google Gemini API)</span>
              <Badge variant="success" size="sm">Online & Healthy</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-300">Fallback Provider (Groq API)</span>
              <Badge variant="info" size="sm">Standby Ready</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-300">Supabase pgvector Extension</span>
              <Badge variant="success" size="sm">Active (768 Dim Index)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
