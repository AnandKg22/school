"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { CertificateModal } from "@/components/CertificateModal";
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
  ArrowLeft,
  MessageCircle,
  Globe,
} from "lucide-react";
import {
  MOCK_MEMBERS,
  MOCK_CERTIFICATES,
  MOCK_BADGES,
  MOCK_COURSES,
  MOCK_POSTS,
} from "@/lib/school-mock";
import { Member, Certificate } from "@/lib/types";

export default function MemberPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = (params?.id as string) || "usr_sarah_002";

  const [member, setMember] = useState<Member>(() => {
    return MOCK_MEMBERS.find((m) => m.id === memberId || m.handle === memberId) || MOCK_MEMBERS[1];
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const found = MOCK_MEMBERS.find((m) => m.id === memberId || m.handle === memberId);
    if (found) setMember(found);
  }, [memberId]);

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const memberCertificates = Object.values(MOCK_CERTIFICATES).filter(
    (c) => c.member_id === member.id || c.recipient_name.toLowerCase().includes(member.full_name.toLowerCase().split(" ")[0])
  );

  const memberPosts = MOCK_POSTS.filter(
    (p) => p.author_id === member.id || p.author.id === member.id
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back navigation */}
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="h-44 sm:h-56 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 relative overflow-hidden">
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={copyProfileLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold hover:bg-slate-900/80 transition-all border border-white/20"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </button>

              <Link
                href={`/messages`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send Direct Message</span>
              </Link>
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
              <div className="relative">
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
                />
                <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs ring-2 ring-white dark:ring-slate-900 shadow">
                  Lvl {member.level}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200">
                  {member.role.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300">
                  {member.plan_tier.toUpperCase()} TIER
                </span>
              </div>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {member.full_name}
                </h1>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  @{member.handle}
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {member.bio || "Active community engineer building autonomous AI agents and modern web applications."}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>github.com/{member.handle}</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-emerald-500" />
                  <span>@{member.handle}</span>
                </span>
              </div>
            </div>

            {/* 4-Stat Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reputation XP</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{member.points.toLocaleString()} XP</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Streak</span>
                <p className="text-2xl font-black text-rose-500 mt-1 flex items-center gap-1">
                  <Flame className="w-6 h-6 fill-current" />
                  <span>9 Days</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courses Completed</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">3 Masterclasses</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Credentials</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {memberCertificates.length > 0 ? `${memberCertificates.length} Certified` : "1 Certified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials & Trophy Showcase */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Achievement Badges & Verified Credentials</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
            {MOCK_BADGES.slice(0, 5).map((b) => (
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

        {/* Authored Discussions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span>Authored Discussions ({memberPosts.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {memberPosts.map((post) => (
              <div key={post.id} className="py-4 first:pt-0 space-y-2">
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
      </main>

      {/* Certificate Modal */}
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
