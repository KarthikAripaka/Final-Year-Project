import React from "react";

export default function FacultyLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse page-enter">
      <div className="h-28 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-center gap-3">
        <div className="h-4 w-40 bg-emerald-500/20 rounded-full" />
        <div className="h-7 w-64 bg-slate-800/80 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/50 border border-slate-800/60 p-4 flex flex-col justify-between"
          >
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5 flex flex-col gap-4">
        <div className="h-5 w-48 bg-slate-800 rounded" />
        <div className="h-16 rounded-xl bg-slate-800/30" />
        <div className="h-16 rounded-xl bg-slate-800/30" />
      </div>
    </div>
  );
}
