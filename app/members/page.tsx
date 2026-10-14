"use client";

import { useState } from "react";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  Users,
  Award,
  Shield,
  Search,
  Sparkles,
  Flame,
  Zap,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";
import { Member } from "@/lib/types";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "leaderboard" | "team">("all");
  const [isAiOpen, setIsAiOpen] = useState(false);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "team") {
      return m.role === "owner" || m.role === "admin" || m.role === "moderator";
    }
    return true;
  });

  const sortedMembers =
    activeTab === "leaderboard"
      ? [...filteredMembers].sort((a, b) => b.points - a.points)
      : filteredMembers;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Member Directory & Leaderboards
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connect with 1,248 autonomous AI developers, cloud architects, and founders
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name or bio..."
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-amber-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-amber-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Points Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "team"
                ? "bg-amber-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Community Leadership</span>
          </button>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member, idx) => {
            const isOwner = member.role === "owner";
            const isAdmin = member.role === "admin";
            const isMod = member.role === "moderator";

            return (
              <div
                key={member.id}
                className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
              >
                <div>
                  {/* Top Bar: Avatar & Role */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30 shadow-md group-hover:scale-105 transition-transform"
                      />
                      {activeTab === "leaderboard" && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                          #{idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isOwner
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : isAdmin
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                            : isMod
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isOwner ? "Super Admin" : member.role}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Level {member.level}
                      </span>
                    </div>
                  </div>

                  {/* Name & Handle */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {member.full_name}
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    @{member.handle}
                  </p>

                  {/* Bio */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {member.bio || "Active community builder in AKStack AI Builders Club."}
                  </p>
                </div>

                {/* Bottom Points & Tier */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Flame className="w-4 h-4 text-amber-500 fill-current" />
                    <span>{member.points} points</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {member.plan_tier} tier
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
