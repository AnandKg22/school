"use client";

import { useState, useEffect } from "react";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { ProfileModal } from "@/components/ProfileModal";
import {
  Users,
  Award,
  Shield,
  Search,
  Sparkles,
  Flame,
  Zap,
  CheckCircle,
  ExternalLink,
  Calendar
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";
import { Member } from "@/lib/types";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "leaderboard" | "team">("all");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetch("/api/v1/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setMembers(data.members);
        }
      })
      .catch((err) => console.warn("Failed to load live members list:", err));
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "team") {
      return m.role === "superadmin" || m.role === "owner" || m.role === "admin" || m.role === "moderator";
    }
    return true;
  });

  const sortedMembers =
    activeTab === "leaderboard"
      ? [...filteredMembers].sort((a, b) => b.points - a.points)
      : filteredMembers;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">
                Member Directory & Leaderboards
              </h1>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
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
              className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#64748B] dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#64748B] dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Points Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "team"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#64748B] dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Community Leadership</span>
          </button>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member, idx) => {
            const isSuperAdmin = (member.role as string) === "superadmin";
            const isOwner = member.role === "owner";
            const isAdmin = member.role === "admin";
            const isMod = member.role === "moderator";

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 flex flex-col justify-between hover:border-blue-500 transition-all cursor-pointer shadow-2xs group"
              >
                <div>
                  {/* Top Bar: Avatar & Role */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-600/30 shadow-md group-hover:scale-105 transition-transform"
                      />
                      {activeTab === "leaderboard" && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                          #{idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isSuperAdmin
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                            : isOwner
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : isAdmin
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : isMod
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
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
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white truncate">
                    {member.full_name}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    @{member.handle}
                  </p>

                  {/* Bio */}
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {member.bio || "Active member of AKSchool AI Builders Club."}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-white">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>{member.points} pts</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    {member.plan_tier} tier
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Member Profile Modal with Activity Heatmap */}
      {selectedMember && (
        <ProfileModal
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          member={selectedMember}
          onSave={() => setSelectedMember(null)}
        />
      )}

      {/* Nova AI Knowledge Assistant Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
