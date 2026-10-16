"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  Trophy,
  DollarSign,
  Shield,
  Sparkles,
  Radio,
  ArrowRight,
  Flame,
  Sun,
  Moon,
  ExternalLink,
  Zap,
  User,
  Settings,
} from "lucide-react";
import { MOCK_COURSES, MOCK_MEMBERS, MOCK_POSTS } from "@/lib/school-mock";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveRoom?: () => void;
  onOpenAffiliate?: () => void;
  onOpenAi?: () => void;
  onToggleTheme?: () => void;
}

interface PaletteItem {
  id: string;
  category: "Navigation" | "Courses & Lessons" | "Community Posts" | "Members" | "Actions";
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  badge?: string;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onOpenLiveRoom,
  onOpenAffiliate,
  onOpenAi,
  onToggleTheme,
}: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct searchable inventory
  const baseItems: PaletteItem[] = [
    // Primary Hubs
    {
      id: "nav-community",
      category: "Navigation",
      title: "Community Discussions",
      subtitle: "Browse spaces, polls, and announcements",
      icon: MessageSquare,
      action: () => { router.push("/community"); onClose(); },
      badge: "Feed",
    },
    {
      id: "nav-classroom",
      category: "Navigation",
      title: "Classroom & Courses",
      subtitle: "Watch lessons, take quizzes, earn certificates",
      icon: BookOpen,
      action: () => { router.push("/classroom"); onClose(); },
      badge: "LMS",
    },
    {
      id: "nav-events",
      category: "Navigation",
      title: "Live Events & Coaching Hub",
      subtitle: "Weekly live streams, calendar, and past replays",
      icon: Calendar,
      action: () => { router.push("/events"); onClose(); },
      badge: "Live",
    },
    {
      id: "nav-leaderboard",
      category: "Navigation",
      title: "Leaderboard & Hall of Fame",
      subtitle: "Season rankings, streaks, and point tiers",
      icon: Trophy,
      action: () => { router.push("/leaderboard"); onClose(); },
      badge: "Rankings",
    },
    {
      id: "nav-affiliates",
      category: "Navigation",
      title: "Affiliate & Partner Portal",
      subtitle: "Generate referral links, view commissions & payouts",
      icon: DollarSign,
      action: () => {
        if (onOpenAffiliate) { onOpenAffiliate(); } else { router.push("/affiliates"); }
        onClose();
      },
      badge: "Earn",
    },
    {
      id: "nav-members",
      category: "Navigation",
      title: "Members Directory",
      subtitle: "Search fellow engineers, builders, and instructors",
      icon: Users,
      action: () => { router.push("/members"); onClose(); },
      badge: "Social",
    },
    {
      id: "nav-profile",
      category: "Navigation",
      title: "My Profile & Trophy Room",
      subtitle: "View your verified certificates, streaks, and achievements",
      icon: User,
      action: () => { router.push("/profile"); onClose(); },
      badge: "Trophy",
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Account Settings & Invoicing",
      subtitle: "Manage billing, subscription tiers, tax receipts, and 2FA",
      icon: Settings,
      action: () => { router.push("/settings"); onClose(); },
      badge: "Account",
    },
    {
      id: "nav-admin",
      category: "Navigation",
      title: "Operations & Admin Console",
      subtitle: "Creator analytics, GTM logs, broadcasts, and gateways",
      icon: Shield,
      action: () => { router.push("/admin"); onClose(); },
      badge: "Admin",
    },

    // Quick Actions
    {
      id: "act-live",
      category: "Actions",
      title: "Enter Live Coaching Room",
      subtitle: "Join the current live session stage",
      icon: Radio,
      action: () => {
        if (onOpenLiveRoom) { onOpenLiveRoom(); } else { router.push("/events"); }
        onClose();
      },
      badge: "🔴 LIVE",
    },
    {
      id: "act-copilot",
      category: "Actions",
      title: "Ask Nova AI Copilot",
      subtitle: "Instant code blueprints and curriculum assistance",
      icon: Sparkles,
      action: () => {
        if (onOpenAi) onOpenAi();
        onClose();
      },
      badge: "AI",
    },
    {
      id: "act-theme",
      category: "Actions",
      title: "Toggle Dark / Light Theme",
      subtitle: "Switch application visual appearance",
      icon: Sun,
      action: () => {
        if (onToggleTheme) onToggleTheme();
        onClose();
      },
    },

    // Courses & Lessons
    ...MOCK_COURSES.flatMap((c) => [
      {
        id: `course-${c.id}`,
        category: "Courses & Lessons" as const,
        title: c.title,
        subtitle: `${c.required_tier.toUpperCase()} tier • ${c.total_lessons} lessons`,
        icon: BookOpen,
        action: () => { router.push("/classroom"); onClose(); },
        badge: c.required_tier === "free" ? "Free" : c.required_tier.toUpperCase(),
      },
      ...(c.modules || []).flatMap((m) =>
        (m.lessons || []).slice(0, 3).map((l) => ({
          id: `lesson-${l.id}`,
          category: "Courses & Lessons" as const,
          title: l.title,
          subtitle: `${c.title} › ${m.title}`,
          icon: Zap,
          action: () => { router.push("/classroom"); onClose(); },
        }))
      ),
    ]),

    // Community Posts
    ...MOCK_POSTS.slice(0, 5).map((p) => ({
      id: `post-${p.id}`,
      category: "Community Posts" as const,
      title: p.title,
      subtitle: `By ${p.author.full_name} • ${p.likes_count} likes • ${p.comments_count} replies`,
      icon: MessageSquare,
      action: () => { router.push("/community"); onClose(); },
      badge: "Discussion",
    })),

    // Members
    ...MOCK_MEMBERS.slice(0, 6).map((m) => ({
      id: `member-${m.id}`,
      category: "Members" as const,
      title: m.full_name,
      subtitle: `${m.bio || "Community Member"} • ${m.points} pts`,
      icon: Users,
      action: () => { router.push("/members"); onClose(); },
      badge: m.role.toUpperCase(),
    })),
  ];

  // Filtering
  const filteredItems = baseItems.filter((item) => {
    if (!query.trim()) return item.category === "Navigation" || item.category === "Actions";
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 14);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base font-medium"
            placeholder="Type a command, search lessons, members, or navigate..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-medium">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for &quot;events&quot;, &quot;classroom&quot;, &quot;live&quot; or &quot;agent&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-snug">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-snug">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400 capitalize hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <span className="text-slate-400">Search powered by AKSchool Engine</span>
        </div>
      </div>
    </div>
  );
}
