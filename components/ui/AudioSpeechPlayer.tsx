"use client";

import React, { useEffect, useState } from "react";
import { campusTTS, TTSState } from "@/lib/tts/speechService";
import { Play, Pause, Square, Volume2 } from "lucide-react";

export const AudioSpeechPlayer: React.FC = () => {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: "",
    currentTitle: "",
    playbackRate: 1.0,
  });

  useEffect(() => {
    const unsubscribe = campusTTS.subscribe(setState);
    return () => unsubscribe();
  }, []);

  if (!state.isPlaying && !state.isPaused) {
    return null;
  }

  const rates = [0.8, 1.0, 1.25, 1.5];

  const handleNextRate = () => {
    const currentIndex = rates.indexOf(state.playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    campusTTS.setPlaybackRate(nextRate);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-indigo-500/40 rounded-2xl shadow-2xl p-4 flex items-center gap-4 text-white backdrop-blur-xl w-80 sm:w-96 ring-1 ring-indigo-500/30">
        {/* Animated Waveform Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <Volume2 className={`w-5 h-5 ${state.isPlaying ? "animate-pulse" : ""}`} />
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Campus AI Voice Reader
            </span>
            {/* Visualizer bars */}
            {state.isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" />
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-100 truncate mt-0.5">
            {state.currentTitle}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleNextRate}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Adjust voice speed"
          >
            {state.playbackRate}x
          </button>

          {state.isPaused ? (
            <button
              onClick={() => campusTTS.resume()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
              title="Resume speech"
            >
              <Play className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={() => campusTTS.pause()}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
              title="Pause speech"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => campusTTS.stop()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
            title="Stop playback"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
