"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  Calendar,
  Users,
  Trophy,
  Info,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
  User,
  Zap,
  Search,
  Bell,
  MessageCircle,
  X
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";
import { Member } from "@/lib/types";
import { MembershipModal } from "./MembershipModal";
import { ProfileModal } from "./ProfileModal";

interface CommunityHeaderProps {
  onOpenAiCopilot?: () => void;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export function CommunityHeader({
  onOpenAiCopilot,
  onSearchChange,
  searchValue = "",
}: CommunityHeaderProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member>(MOCK_MEMBERS[0]);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
    const saved = localStorage.getItem("school_active_member_id");
    if (saved) {
      const found = MOCK_MEMBERS.find((m) => m.id === saved);
      if (found) setCurrentMember(found);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const switchAccount = (member: Member) => {
    setCurrentMember(member);
    localStorage.setItem("school_active_member_id", member.id);
    setShowMemberMenu(false);
  };

  const handleUpdateProfile = (updated: Partial<Member>) => {
    const updatedMember = { ...currentMember, ...updated };
    setCurrentMember(updatedMember);
    localStorage.setItem("school_active_member_id", updatedMember.id);
  };

  const handleUpdateTier = (newTier: "free" | "pro" | "vip") => {
    const updatedMember = { ...currentMember, plan_tier: newTier };
    setCurrentMember(updatedMember);
    localStorage.setItem("school_active_member_id", updatedMember.id);
  };

  const isOwnerOrAdmin = currentMember.role === "owner" || currentMember.role === "admin";

  const subNavTabs = [
    { label: "Community", href: "/community", icon: MessageSquare },
    { label: "Classroom", href: "/classroom", icon: BookOpen },
    { label: "Calendar", action: () => setIsCalendarOpen(true), icon: Calendar },
    { label: "Members", href: "/members", icon: Users },
    { label: "Leaderboards", href: "/members?tab=leaderboard", icon: Trophy },
    { label: "About", action: () => setIsAboutOpen(true), icon: Info },
    ...(isOwnerOrAdmin
      ? [{ label: "Owner Console", href: "/admin", icon: Shield }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 transition-colors shadow-2xs">
        {/* Top Navbar Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Identity with dropdown indicator */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/community" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-[#0F172A] dark:text-white">
                    AKSchool
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            </div>

            {/* Center: Search Bar (as shown in Skool screenshot) */}
            <div className="flex-1 max-w-xl mx-2 hidden sm:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search discussions, courses, members..."
                  value={searchValue}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Right: Actions, AI Buddy Trigger, Notifications, Profile Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Ask Nova AI Buddy Button */}
              {onOpenAiCopilot && (
                <button
                  onClick={onOpenAiCopilot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all shadow-2xs hover:scale-[1.02]"
                  title="Ask Nova AI Study Buddy"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span className="hidden sm:inline">Ask Nova AI</span>
                </button>
              )}

              {/* Direct Messages Icon */}
              <button
                onClick={() => alert("Direct Messages with AKSchool members")}
                className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Notifications with 99+ Red Badge as in Skool Screenshot */}
              <button
                onClick={() => alert("Notifications: 4 new replies on your discussion threads")}
                className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-black px-1 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                  99+
                </span>
              </button>

              {/* Dark/Light Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Member Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMemberMenu(!showMemberMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <div className="relative">
                    <img
                      src={currentMember.avatar_url}
                      alt={currentMember.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {currentMember.level}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {/* Account Switcher & Profile Dropdown */}
                {showMemberMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 z-50 border border-[#E2E8F0] dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] dark:border-slate-700 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Signed In As
                      </p>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                        {currentMember.full_name}
                      </p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        Tier: {currentMember.plan_tier.toUpperCase()} • Level {currentMember.level}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowMemberMenu(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-[#475569] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit My Profile & Bio</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMemberMenu(false);
                        setIsMembershipOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-[#475569] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manage Membership Tier</span>
                    </button>

                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-[#E2E8F0] dark:border-slate-700 mt-1">
                      Switch Demo Account:
                    </p>
                    <div className="space-y-1">
                      {MOCK_MEMBERS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => switchAccount(m)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                            currentMember.id === m.id
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300"
                          }`}
                        >
                          <img
                            src={m.avatar_url}
                            alt={m.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1 truncate">
                            <div className="truncate">{m.full_name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {m.role === "owner" ? "Super Admin" : m.role} • Lvl {m.level}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-[#E2E8F0] dark:border-slate-700 mt-2 pt-1">
                      <Link
                        href="/login"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs Row (Exact Match to Skool Community Header Subnav) */}
        <div className="border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              {subNavTabs.map((item, idx) => {
                const isActive = item.href ? (pathname === item.href || (item.href !== "/community" && pathname.startsWith(item.href))) : false;
                const Icon = item.icon;

                if (item.action) {
                  return (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                      isActive
                        ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400"
                        : "border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#2563EB] dark:text-blue-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white">
                  Upcoming Community Events
                </h3>
              </div>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                  <span>OCT</span>
                  <span className="text-sm font-extrabold leading-none">17</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                    AKSchool Live: Advanced Autonomous Agent Loops
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-0.5">
                    Live coding session with Akaash Sharma exploring multi-agent delegation and error correction.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    7:00 PM IST • Zoom Link Live 15m Prior
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                  <span>OCT</span>
                  <span className="text-sm font-extrabold leading-none">24</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                    Weekly Project Review & Peer Showcase
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-0.5">
                    Demo your current applications, receive feedback, and win community recognition badges.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200">
                    6:00 PM IST • Community Channel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white">
                  About AKSchool
                </h3>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              <p>
                <strong>AKSchool</strong> is the premier learning academy and community platform for engineers, creators, and founders building autonomous agent systems and full-stack software.
              </p>
              <p>
                Founded by Akaash Sharma, AKSchool combines video masterclasses, interactive study guides, peer code reviews, and the 24/7 <strong>Nova AI Study Buddy</strong> to accelerate your engineering journey.
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700">
                <span className="font-bold text-[#0F172A] dark:text-white block mb-1">Community Guidelines</span>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Be helpful and share real code</li>
                  <li>Ground technical claims with benchmarks</li>
                  <li>Zero unsolicited promotional spam</li>
                  <li>Respect all builders regardless of experience level</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership & Plans Modal */}
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
        currentMember={currentMember}
        onUpdateTier={handleUpdateTier}
      />

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={currentMember}
        onSave={handleUpdateProfile}
      />
    </>
  );
}
