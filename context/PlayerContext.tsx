"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface ActiveTrack {
  id: string;
  title: string;
  courseTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationMinutes: number;
  progressSeconds: number;
  isPlaying: boolean;
  courseSlug?: string;
  lessonSlug?: string;
}

interface PlayerContextType {
  activeTrack: ActiveTrack | null;
  isDocked: boolean;
  isMinimized: boolean;
  playTrack: (track: Omit<ActiveTrack, "progressSeconds" | "isPlaying">) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  dock: () => void;
  undock: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Automatically dock mini-player when user navigates away from classroom if a track is active
  useEffect(() => {
    if (activeTrack && pathname !== "/classroom") {
      setIsDocked(true);
    } else if (pathname === "/classroom") {
      // In classroom, player is embedded in the main stage
      setIsDocked(false);
    }
  }, [pathname, activeTrack]);

  // Simulated progress timer when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTrack?.isPlaying) {
      interval = setInterval(() => {
        setActiveTrack((prev) => {
          if (!prev) return null;
          const nextSec = prev.progressSeconds + 1;
          const totalSec = prev.durationMinutes * 60;
          if (nextSec >= totalSec) {
            // Track completed
            return { ...prev, progressSeconds: totalSec, isPlaying: false };
          }
          return { ...prev, progressSeconds: nextSec };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTrack?.isPlaying]);

  const playTrack = useCallback((track: Omit<ActiveTrack, "progressSeconds" | "isPlaying">) => {
    setActiveTrack({
      ...track,
      progressSeconds: 0,
      isPlaying: true,
    });
    // If not on classroom page, show docked immediately
    if (typeof window !== "undefined" && window.location.pathname !== "/classroom") {
      setIsDocked(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setActiveTrack((prev) => (prev ? { ...prev, isPlaying: !prev.isPlaying } : null));
  }, []);

  const pause = useCallback(() => {
    setActiveTrack((prev) => (prev ? { ...prev, isPlaying: false } : null));
  }, []);

  const resume = useCallback(() => {
    setActiveTrack((prev) => (prev ? { ...prev, isPlaying: true } : null));
  }, []);

  const seek = useCallback((seconds: number) => {
    setActiveTrack((prev) => (prev ? { ...prev, progressSeconds: Math.max(0, seconds) } : null));
  }, []);

  const dock = useCallback(() => {
    setIsDocked(true);
  }, []);

  const undock = useCallback(() => {
    setIsDocked(false);
    router.push("/classroom");
  }, [router]);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const close = useCallback(() => {
    setActiveTrack(null);
    setIsDocked(false);
    setIsMinimized(false);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        activeTrack,
        isDocked,
        isMinimized,
        playTrack,
        togglePlay,
        pause,
        resume,
        seek,
        dock,
        undock,
        minimize,
        maximize,
        close,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
