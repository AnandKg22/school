"use client";

import React, { useState } from "react";
import { Flame, CheckCircle2, Trophy, Sparkles, X } from "lucide-react";
import { Streak } from "../lib/types";
import { MOCK_STREAKS } from "../lib/school-mock";

interface StreakBadgeProps {
  streak?: Streak;
  memberId?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak: initialStreak,
  memberId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const streak: Streak =
    initialStreak ||
    (memberId && MOCK_STREAKS[memberId]) ||
    MOCK_STREAKS["usr_admin_001"] || {
      member_id: "usr_admin_001",
      current_streak_days: 14,
      longest_streak_days: 28,
      last_activity_date: "2026-10-16",
      fire_active: true,
    };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 hover:border-amber-500/60 transition-all font-semibold text-xs tracking-tight shadow-sm hover:shadow-amber-500/10"
        title="Daily Activity Streak"
      >
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        <span>{streak.current_streak_days}d Streak</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">
                    Daily Learning Streak
                  </h4>
                  <p className="text-xs text-slate-400">
                    Active streak boosts reputation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5" />
                  {streak.current_streak_days}
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                  Current Streak
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Trophy className="w-5 h-5" />
                  {streak.longest_streak_days}
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                  Longest Streak
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                Streak safe today! You logged in and completed daily active learning.
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Next reward at 21 days
              </span>
              <span className="font-mono text-slate-300 font-medium">+50 pts</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
