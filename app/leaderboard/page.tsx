"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { ProfileModal } from "@/components/ProfileModal";
import {
  Trophy,
  Flame,
  Crown,
  Medal,
  Award,
  Sparkles,
  Zap,
  GraduationCap,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Shield,
  Layers,
  Star,
  CheckCircle,
  ExternalLink,
  Code2,
} from "lucide-react";
import {
  MOCK_LEADERBOARD,
  MOCK_BADGES,
  MOCK_MEMBERS,
  MOCK_STREAKS,
} from "@/lib/school-mock";
import { LeaderboardEntry, Badge, Member } from "@/lib/types";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"month" | "week" | "all_time">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const active = getActiveMember();
    setCurrentMember(active || MOCK_MEMBERS[0]);
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      setCurrentMember(updated || MOCK_MEMBERS[0]);
    });
    return () => unsubscribe();
  }, []);

  // Filter entries
  const filteredEntries = MOCK_LEADERBOARD.filter((entry) => {
    return (
      entry.member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const topThree = filteredEntries.slice(0, 3);
  const restEntries = filteredEntries.slice(3);

  // 9-Level Progression Roadmap Tiers
  const LEVEL_TIERS = [
    { level: 1, title: "Novice Builder", minPoints: 0, perk: "Access to community discussions & public spaces" },
    { level: 2, title: "Apprentice Coder", minPoints: 150, perk: "Unlock course module download attachments" },
    { level: 3, title: "Scriptcrafter", minPoints: 350, perk: "Create custom polls in discussion posts" },
    { level: 4, title: "Full-Stack Engineer", minPoints: 750, perk: "Direct messaging privileges with members" },
    { level: 5, title: "Agent Specialist", minPoints: 1250, perk: "Host community breakout study rooms" },
    { level: 6, title: "Cloud Architect", minPoints: 1850, perk: "Verified 'Architect' badge on profile" },
    { level: 7, title: "Swarm Commander", minPoints: 2450, perk: "Early-access to beta courses & live streams" },
    { level: 8, title: "Principal AI Engineer", minPoints: 3000, perk: "Guest instructor spotlight invitations" },
    { level: 9, title: "Grandmaster Architect", minPoints: 3400, perk: "Lifetime Hall of Fame induction & VIP War Room" },
  ];

  // Helper for rendering badges
  const renderBadgeIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Flame":
        return <Flame className={`${className} text-amber-500 fill-current`} />;
      case "Trophy":
        return <Trophy className={`${className} text-yellow-500 fill-current`} />;
      case "GraduationCap":
        return <GraduationCap className={`${className} text-blue-500`} />;
      case "Crown":
        return <Crown className={`${className} text-amber-400 fill-current`} />;
      case "Award":
        return <Award className={`${className} text-emerald-500`} />;
      default:
        return <Code2 className={`${className} text-indigo-400`} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800";
      case "gold":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "silver":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
      default:
        return "bg-amber-900/10 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border-amber-800/30";
    }
  };

  // Recent XP Events Ticker
  const RECENT_XP_FEED = [
    { id: "xp_1", user: "Sarah Chen", action: "Completed Assessment: Agentic Swarms Quiz", xp: "+50 XP", time: "2m ago" },
    { id: "xp_2", user: "Marcus Vance", action: "Published Architectural Blueprint in Feed", xp: "+30 XP", time: "11m ago" },
    { id: "xp_3", user: "Elena Rostova", action: "Reached 7-Day Continuous Learning Streak", xp: "+40 XP", time: "25m ago" },
    { id: "xp_4", user: "David Kim", action: "Earned Verified Certificate: Full-Stack Agentic AI", xp: "+100 XP", time: "1h ago" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================================================================= */}
        {/* HERO BANNER: Season 4 Glory & Personal Rank Card                  */}
        {/* ================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-950 border border-amber-400/30 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Season 4: Autumn Autonomous AI Sprint</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Community Hall of Fame & Leaderboard
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Earn XP by completing video masterclasses, acing quizzes, helping peers in discussions, and maintaining unbroken daily study streaks.
              </p>
            </div>

            {/* User Personal Stats Card */}
            <div className="p-5 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 text-left shrink-0 w-full lg:w-auto min-w-[280px]">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={currentMember?.avatar_url || MOCK_MEMBERS[0].avatar_url}
                  alt="My avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                />
                <div>
                  <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Your Standing</p>
                  <p className="text-sm font-black text-white">{currentMember?.full_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-300">Rank</p>
                  <p className="text-base font-black text-amber-300">#1</p>
                </div>
                <div>
                  <p className="text-xs text-slate-300">Level</p>
                  <p className="text-base font-black text-white">{currentMember?.level || 9}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-300">Streak</p>
                  <p className="text-base font-black text-rose-400 flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>14d</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TIME CONTROLS & LIVE ACTIVITY TICKER                              */}
        {/* ================================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setTimeframe("month")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                timeframe === "month"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              This Month (Season 4)
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                timeframe === "week"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe("all_time")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                timeframe === "all_time"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All-Time Hall of Fame
            </button>
          </div>

          {/* Season Countdown */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Season 4 Reset in: <strong>6 days, 14 hours</strong></span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PODIUM 3D SHOWCASE: TOP 3 CHAMPIONS                               */}
        {/* ================================================================= */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {/* Rank #2: Silver Champion */}
            <div
              onClick={() => setSelectedMember(topThree[1].member)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-300 dark:border-slate-700 shadow-lg text-center flex flex-col items-center hover:scale-[1.02] transition-transform cursor-pointer relative order-2 md:order-1"
            >
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-sm flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow">
                #2
              </div>
              <div className="relative mt-2">
                <img
                  src={topThree[1].member.avatar_url}
                  alt={topThree[1].member.full_name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-300 dark:ring-slate-700 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {topThree[1].level}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 truncate max-w-full">
                {topThree[1].member.full_name}
              </h3>
              <p className="text-xs text-slate-400 capitalize">{topThree[1].member.role}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <p className="font-black text-blue-600 dark:text-blue-400 text-base">{topThree[1].points.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Total XP</p>
                </div>
                <div>
                  <p className="font-black text-amber-500 text-base flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[1].streak_days}d</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Streak</p>
                </div>
              </div>
            </div>

            {/* Rank #1: Gold Champion (Center & Taller) */}
            <div
              onClick={() => setSelectedMember(topThree[0].member)}
              className="bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-8 border-2 border-amber-400 dark:border-amber-500/60 shadow-2xl text-center flex flex-col items-center hover:scale-[1.03] transition-transform cursor-pointer relative order-1 md:order-2 -mt-4"
            >
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-base flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-lg shadow-amber-500/30">
                👑
              </div>
              <div className="relative mt-2">
                <img
                  src={topThree[0].member.avatar_url}
                  alt={topThree[0].member.full_name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {topThree[0].level}
                </span>
              </div>
              <div className="mt-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">
                  Reigning Champion
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate max-w-full">
                  {topThree[0].member.full_name}
                </h3>
                <p className="text-xs text-slate-400 capitalize">{topThree[0].member.role}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <p className="font-black text-amber-600 dark:text-amber-400 text-xl">{topThree[0].points.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Total XP</p>
                </div>
                <div>
                  <p className="font-black text-rose-500 text-xl flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{topThree[0].streak_days}d</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Streak</p>
                </div>
                <div>
                  <p className="font-black text-emerald-500 text-xl">{topThree[0].courses_completed}</p>
                  <p className="text-[10px] text-slate-400">Courses</p>
                </div>
              </div>
            </div>

            {/* Rank #3: Bronze Champion */}
            <div
              onClick={() => setSelectedMember(topThree[2].member)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-700/40 dark:border-amber-900/60 shadow-lg text-center flex flex-col items-center hover:scale-[1.02] transition-transform cursor-pointer relative order-3"
            >
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow">
                #3
              </div>
              <div className="relative mt-2">
                <img
                  src={topThree[2].member.avatar_url}
                  alt={topThree[2].member.full_name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/40 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {topThree[2].level}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 truncate max-w-full">
                {topThree[2].member.full_name}
              </h3>
              <p className="text-xs text-slate-400 capitalize">{topThree[2].member.role}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <p className="font-black text-blue-600 dark:text-blue-400 text-base">{topThree[2].points.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Total XP</p>
                </div>
                <div>
                  <p className="font-black text-amber-500 text-base flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[2].streak_days}d</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Streak</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TWO-COLUMN LAYOUT: 9-LEVEL PROGRESSION ROADMAP + RECENT XP FEED   */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: 9-Tier Level Progression Roadmap */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  9-Tier Level Progression Roadmap
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Climb from Novice Builder to Grandmaster Architect by accumulating reputation XP.
              </p>
            </div>

            <div className="space-y-3">
              {LEVEL_TIERS.map((tier) => {
                const userPoints = currentMember?.points || 3450;
                const isUnlocked = userPoints >= tier.minPoints;
                const isCurrent = currentMember?.level === tier.level;

                return (
                  <div
                    key={tier.level}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20"
                        : isUnlocked
                        ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isCurrent
                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                            : isUnlocked
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        {tier.level}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {tier.title}
                          </p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                              Current Rank
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Perk: {tier.perk}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {tier.minPoints.toLocaleString()} XP
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isUnlocked ? "Unlocked ✓" : "Locked"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Recent XP Activity Ticker */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Live XP Activity Ticker
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3 pt-1">
                {RECENT_XP_FEED.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{item.user}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-0.5">{item.action}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlockable Badges Showcase Mini-Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Achievement Badges
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">{MOCK_BADGES.length} Total</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_BADGES.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBadge(b)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {renderBadgeIcon(b.icon_name, "w-6 h-6")}
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white mt-1.5 truncate max-w-full">
                      {b.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COMPLETE LEADERBOARD RANKINGS TABLE                               */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Full Season Rankings
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by total accumulated XP and learning streaks.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-3">Level</th>
                  <th className="py-3 px-3">Streak</th>
                  <th className="py-3 px-3">Courses Completed</th>
                  <th className="py-3 px-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntries.map((entry) => {
                  const isCurrent = entry.member.id === (currentMember?.id || "usr_admin_001");
                  return (
                    <tr
                      key={entry.member.id}
                      onClick={() => setSelectedMember(entry.member)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isCurrent ? "bg-amber-50/50 dark:bg-amber-950/20 font-bold" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 font-black">
                        {entry.rank === 1 ? (
                          <span className="text-amber-500">🥇 #1</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-400">🥈 #2</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-700">🥉 #3</span>
                        ) : (
                          <span className="text-slate-500">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.member.avatar_url}
                            alt={entry.member.full_name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {entry.member.full_name}
                              {isCurrent && (
                                <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">{entry.member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Lvl {entry.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-black text-amber-500">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>{entry.streak_days}d</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {entry.courses_completed} Masterclasses
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                        {entry.points.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Member Profile Modal */}
      {selectedMember && (
        <ProfileModal
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          member={selectedMember}
          onSave={() => {}}
        />
      )}

      {/* Badge Detail Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-700">
              {renderBadgeIcon(selectedBadge.icon_name, "w-8 h-8")}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTierColor(selectedBadge.tier)}`}>
                {selectedBadge.tier} Tier
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              Requirement: Accumulate <strong>{selectedBadge.requirement_val} {selectedBadge.requirement_type}</strong>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Nova AI Copilot Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
