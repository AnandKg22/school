"use client";

import React, { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Layers,
  ChevronUp,
} from "lucide-react";

export function FloatingMiniPlayer() {
  const {
    activeTrack,
    isDocked,
    isMinimized,
    togglePlay,
    seek,
    undock,
    minimize,
    maximize,
    close,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);

  if (!activeTrack || !isDocked) {
    return null;
  }

  const totalSeconds = activeTrack.durationMinutes * 60;
  const progressPct = Math.min(100, (activeTrack.progressSeconds / totalSeconds) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  // Compact Minimized Audio/Video Bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2.5 px-4 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all flex-shrink-0"
          title={activeTrack.isPlaying ? "Pause" : "Play"}
        >
          {activeTrack.isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white translate-x-0.5" />
          )}
        </button>

        <div className="max-w-[160px] truncate">
          <p className="text-xs font-bold truncate">{activeTrack.title}</p>
          <p className="text-[10px] text-slate-400">
            {formatTime(activeTrack.progressSeconds)} / {formatTime(totalSeconds)}
          </p>
        </div>

        <button
          onClick={maximize}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Expand Video"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={close}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          title="Close Player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full Picture-in-Picture Floating Player
  return (
    <aside
      aria-label="Floating Video Player"
      className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Video Stream Stage */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
        <img
          src={activeTrack.thumbnailUrl}
          alt={activeTrack.title}
          className="w-full h-full object-cover opacity-60"
        />

        {/* Top Controls Overlay */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between text-xs px-2 py-1 rounded-xl bg-slate-950/60 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 truncate max-w-[200px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-300 truncate">
              {activeTrack.courseTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={minimize}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Minimize to Pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={undock}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Restore to Classroom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={close}
              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Play/Pause & Skip Controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <button
            onClick={() => seek(activeTrack.progressSeconds - 10)}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            title={activeTrack.isPlaying ? "Pause" : "Play"}
          >
            {activeTrack.isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => seek(activeTrack.progressSeconds + 10)}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-3 py-1.5">
          <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info & Bottom Bar */}
      <div className="p-3.5 bg-slate-950 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate">{activeTrack.title}</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatTime(activeTrack.progressSeconds)} / {formatTime(totalSeconds)}
          </p>
        </div>

        <button
          onClick={undock}
          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Classroom</span>
        </button>
      </div>
    </aside>
  );
}
