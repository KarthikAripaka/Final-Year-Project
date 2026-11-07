import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 page-enter">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping" />
        </div>
        <div className="h-3 w-32 bg-slate-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
