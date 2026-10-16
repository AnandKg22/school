"use client";

import React, { useState } from "react";
import { BarChart3, CheckCircle2, Circle, Users, Sparkles } from "lucide-react";
import { Poll } from "@/lib/types";

interface PollWidgetProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ poll: initialPoll, onVote }) => {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(
    initialPoll.user_voted_option_id
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId === optionId) return; // already voted for this option

    setIsSubmitting(true);
    const previousOptionId = selectedOptionId;

    setPoll((prev) => {
      const updatedOptions = prev.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes_count: opt.votes_count + 1 };
        }
        if (previousOptionId && opt.id === previousOptionId) {
          return { ...opt, votes_count: Math.max(0, opt.votes_count - 1) };
        }
        return opt;
      });

      const newTotal = previousOptionId ? prev.total_votes : prev.total_votes + 1;

      return {
        ...prev,
        options: updatedOptions,
        total_votes: newTotal,
        user_voted_option_id: optionId,
      };
    });

    setSelectedOptionId(optionId);
    setIsSubmitting(false);

    if (onVote) {
      onVote(poll.id, optionId);
    }
  };

  const hasVoted = Boolean(selectedOptionId);

  return (
    <div className="my-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-blue-200/80 dark:border-blue-900/50 shadow-2xs">
      {/* Poll Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Community Poll
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">
          <Users className="w-3.5 h-3.5" />
          <span>{poll.total_votes} votes</span>
        </div>
      </div>

      <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3 leading-snug">
        {poll.question}
      </h4>

      {/* Options List */}
      <div className="space-y-2.5">
        {poll.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const percentage =
            poll.total_votes > 0
              ? Math.round((option.votes_count / poll.total_votes) * 100)
              : 0;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectOption(option.id)}
              className={`w-full relative overflow-hidden text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all group ${
                isSelected
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-2xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-[#0F172A] dark:text-slate-200 hover:border-blue-300 dark:hover:border-slate-600"
              }`}
            >
              {/* Background Animated Progress Bar */}
              {hasVoted && (
                <div
                  className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ease-out pointer-events-none rounded-xl ${
                    isSelected
                      ? "bg-blue-500/15 dark:bg-blue-500/25"
                      : "bg-slate-200/50 dark:bg-slate-700/40"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              {/* Option Content */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                    )}
                  </div>
                  <span className={`truncate ${isSelected ? "font-bold text-blue-900 dark:text-blue-100" : ""}`}>
                    {option.text}
                  </span>
                </div>

                {/* Percentage & Vote Count */}
                {hasVoted && (
                  <div className="shrink-0 flex items-center gap-2 text-xs font-bold">
                    <span className="text-[#64748B] dark:text-slate-400 text-[11px] font-normal">
                      {option.votes_count}
                    </span>
                    <span className={isSelected ? "text-blue-600 dark:text-blue-400 font-black" : "text-[#0F172A] dark:text-white"}>
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer notice */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
        <span>{hasVoted ? "✓ You voted" : "Click an option to cast your vote"}</span>
        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>Live Results</span>
        </span>
      </div>
    </div>
  );
};
