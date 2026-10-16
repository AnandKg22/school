"use client";

import React from "react";
import { PlayerProvider } from "@/context/PlayerContext";
import { FloatingMiniPlayer } from "@/components/FloatingMiniPlayer";
import { CelebrationProvider } from "@/context/CelebrationContext";
import { CelebrationCanvas } from "@/components/CelebrationCanvas";

export function AppGlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <CelebrationProvider>
      <PlayerProvider>
        {children}
        <FloatingMiniPlayer />
        <CelebrationCanvas />
      </PlayerProvider>
    </CelebrationProvider>
  );
}
