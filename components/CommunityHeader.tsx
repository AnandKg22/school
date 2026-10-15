"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  X,
  Globe,
  CheckCheck,
  Check,
  Send,
  MessageSquareReply
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";
import { Member } from "@/lib/types";
import { MembershipModal } from "./MembershipModal";
import { ProfileModal } from "./ProfileModal";
import { getActiveMember, saveActiveMember, clearActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export interface NotificationItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  actionText: string;
  timeAgo: string;
  snippet: string;
  isUnread: boolean;
  type: "mention" | "like" | "post";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    senderName: "Nigel Vargas",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    actionText: "mentioned you in reply",
    timeAgo: "4h",
    snippet: "@Anand Kumar Gudlangari",
    isUnread: true,
    type: "mention",
  },
  {
    id: "notif_2",
    senderName: "Nigel Vargas",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    actionText: "liked your comment",
    timeAgo: "4h",
    snippet: "👋 Hello everyone! I'm Anand Kumar from Goa, India. I'm excited to study and build...",
    isUnread: true,
    type: "like",
  },
  {
    id: "notif_3",
    senderName: "Christian Riva... 🔥 +4 others",
    senderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    actionText: "liked your comment",
    timeAgo: "8h",
    snippet: "👋 Hello everyone! I'm Anand Kumar from Goa, India. I'm excited to study and build...",
    isUnread: true,
    type: "like",
  },
  {
    id: "notif_4",
    senderName: "Yash Chauhan 🔥 (broadcast)",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    actionText: "new post",
    timeAgo: "11h",
    snippet: "🚀 We're Hiring: Assistant Community Manager",
    isUnread: true,
    type: "post",
  },
  {
    id: "notif_5",
    senderName: "Gal Miller 🔥",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    actionText: "mentioned you in reply",
    timeAgo: "22h",
    snippet: "@Anand Kumar Gudlangari Heyyy.. welcome! hope you have a great learning journey!",
    isUnread: true,
    type: "mention",
  },
  {
    id: "notif_6",
    senderName: "Nate Herk 💎 (following)",
    senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    actionText: "new post",
    timeAgo: "1d",
    snippet: "🚀 New Video: I Tested the Viral Reverse Engineer Anything AI Tool",
    isUnread: true,
    type: "post",
  },
  {
    id: "notif_7",
    senderName: "Ameeth B.",
    senderAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    actionText: "mentioned you in reply",
    timeAgo: "1d",
    snippet: "@Anand Kumar Gudlangari welcome!! Looking forward to your project updates.",
    isUnread: true,
    type: "mention",
  },
];

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
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // In-page Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<"all" | "mentions" | "unread">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // In-page Direct Messages state
  const [showMessages, setShowMessages] = useState(false);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
        setShowFilterMenu(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target as Node)) {
        setShowMessages(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === "unread") return n.isUnread;
    if (notifFilter === "mentions") return n.type === "mention";
    return true;
  });

  useEffect(() => {
    // Check initial dark mode state
    if (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }

    // Verify authenticated session with Supabase
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          const active = getActiveMember();
          setCurrentMember(active);
        } else {
          setCurrentMember(null);
          clearActiveMember();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setCurrentMember(getActiveMember());
        } else {
          setCurrentMember(null);
          clearActiveMember();
        }
      });

      return () => subscription.unsubscribe();
    });

    // Listen to real-time profile updates across tabs/components
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      setCurrentMember(updated);
    });
    return unsubscribe;
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

  const handleLogout = async () => {
    setShowMemberMenu(false);
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out exception:", err);
    }
    clearActiveMember();
    setCurrentMember(null);
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (updated: Partial<Member>) => {
    if (!currentMember) return;
    const updatedMember = { ...currentMember, ...updated };
    saveActiveMember(updatedMember);
    setCurrentMember(updatedMember);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/v1/me/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            full_name: updated.full_name,
            bio: updated.bio,
            avatar_url: updated.avatar_url,
          }),
        });
      }
    } catch (err) {
      console.warn("Could not sync profile update to server, persisted locally:", err);
    }
  };

  const handleUpdateTier = async (newTier: "free" | "pro" | "vip") => {
    if (!currentMember) return;
    const updatedMember: Member = { ...currentMember, plan_tier: newTier };
    saveActiveMember(updatedMember);
    setCurrentMember(updatedMember);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/v1/billing/upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ planTier: newTier }),
        });
      }
    } catch (err) {
      console.warn("Could not sync tier upgrade to server, persisted locally:", err);
    }
  };

  const isOwnerOrAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

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

              {/* Direct Messages & Notifications (Only for authenticated members) */}
              {currentMember && (
                <>
                  {/* Direct Messages Icon & In-Page Dropdown */}
                  <div className="relative" ref={messagesRef}>
                    <button
                      onClick={() => {
                        setShowMessages(!showMessages);
                        setShowNotifications(false);
                        setShowMemberMenu(false);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                      title="Direct Messages"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </button>

                    {showMessages && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            <span className="font-extrabold text-sm text-[#0F172A] dark:text-white">
                              Direct Messages
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            3 Active
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                          {[
                            {
                              name: "Sarah Chen",
                              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                              time: "12m ago",
                              preview: "Loved your zero-hallucination query router pattern! Are you open to a code review?",
                              online: true,
                            },
                            {
                              name: "Marcus Vance",
                              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                              time: "1h ago",
                              preview: "The Docker compose config worked seamlessly in production.",
                              online: true,
                            },
                            {
                              name: "Nova AI (Study Buddy)",
                              avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                              time: "2h ago",
                              preview: "Ready to assist you with the Agentic AI Engineering curriculum whenever you need!",
                              online: true,
                            },
                          ].map((dm, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3"
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={dm.avatar}
                                  alt={dm.name}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                                />
                                {dm.online && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                                    {dm.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{dm.time}</span>
                                </div>
                                <p className="text-xs text-[#475569] dark:text-slate-400 truncate mt-0.5">
                                  {dm.preview}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 text-center">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            View All Messages in Hub →
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* In-Page Notification Dropdown Menu */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowMessages(false);
                        setShowMemberMenu(false);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs animate-in zoom-in">
                          99+
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-[410px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
                          <span className="font-extrabold text-sm text-[#0F172A] dark:text-white">
                            Notifications
                          </span>

                          <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Mark all as read
                              </button>
                            )}

                            {/* Filter Popover Trigger */}
                            <div className="relative">
                              <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"
                              >
                                <span>{notifFilter}</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              {showFilterMenu && (
                                <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-[#E2E8F0] dark:border-slate-700 py-1 z-50">
                                  {(["all", "unread", "mentions"] as const).map((mode) => (
                                    <button
                                      key={mode}
                                      onClick={() => {
                                        setNotifFilter(mode);
                                        setShowFilterMenu(false);
                                      }}
                                      className={`w-full text-left px-3 py-1.5 text-xs capitalize transition-colors ${
                                        notifFilter === mode
                                          ? "font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40"
                                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      {mode}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Notification List */}
                        <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                          {filteredNotifications.length === 0 ? (
                            <div className="py-12 px-4 text-center">
                              <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                              <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                                You&apos;re all caught up!
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                No notifications match your current filter.
                              </p>
                            </div>
                          ) : (
                            filteredNotifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3 ${
                                  notif.isUnread ? "bg-blue-50/25 dark:bg-blue-950/20" : ""
                                }`}
                              >
                                {/* Avatar with Community Globe Badge Overlay */}
                                <div className="relative shrink-0">
                                  <img
                                    src={notif.senderAvatar}
                                    alt={notif.senderName}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <Globe className="w-2.5 h-2.5 text-slate-600 dark:text-slate-300" />
                                  </div>
                                </div>

                                {/* Content Snippet */}
                                <div className="flex-1 min-w-0 pr-1">
                                  <p className="text-xs text-[#0F172A] dark:text-slate-100 leading-snug">
                                    <span className="font-bold">{notif.senderName}</span>{" "}
                                    <span className="text-[#64748B] dark:text-slate-400 font-normal">
                                      {notif.actionText}
                                    </span>
                                    <span className="text-[#94A3B8] font-normal text-[11px]">
                                      {" "}
                                      • {notif.timeAgo}
                                    </span>
                                  </p>
                                  <p className="text-xs text-[#475569] dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                                    {notif.snippet}
                                  </p>
                                </div>

                                {/* Unread Blue Dot Indicator */}
                                {notif.isUnread && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0 mt-2 shadow-xs ring-2 ring-blue-100 dark:ring-blue-950" />
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium text-[11px]">
                            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
                          </span>
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setShowNotifications(false);
                            }}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                          >
                            Dismiss All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Dark/Light Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Member Profile Avatar or Guest Sign In */}
              {currentMember ? (
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

                  {/* Profile Dropdown */}
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

                      <div className="border-t border-[#E2E8F0] dark:border-slate-700 mt-2 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?tab=register"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Join Community</span>
                  </Link>
                </div>
              )}
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
      {currentMember && (
        <MembershipModal
          isOpen={isMembershipOpen}
          onClose={() => setIsMembershipOpen(false)}
          currentMember={currentMember}
          onUpdateTier={handleUpdateTier}
        />
      )}

      {/* Profile Edit Modal */}
      {currentMember && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          member={currentMember}
          onSave={handleUpdateProfile}
        />
      )}
    </>
  );
}
