"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { CertificateModal } from "@/components/CertificateModal";
import { ProfileModal } from "@/components/ProfileModal";
import {
  User,
  Shield,
  Award,
  Flame,
  BookOpen,
  Calendar,
  CheckCircle,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageSquare,
  Lock,
  Sparkles,
  Trophy,
  GraduationCap,
  Globe,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import {
  MOCK_MEMBERS,
  MOCK_CERTIFICATES,
  MOCK_BADGES,
  MOCK_COURSES,
  MOCK_POSTS,
} from "@/lib/school-mock";
import { Member, Certificate, Badge, Course, Post } from "@/lib/types";
import { getActiveMember, saveActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export default function ProfilePage() {
  const [currentMember, setCurrentMember] = useState<Member>(MOCK_MEMBERS[0]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"trophies" | "courses" | "posts">("trophies");

  useEffect(() => {
    const active = getActiveMember();
    if (active) setCurrentMember(active);
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      if (updated) setCurrentMember(updated);
    });
    return () => unsubscribe();
  }, []);

  const memberCertificates = Object.values(MOCK_CERTIFICATES).filter(
    (c) => c.member_id === currentMember.id || c.recipient_name.toLowerCase().includes(currentMember.full_name.toLowerCase().split(" ")[0])
  );

  const memberPosts = MOCK_POSTS.filter(
    (p) => p.author_id === currentMember.id || p.author.id === currentMember.id
  );

  const copyProfileLink = () => {
    const url = `${window.location.origin}/members/${currentMember.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generate 52-week activity heatmap demo matrix
  const weeks = 28;
  const daysPerWeek = 7;
  const generateHeatmap = () => {
    const grid: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: number[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        // Pseudo-random realistic contribution activity
        const val = ((w * 7 + d * 3) % 5 === 0) ? 3 : ((w + d) % 3 === 0) ? 2 : ((w * d) % 4 === 0) ? 1 : 0;
        col.push(val);
      }
      grid.push(col);
    }
    return grid;
  };

  const heatmap = generateHeatmap();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================================================================= */}
        {/* HERO BANNER & PROFILE HEADER                                      */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Cover Photo */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={copyProfileLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold hover:bg-slate-900/80 transition-all border border-white/20"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </button>
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all shadow-md"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Member Identity & Bio */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
              <div className="relative">
                <img
                  src={currentMember.avatar_url}
                  alt={currentMember.full_name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
                />
                <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs ring-2 ring-white dark:ring-slate-900 shadow">
                  Lvl {currentMember.level}
                </span>
              </div>

              {/* Badges / Tier ribbon */}
              <div className="flex items-center gap-2 self-start sm:self-end">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentMember.role.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {currentMember.plan_tier.toUpperCase()} TIER
                </span>
              </div>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentMember.full_name}
                </h1>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  @{currentMember.handle}
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentMember.bio || "Platform Architect & Founder building autonomous multi-agent loops and developer education."}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>github.com/akaash</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-emerald-500" />
                  <span>@akaash_ai</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4 text-indigo-500" />
                  <span>linkedin.com/in/akaash</span>
                </span>
              </div>
            </div>

            {/* 4-Stat Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reputation XP</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{currentMember.points.toLocaleString()} XP</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Rank #1 in Community</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Streak</span>
                <p className="text-2xl font-black text-rose-500 mt-1 flex items-center gap-1">
                  <Flame className="w-6 h-6 fill-current" />
                  <span>14 Days</span>
                </p>
                <p className="text-[11px] text-rose-400 font-semibold mt-0.5">Fire Active 🔥</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courses Completed</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">4 Masterclasses</p>
                <p className="text-[11px] text-slate-400 mt-0.5">100% Assessment Score</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Credentials</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {memberCertificates.length > 0 ? `${memberCertificates.length} Certified` : "1 Certified"}
                </p>
                <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">Cryptographically Signed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 52-WEEK LEARNING & CONTRIBUTION ACTIVITY HEATMAP                  */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Learning & Contribution Activity Heatmap</span>
              </h3>
              <p className="text-xs text-slate-500">
                184 learning activities and community contributions in 2026.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
              <span>Less</span>
              <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800" />
              <span className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
              <span className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-600" />
              <span className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Blocks */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1.5 min-w-[600px]">
              {heatmap.map((col, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {col.map((intensity, dIdx) => (
                    <div
                      key={dIdx}
                      title={`Activity Level: ${intensity}`}
                      className={`w-3.5 h-3.5 rounded-xs transition-colors ${
                        intensity === 3
                          ? "bg-emerald-600 dark:bg-emerald-400 shadow-xs shadow-emerald-500/20"
                          : intensity === 2
                          ? "bg-emerald-400 dark:bg-emerald-600"
                          : intensity === 1
                          ? "bg-emerald-200 dark:bg-emerald-900"
                          : "bg-slate-100 dark:bg-slate-800/80"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SUBNAV TABS: Trophy Cabinet | Enrolled Courses | My Discussions   */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("trophies")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "trophies"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Trophy Room & Credentials
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "courses"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Enrolled Masterclasses ({MOCK_COURSES.length})
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "posts"
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Discussions Published ({memberPosts.length})
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: TROPHY ROOM & CREDENTIALS                                  */}
        {/* ================================================================= */}
        {activeTab === "trophies" && (
          <div className="space-y-8">
            {/* Cryptographic Certificates */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <span>Cryptographically Verified Certificates</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official completion credentials issued by AKSchool with on-chain verification hashes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {Object.values(MOCK_CERTIFICATES).map((cert) => (
                  <div
                    key={cert.id}
                    className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-amber-500/30 text-white shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award className="w-24 h-24 text-amber-400" />
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {cert.certificate_number}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Score: {cert.grade_percentage}%
                        </span>
                      </div>

                      <h4 className="text-base font-black text-white leading-snug">
                        {cert.course_title}
                      </h4>

                      <p className="text-xs text-slate-400">
                        Issued: {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          Hash: {cert.verification_hash.slice(0, 12)}...
                        </span>

                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Unlocked Achievement Badges ({MOCK_BADGES.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
                {MOCK_BADGES.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-2 hover:border-amber-400 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {b.title}
                      </p>
                      <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mt-1 block">
                        {b.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ENROLLED MASTERCLASSES                                     */}
        {/* ================================================================= */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_COURSES.map((course, idx) => {
              const progressPct = idx === 0 ? 100 : idx === 1 ? 65 : 20;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all group"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-950">
                    <img
                      src={course.cover_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                      {course.required_tier.toUpperCase()} TIER
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">Curriculum Progress</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href="/classroom"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold text-center transition-colors block mt-2"
                    >
                      {progressPct === 100 ? "Review Masterclass ✓" : "Continue Lesson →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DISCUSSIONS PUBLISHED                                      */}
        {/* ================================================================= */}
        {activeTab === "posts" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Community Posts & Technical Discussions
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {memberPosts.map((post) => (
                <div key={post.id} className="py-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200">
                      Discussion
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    href="/community"
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>❤️ {post.likes_count} Likes</span>
                    <span>💬 {post.comments_count} Replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        member={currentMember}
        onSave={(updated) => {
          const merged = { ...currentMember, ...updated };
          saveActiveMember(merged);
          setCurrentMember(merged);
          setIsEditOpen(false);
        }}
      />

      {/* Certificate High-Res Printable Modal */}
      <CertificateModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />

      {/* Nova AI Copilot Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
