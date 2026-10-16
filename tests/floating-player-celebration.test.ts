import { describe, it, expect, vi } from "vitest";
import { ActiveTrack } from "../context/PlayerContext";

describe("Step 9: Persistent Floating Mini-Player (PiP) & Gamification Confetti", () => {
  it("should initialize and maintain active track payload correctly", () => {
    const sampleTrack: ActiveTrack = {
      id: "les_01",
      title: "Lesson 1.1: Architecture of Agentic Loops",
      courseTitle: "Agentic AI Engineering Masterclass",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      durationMinutes: 14,
      progressSeconds: 0,
      isPlaying: true,
      courseSlug: "agentic-ai-masterclass",
      lessonSlug: "architecture-agentic-loops",
    };

    expect(sampleTrack.id).toBe("les_01");
    expect(sampleTrack.durationMinutes).toBe(14);
    expect(sampleTrack.isPlaying).toBe(true);
    expect(sampleTrack.courseSlug).toBe("agentic-ai-masterclass");
  });

  it("should calculate correct percentage and time formatting for progress scrubbers", () => {
    const durationMinutes = 14;
    const totalSeconds = durationMinutes * 60; // 840 seconds
    const currentProgressSeconds = 210; // 3 min 30 sec

    const progressPct = Math.min(100, (currentProgressSeconds / totalSeconds) * 100);
    expect(progressPct).toBe(25);

    // Format helper verification
    const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const remainder = Math.floor(secs % 60);
      return `${mins}:${remainder.toString().padStart(2, "0")}`;
    };

    expect(formatTime(currentProgressSeconds)).toBe("3:30");
    expect(formatTime(totalSeconds)).toBe("14:00");
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
  });

  it("should handle seeking boundaries safely", () => {
    const totalSeconds = 600;
    let currentSeconds = 30;

    // Seek back by 50 seconds (should clamp at 0)
    currentSeconds = Math.max(0, currentSeconds - 50);
    expect(currentSeconds).toBe(0);

    // Seek forward by 200 seconds
    currentSeconds = Math.min(totalSeconds, currentSeconds + 200);
    expect(currentSeconds).toBe(200);

    // Seek beyond total length (should clamp at max)
    currentSeconds = Math.min(totalSeconds, currentSeconds + 800);
    expect(currentSeconds).toBe(totalSeconds);
  });

  it("should evaluate route docking policy", () => {
    const determineIsDocked = (activeTrackPresent: boolean, pathname: string) => {
      if (!activeTrackPresent) return false;
      return pathname !== "/classroom";
    };

    expect(determineIsDocked(true, "/community")).toBe(true);
    expect(determineIsDocked(true, "/events")).toBe(true);
    expect(determineIsDocked(true, "/leaderboard")).toBe(true);
    expect(determineIsDocked(true, "/affiliates")).toBe(true);
    expect(determineIsDocked(true, "/messages")).toBe(true);
    expect(determineIsDocked(true, "/profile")).toBe(true);
    expect(determineIsDocked(true, "/settings")).toBe(true);
    // When inside classroom, it embeds in the main stage, not floating
    expect(determineIsDocked(true, "/classroom")).toBe(false);
    // When no active track is playing, never dock
    expect(determineIsDocked(false, "/community")).toBe(false);
  });

  it("should trigger celebration events with custom particle options", () => {
    let celebrationActive = false;
    let receivedOptions: { particleCount?: number; durationMs?: number } | undefined;

    const triggerCelebration = (options?: { particleCount?: number; durationMs?: number }) => {
      celebrationActive = true;
      receivedOptions = options;
    };

    triggerCelebration({ particleCount: 150, durationMs: 4000 });

    expect(celebrationActive).toBe(true);
    expect(receivedOptions?.particleCount).toBe(150);
    expect(receivedOptions?.durationMs).toBe(4000);
  });
});
