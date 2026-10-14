"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  Award,
  Users,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
  User,
  Zap
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";
import { Member } from "@/lib/types";
import { MembershipModal } from "./MembershipModal";
import { ProfileModal } from "./ProfileModal";

interface CommunityHeaderProps {
  onOpenAiCopilot?: () => void;
}

export function CommunityHeader({ onOpenAiCopilot }: CommunityHeaderProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [currentMember, setCurrentMember] = useState<Member>(MOCK_MEMBERS[0]);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Load stored active member if available
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

  const navItems = [
    { label: "Community", href: "/community", icon: MessageSquare },
    { label: "Classroom", href: "/classroom", icon: BookOpen },
    { label: "Members", href: "/members", icon: Users },
    ...(isOwnerOrAdmin
      ? [{ label: "Owner Console", href: "/admin", icon: Shield }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Community Identity */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                    <span>AKStack AI Builders Club</span>
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    1,248 Members • {currentMember.plan_tier.toUpperCase()} Access
                  </div>
                </div>
              </Link>

              {/* In-App Navigation Tabs */}
              <nav className="flex items-center gap-1 ml-2 sm:ml-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/community" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Plans Trigger, AI Copilot, Theme Toggle, Account Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Membership / Upgrade Button */}
              <button
                onClick={() => setIsMembershipOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="View Membership Plans & Entitlements"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Plans</span>
              </button>

              {/* AI Assistant Trigger */}
              {onOpenAiCopilot && (
                <button
                  onClick={onOpenAiCopilot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 shadow-sm transition-all hover:scale-[1.02]"
                  title="Ask MiMo AI Assistant"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="hidden md:inline">Ask MiMo AI</span>
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Member Profile & Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowMemberMenu(!showMemberMenu)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left"
                >
                  <img
                    src={currentMember.avatar_url}
                    alt={currentMember.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30"
                  />
                  <div className="hidden lg:block text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {currentMember.full_name}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium capitalize flex items-center justify-end gap-1">
                      {currentMember.role === "owner" && <Shield className="w-3 h-3" />}
                      <span>{currentMember.role === "owner" ? "Super Admin" : currentMember.role}</span>
                      <span className="text-slate-400">• Lvl {currentMember.level}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account Switcher Dropdown */}
                {showMemberMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-800/80 mb-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Active Account Persona
                      </p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {currentMember.full_name}
                      </p>
                      <p className="text-[10px] text-amber-500 font-medium">
                        Tier: {currentMember.plan_tier.toUpperCase()} • Level {currentMember.level}
                      </p>
                    </div>

                    {/* Edit Profile Action */}
                    <button
                      onClick={() => {
                        setShowMemberMenu(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>Edit My Profile & Bio</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMemberMenu(false);
                        setIsMembershipOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Manage Membership Tier</span>
                    </button>

                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                      Switch Demo Persona:
                    </p>
                    <div className="space-y-1">
                      {MOCK_MEMBERS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => switchAccount(m)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                            currentMember.id === m.id
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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

                    <div className="border-t border-slate-200/80 dark:border-slate-800/80 mt-2 pt-1">
                      <Link
                        href="/login"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out to Login Screen</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

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
