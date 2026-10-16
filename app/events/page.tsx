"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { LiveRoomModal } from "@/components/LiveRoomModal";
import { MembershipModal } from "@/components/MembershipModal";
import {
  Calendar as CalendarIcon,
  Radio,
  Clock,
  Video,
  Users,
  Sparkles,
  Download,
  ExternalLink,
  CheckCircle,
  Play,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Plus,
  Share2,
  CalendarCheck,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import {
  MOCK_EVENTS,
  MOCK_LIVE_SESSIONS,
  MOCK_EVENT_REPLAYS,
  MOCK_MEMBERS,
} from "@/lib/school-mock";
import { CommunityEvent, LiveSessionRoom, EventReplay, Member } from "@/lib/types";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export default function EventsHubPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "calendar" | "replays">("upcoming");
  const [events, setEvents] = useState<CommunityEvent[]>(MOCK_EVENTS);
  const [liveSessions, setLiveSessions] = useState<LiveSessionRoom[]>(MOCK_LIVE_SESSIONS);
  const [replays] = useState<EventReplay[]>(MOCK_EVENT_REPLAYS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [activeReplay, setActiveReplay] = useState<EventReplay | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Month calendar navigation state
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 9, 1)); // October 2026

  useEffect(() => {
    const active = getActiveMember();
    setCurrentMember(active || MOCK_MEMBERS[0]);
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      setCurrentMember(updated || MOCK_MEMBERS[0]);
    });
    return () => unsubscribe();
  }, []);

  // Check if any call is live right now
  const liveNow = liveSessions.find((s) => s.is_live_now);

  // RSVP toggle
  const handleToggleRsvp = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const willRsvp = !e.user_has_rsvped;
          return {
            ...e,
            user_has_rsvped: willRsvp,
            attendees_count: willRsvp ? e.attendees_count + 1 : Math.max(0, e.attendees_count - 1),
          };
        }
        return e;
      })
    );
  };

  // Generate RFC 5545 iCalendar format file
  const handleDownloadIcs = (event: CommunityEvent) => {
    const formatIcsDate = (isoStr: string) => {
      const date = new Date(isoStr);
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AKSchool//Live Coaching Hub//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@school.akstack.com`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(event.starts_at)}`,
      `DTEND:${formatIcsDate(event.ends_at)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location_url}`,
      `URL:${event.location_url}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (event: CommunityEvent) => {
    const formatGDate = (isoStr: string) => {
      return new Date(isoStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
    };
    const start = formatGDate(event.starts_at);
    const end = formatGDate(event.ends_at);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      event.description + "\n\nJoin URL: " + event.location_url
    )}&location=${encodeURIComponent(event.location_url)}`;
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });

  const categories = [
    { id: "all", label: "All Sessions" },
    { id: "office_hours", label: "Office Hours" },
    { id: "workshop", label: "Workshops" },
    { id: "hackathon", label: "Hackathons" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================================================================= */}
        {/* HERO STAGE: Live Stream Active Banner OR Next Scheduled Session  */}
        {/* ================================================================= */}
        {liveNow ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-900 border-2 border-rose-500/40 p-6 sm:p-8 text-white shadow-2xl shadow-rose-950/30 animate-in fade-in">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black tracking-wider uppercase shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Broadcasting Live Now</span>
                  <span className="text-white/60">•</span>
                  <span className="text-rose-200">{liveNow.attendees_count} Builders In Room</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {liveNow.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 line-clamp-2">
                  {liveNow.description}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={liveNow.host_avatar}
                    alt={liveNow.host_name}
                    className="w-8 h-8 rounded-full ring-2 ring-rose-500 object-cover"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Host: {liveNow.host_name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => setIsLiveModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>Enter Live Coaching Room</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/30 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Live Call: Thursday @ 6:00 PM EST</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Weekly Architecture Audit & Live Q&A
                </h1>
                <p className="text-sm text-slate-300">
                  Bring your active AI agent graphs, deployment manifests, and error logs for live tear-downs with Akaash Sharma.
                </p>
              </div>
              <button
                onClick={() => handleToggleRsvp(events[0]?.id || "evt_001")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{events[0]?.user_has_rsvped ? "RSVP Confirmed ✓" : "1-Click RSVP"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SUBNAV TABS: Upcoming | Calendar Grid | Replay Archive            */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "upcoming"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Upcoming Workshops ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Monthly Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab("replays")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "replays"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Past Call Replays ({replays.length})</span>
            </button>
          </div>

          {/* Category Filters for Upcoming */}
          {activeTab === "upcoming" && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: UPCOMING WORKSHOPS LIST VIEW                               */}
        {/* ================================================================= */}
        {activeTab === "upcoming" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const startDate = new Date(event.starts_at);
              const formattedDate = startDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = startDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              });

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Header: Date Badge & Category */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {event.category.replace("_", " ")}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {event.attendees_count} Attending
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Date & Time Row */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Host Avatar */}
                    {event.host_member && (
                      <div className="flex items-center gap-2.5 pt-1">
                        <img
                          src={event.host_member.avatar_url}
                          alt={event.host_member.full_name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {event.host_member.full_name}
                          </p>
                          <p className="text-[10px] text-slate-400">Host</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleRsvp(event.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        event.user_has_rsvped
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      }`}
                    >
                      {event.user_has_rsvped ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>RSVP Confirmed</span>
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>1-Click RSVP</span>
                        </>
                      )}
                    </button>

                    {/* Calendar Sync Dropdown / Buttons */}
                    <button
                      onClick={() => handleDownloadIcs(event)}
                      title="Download .ics Calendar File"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Google Calendar"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MONTHLY CALENDAR GRID VIEW                                 */}
        {/* ================================================================= */}
        {activeTab === "calendar" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {monthName} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 sm:h-28 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dayEvents = events.filter((e) => e.starts_at.startsWith(dateStr));
                const isToday = dayNum === 16 && month === 9; // Demo today

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`h-24 sm:h-28 p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                      isToday
                        ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => handleToggleRsvp(evt.id)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 truncate cursor-pointer hover:opacity-80"
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: PAST CALL REPLAYS VIDEO ARCHIVE                            */}
        {/* ================================================================= */}
        {activeTab === "replays" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Workshop Replay Library
                </h2>
                <p className="text-xs text-slate-500">
                  Full recordings, downloadable blueprints, and interactive chapter timestamps.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replays.map((rep) => {
                const isGated =
                  (rep.required_tier === "pro" && currentMember?.plan_tier === "free") ||
                  (rep.required_tier === "vip" && currentMember?.plan_tier !== "vip");

                return (
                  <div
                    key={rep.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                  >
                    {/* Thumbnail with duration badge */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={rep.thumbnail_url}
                        alt={rep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                          {rep.duration}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          {rep.views_count} Views
                        </span>
                      </div>

                      {/* Tier Badge */}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white border border-white/20">
                        {rep.required_tier.toUpperCase()} TIER
                      </span>

                      {/* Center Play Button Overlay */}
                      <button
                        onClick={() => {
                          if (isGated) {
                            setIsMembershipOpen(true);
                          } else {
                            setActiveReplay(rep);
                          }
                        }}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        {isGated ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={rep.speaker_avatar}
                            alt={rep.speaker}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {rep.speaker}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {rep.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {rep.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        {rep.slides_url ? (
                          <a
                            href={rep.slides_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Slides</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">No slides attached</span>
                        )}

                        <button
                          onClick={() => {
                            if (isGated) {
                              setIsMembershipOpen(true);
                            } else {
                              setActiveReplay(rep);
                            }
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
                        >
                          {isGated ? "Unlock Access →" : "Watch Replay →"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* ACTIVE REPLAY MODAL PLAYER WITH TIMESTAMPS & SLIDES               */}
      {/* ================================================================= */}
      {activeReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Workshop Replay
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-lg">
                  {activeReplay.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveReplay(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black w-full">
              <video
                src={activeReplay.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Timestamps & Slide Download Footer */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Chapter Breakdown & Timestamps
                </h4>
                {activeReplay.slides_url && (
                  <a
                    href={activeReplay.slides_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Session Presentation (.PDF)</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeReplay.timestamps.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{t.label}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono font-bold">
                      {t.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nova AI Copilot Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Live Room Broadcasting Modal */}
      <LiveRoomModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        userTier={currentMember?.plan_tier || "free"}
      />

      {/* Membership Upgrade Modal */}
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
        currentMember={currentMember || MOCK_MEMBERS[0]}
        onUpdateTier={() => setIsMembershipOpen(false)}
      />
    </div>
  );
}
