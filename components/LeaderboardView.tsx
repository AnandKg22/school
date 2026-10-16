"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Medal,
  Award,
  Crown,
  Sparkles,
  Zap,
  GraduationCap,
  Search
} from "lucide-react";
import { LeaderboardEntry, Badge } from "@/lib/types";
import { MOCK_LEADERBOARD, MOCK_BADGES } from "@/lib/school-mock";

interface LeaderboardViewProps {
  onSelectMember?: (memberId: string) => void;
}

export function LeaderboardView({ onSelectMember }: LeaderboardViewProps) {
  const [timeframe, setTimeframe] = useState<"all_time" | "month" | "week">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBadgeCabinet, setShowBadgeCabinet] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredEntries = MOCK_LEADERBOARD.filter((entry) => {
    return (
      entry.member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const topThree = filteredEntries.slice(0, 3);

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
        return <Sparkles className={`${className} text-indigo-400`} />;
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Timeframe Controls */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-500/20">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Community Glory & XP Leaderboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Top Autonomous AI Contributors
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed">
              Earn XP by completing lesson modules, passing code assessments, answering community discussions, and keeping your daily study streak alive.
            </p>
          </div>

          {/* Timeframe & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setTimeframe("week")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === "week"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                7-Day Sprint
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === "month"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe("all_time")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === "all_time"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                All-Time
              </button>
            </div>

            <button
              onClick={() => setShowBadgeCabinet(!showBadgeCabinet)}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all flex items-center justify-center gap-2"
            >
              <Medal className="w-4 h-4 text-amber-400" />
              <span>{showBadgeCabinet ? "Hide Badges" : "Badges Showcase"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Badges Cabinet Preview Drawer (Collapsible) */}
      {showBadgeCabinet && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-[#E2E8F0] dark:border-slate-700 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-500" />
                <span>AKSchool Verified Achievement Badges</span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Unlock permanent visual badges and tier boosts on your profile.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              {MOCK_BADGES.length} Badges Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_BADGES.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedBadge?.id === b.id
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                  {renderBadgeIcon(b.icon_name, "w-6 h-6")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-[#0F172A] dark:text-white truncate">
                      {b.title}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTierColor(
                        b.tier
                      )}`}
                    >
                      {b.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2">
                    {b.description}
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Req: {b.requirement_type} ≥ {b.requirement_val}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 Podium (Visual Showcase) */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center relative shadow-sm hover:border-slate-400 transition-all">
            <div className="absolute -top-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 font-black text-lg flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-800">
              2
            </div>
            <div className="relative mt-4 mb-3">
              <img
                src={topThree[1].member.avatar_url}
                alt={topThree[1].member.full_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-300 dark:ring-slate-600"
              />
              <span className="absolute -bottom-1 -right-1 text-xl">🥈</span>
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A] dark:text-white">
              {topThree[1].member.full_name}
            </h4>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full mt-1">
              <span>{topThree[1].member.role.toUpperCase()}</span>
              <span className="text-[10px]">• Lvl {topThree[1].level}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 w-full flex items-center justify-around">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">XP Points</div>
                <div className="text-base font-black text-[#0F172A] dark:text-white">
                  {topThree[1].points.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Streak</div>
                <div className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{topThree[1].streak_days}d</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold - Elevated in Center) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-500/10 dark:via-slate-800 dark:to-slate-800 rounded-3xl border-2 border-amber-400 dark:border-amber-500 p-6 sm:p-8 flex flex-col items-center text-center relative shadow-xl hover:shadow-2xl transition-all md:-translate-y-4">
            <div className="absolute -top-8 w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800 animate-bounce duration-1000">
              <Crown className="w-8 h-8 fill-current text-amber-900" />
            </div>
            <div className="relative mt-6 mb-3">
              <img
                src={topThree[0].member.avatar_url}
                alt={topThree[0].member.full_name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 text-2xl">🥇</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-950/80 px-3 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Current Grandmaster</span>
            </div>
            <h4 className="font-black text-lg sm:text-xl text-[#0F172A] dark:text-white">
              {topThree[0].member.full_name}
            </h4>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full mt-1.5">
              <span>{topThree[0].member.role.toUpperCase()}</span>
              <span className="text-[10px]">• Lvl {topThree[0].level}</span>
            </div>
            <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-slate-700 w-full flex items-center justify-around">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">XP Points</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {topThree[0].points.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Daily Streak</div>
                <div className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-current" />
                  <span>{topThree[0].streak_days}d</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center relative shadow-sm hover:border-slate-400 transition-all">
            <div className="absolute -top-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-lg flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-800">
              3
            </div>
            <div className="relative mt-4 mb-3">
              <img
                src={topThree[2].member.avatar_url}
                alt={topThree[2].member.full_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/40"
              />
              <span className="absolute -bottom-1 -right-1 text-xl">🥉</span>
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A] dark:text-white">
              {topThree[2].member.full_name}
            </h4>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full mt-1">
              <span>{topThree[2].member.role.toUpperCase()}</span>
              <span className="text-[10px]">• Lvl {topThree[2].level}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 w-full flex items-center justify-around">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">XP Points</div>
                <div className="text-base font-black text-[#0F172A] dark:text-white">
                  {topThree[2].points.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Streak</div>
                <div className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{topThree[2].streak_days}d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Table of remaining ranks */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
              Complete Academy Leaderboard ({filteredEntries.length})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-slate-900/80 text-[#64748B] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#E2E8F0] dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-center">Badges</th>
                <th className="py-3 px-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.member.id}
                  onClick={() => onSelectMember?.(entry.member.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center font-black">
                    {entry.rank === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="text-[#64748B] dark:text-slate-400 font-bold">
                        #{entry.rank}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.member.avatar_url}
                        alt={entry.member.full_name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="font-extrabold text-[#0F172A] dark:text-white group-hover:text-blue-600 transition-colors">
                          {entry.member.full_name}
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-slate-400">
                          Level {entry.level} Scholar
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {entry.member.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{entry.streak_days}d</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{entry.badges_count}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-black text-sm text-[#0F172A] dark:text-white">
                      {entry.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">XP</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
