"use client";

import { useState, useEffect } from "react";
import {
  Video,
  Radio,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle,
  Play,
  Shield,
  Download,
  AlertCircle,
} from "lucide-react";
import { LiveSessionRoom, PlanTier } from "@/lib/types";
import { MOCK_LIVE_SESSIONS } from "@/lib/school-mock";

interface LiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier?: PlanTier;
}

export function LiveRoomModal({ isOpen, onClose, userTier = "free" }: LiveRoomModalProps) {
  const [activeSession, setActiveSession] = useState<LiveSessionRoom>(MOCK_LIVE_SESSIONS[0]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSessionRoom[]>([MOCK_LIVE_SESSIONS[1]]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(MOCK_LIVE_SESSIONS[0].id);
  const [isJoinedNative, setIsJoinedNative] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/community/live-rooms")
        .then((res) => res.json())
        .then((data) => {
          if (data.active_session) {
            setActiveSession(data.active_session);
            setSelectedSessionId(data.active_session.id);
          }
          if (data.upcoming_sessions) setUpcomingSessions(data.upcoming_sessions);
        })
        .catch((err) => console.warn("Using offline mock fallback for live sessions:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current =
    activeSession?.id === selectedSessionId
      ? activeSession
      : upcomingSessions.find((s) => s.id === selectedSessionId) || activeSession;

  const isLockedForUser = current.required_tier === "vip" && userTier !== "vip";

  const downloadCalendarIcs = () => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AKSchool//Live Coaching Room//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${current.title}`,
      `DESCRIPTION:${current.description}\\nJoin URL: ${current.join_url}`,
      `DTSTART:${new Date(current.scheduled_start).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${new Date(new Date(current.scheduled_start).getTime() + current.duration_minutes * 60000).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `URL:${current.join_url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `akschool_live_session_${current.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <Video className="w-5 h-5" />
              </div>
              {current.is_live_now && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800 animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {current.is_live_now ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    <span>Broadcasting Live</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                    Scheduled Coaching
                  </span>
                )}
                <span className="text-xs text-slate-400 capitalize">{current.platform} Room</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                AKSchool Live Coaching & War Rooms
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Room Stage Hero */}
        <div className="relative rounded-3xl bg-slate-950 overflow-hidden border border-slate-800 aspect-video flex items-center justify-center text-center p-6 shadow-xl">
          {/* Subtle Ambient Background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/30 via-slate-950 to-blue-950/30"></div>

          {isJoinedNative ? (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={`${current.join_url}#config.startWithVideoMuted=true&config.prejoinPageEnabled=false`}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full rounded-2xl border-0"
              />
            </div>
          ) : (
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto ring-4 ring-white/10">
                {current.is_live_now ? (
                  <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
                ) : (
                  <Clock className="w-8 h-8 text-blue-400" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{current.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{current.description}</p>
              </div>

              {isLockedForUser ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <p className="font-bold flex items-center justify-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>VIP Executive Membership Required</span>
                  </p>
                  <p className="text-[11px] text-amber-400/80 mt-0.5">
                    Upgrade to VIP tier to access private architectural war rooms.
                  </p>
                </div>
              ) : current.is_live_now ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {current.platform === "native" ? (
                    <button
                      onClick={() => setIsJoinedNative(true)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Launch Embedded Stream</span>
                    </button>
                  ) : null}
                  <a
                    href={current.join_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>Join on {current.platform.toUpperCase()}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">
                    Starts on {new Date(current.scheduled_start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <button
                    onClick={downloadCalendarIcs}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs flex items-center gap-2 mx-auto"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Host & Agenda Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Host info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <img src={current.host_avatar} alt={current.host_name} className="w-12 h-12 rounded-2xl object-cover" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Host & Lead Architect</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">{current.host_name}</p>
              <p className="text-[11px] text-slate-500">Live Attendees: <strong>{current.attendees_count} Builders</strong></p>
            </div>
          </div>

          {/* Quick Schedule Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Session
            </span>
            <div className="space-y-1">
              {[activeSession, ...upcomingSessions].filter(Boolean).map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setIsJoinedNative(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedSessionId === session.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate max-w-[220px]">{session.title}</span>
                  {session.is_live_now && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white shrink-0">
                      LIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agenda Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workshop & Coaching Agenda</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {current.agenda.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
