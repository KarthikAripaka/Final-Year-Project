"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Search, FileText, Bell, Briefcase, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import Link from "next/link";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    documents: any[];
    notices: any[];
    placements: any[];
    events: any[];
  }>({ documents: [], notices: [], placements: [], events: [] });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ documents: [], notices: [], placements: [], events: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="flex flex-col gap-4">
        {/* Search input header */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type natural query e.g. 'placement requirements for IT', 'attendance regulations'..."
            className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isLoading && <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-indigo-500" />}
        </div>

        {/* Results output */}
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {!query && (
            <div className="text-center py-8 text-xs text-slate-400">
              Search official documents, notices, placement drives, and calendar events.
            </div>
          )}

          {query && !isLoading && Object.values(results).every((arr) => arr.length === 0) && (
            <div className="text-center py-8 text-xs text-slate-400">
              No official campus records found matching "{query}".
            </div>
          )}

          {results.documents.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Official Documents ({results.documents.length})
              </h4>
              <div className="flex flex-col gap-2">
                {results.documents.map((doc) => (
                  <div key={doc.id} onClick={onClose} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-white dark:bg-slate-900/60 transition flex items-center justify-between cursor-pointer">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{doc.title}</h5>
                      <p className="text-[11px] text-slate-400">{doc.category} • Version {doc.version}</p>
                    </div>
                    <Badge variant="primary" size="sm">Published</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.placements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Placement Opportunities ({results.placements.length})
              </h4>
              <div className="flex flex-col gap-2">
                {results.placements.map((p) => (
                  <Link key={p.id} href="/student/placements" onClick={onClose} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-900/60 transition flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{p.company} — {p.role}</h5>
                      <p className="text-[11px] text-slate-400">{p.salary} • {p.location}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.notices.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" /> Notices ({results.notices.length})
              </h4>
              <div className="flex flex-col gap-2">
                {results.notices.map((n) => (
                  <div key={n.id} onClick={onClose} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-white dark:bg-slate-900/60 transition flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</h5>
                      <p className="text-[11px] text-slate-400">{n.description?.substring(0, 80)}...</p>
                    </div>
                    <Badge variant="warning" size="sm">{n.priority}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
