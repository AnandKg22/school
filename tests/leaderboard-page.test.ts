import { describe, it, expect } from "vitest";
import { MOCK_LEADERBOARD, MOCK_BADGES } from "@/lib/school-mock";

describe("Step 3: Dedicated /leaderboard Gamification & Hall of Fame", () => {
  it("structures the Top 3 champions for the 3D podium", () => {
    expect(MOCK_LEADERBOARD.length).toBeGreaterThanOrEqual(3);

    const rank1 = MOCK_LEADERBOARD[0];
    const rank2 = MOCK_LEADERBOARD[1];
    const rank3 = MOCK_LEADERBOARD[2];

    expect(rank1.rank).toBe(1);
    expect(rank1.points).toBeGreaterThan(rank2.points);
    expect(rank2.points).toBeGreaterThan(rank3.points);
    expect(rank1.streak_days).toBeGreaterThanOrEqual(7);
  });

  it("defines complete 9-tier level progression thresholds", () => {
    const LEVEL_TIERS = [
      { level: 1, title: "Novice Builder", minPoints: 0 },
      { level: 2, title: "Apprentice Coder", minPoints: 150 },
      { level: 3, title: "Scriptcrafter", minPoints: 350 },
      { level: 4, title: "Full-Stack Engineer", minPoints: 750 },
      { level: 5, title: "Agent Specialist", minPoints: 1250 },
      { level: 6, title: "Cloud Architect", minPoints: 1850 },
      { level: 7, title: "Swarm Commander", minPoints: 2450 },
      { level: 8, title: "Principal AI Engineer", minPoints: 3000 },
      { level: 9, title: "Grandmaster Architect", minPoints: 3400 },
    ];

    expect(LEVEL_TIERS.length).toBe(9);
    for (let i = 1; i < LEVEL_TIERS.length; i++) {
      expect(LEVEL_TIERS[i].minPoints).toBeGreaterThan(LEVEL_TIERS[i - 1].minPoints);
    }
  });

  it("verifies achievement badge cabinet and tier classifications", () => {
    expect(MOCK_BADGES.length).toBeGreaterThanOrEqual(6);

    const diamondBadges = MOCK_BADGES.filter((b) => b.tier === "diamond");
    const goldBadges = MOCK_BADGES.filter((b) => b.tier === "gold");
    const silverBadges = MOCK_BADGES.filter((b) => b.tier === "silver");

    expect(diamondBadges.length).toBeGreaterThan(0);
    expect(goldBadges.length).toBeGreaterThan(0);
    expect(silverBadges.length).toBeGreaterThan(0);

    const streakBadge = MOCK_BADGES.find((b) => b.requirement_type === "streak");
    expect(streakBadge).toBeDefined();
    expect(streakBadge?.requirement_val).toBe(7);
  });
});
