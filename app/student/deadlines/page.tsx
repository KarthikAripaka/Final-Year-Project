"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckSquare, Clock, FileText, Mail, Briefcase } from "lucide-react";

export default function DeadlinesPage() {
  const { deadlines } = useCampusStore();
  const [filterSource, setFilterSource] = useState("ALL");

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterSource === "ALL") return true;
    return d.source_type === filterSource;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" /> Centralized Campus Deadline Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated deadlines from official PDFs, notices, placement drives, Gmail, and audio notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "OFFICIAL_NOTICE", "PLACEMENT", "GMAIL_EMAIL"].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filterSource === src
                  ? "bg-indigo-600 text-white border-indigo-500 shadow"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {src.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredDeadlines.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No deadlines found matching source filter.
          </div>
        )}

        {filteredDeadlines.map((item) => (
          <Card key={item.id} className="border-slate-800 bg-slate-900/90 hover:border-slate-700 transition">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 flex-shrink-0 mt-0.5">
                  {item.source_type === "PLACEMENT" ? (
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  ) : item.source_type === "GMAIL_EMAIL" ? (
                    <Mail className="w-5 h-5 text-sky-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <Badge variant={item.priority === "URGENT" ? "danger" : "warning"} size="sm">
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">Source: {item.source_type}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {new Date(item.deadline).toLocaleString()}
                </span>
                <Badge variant={item.status === "COMPLETED" ? "success" : "outline"} size="sm">
                  {item.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
