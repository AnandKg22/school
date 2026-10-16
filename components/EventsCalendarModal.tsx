"use client";

import React, { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  ExternalLink,
  Download,
  Users,
  Sparkles,
  Filter
} from "lucide-react";
import { CommunityEvent } from "@/lib/types";
import { MOCK_EVENTS } from "@/lib/school-mock";

interface EventsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventsCalendarModal: React.FC<EventsCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [events, setEvents] = useState<CommunityEvent[]>(MOCK_EVENTS);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!isOpen) return null;

  const handleToggleRsvp = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const willRsvp = !evt.user_has_rsvped;
          return {
            ...evt,
            user_has_rsvped: willRsvp,
            attendees_count: willRsvp ? evt.attendees_count + 1 : Math.max(0, evt.attendees_count - 1),
          };
        }
        return evt;
      })
    );
  };

  const handleDownloadIcs = (event: CommunityEvent) => {
    // Generate RFC 5545 iCalendar format string
    const formatIcsDate = (isoStr: string) => {
      const date = new Date(isoStr);
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AKSchool//Autonomous Academy Events//EN",
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

  const getGoogleCalendarUrl = (event: CommunityEvent) => {
    const formatGoogleDate = (isoStr: string) => {
      return new Date(isoStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const dates = `${formatGoogleDate(event.starts_at)}/${formatGoogleDate(event.ends_at)}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      details: `${event.description}\n\nJoin Link: ${event.location_url}`,
      location: event.location_url,
      dates,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const filteredEvents = events.filter((e) => {
    if (activeCategory === "all") return true;
    return e.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Community Events & Workshops
              </h3>
              <p className="text-xs text-slate-300">
                Live office hours, hackathons, and architecture deep dives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="px-6 py-3 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: "all", label: "All Events" },
            { id: "office_hours", label: "Office Hours" },
            { id: "workshop", label: "Workshops" },
            { id: "hackathon", label: "Hackathons" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[#64748B] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filteredEvents.map((evt) => {
            const startDate = new Date(evt.starts_at);
            const dateMonth = startDate.toLocaleDateString("en-US", { month: "short" });
            const dateDay = startDate.toLocaleDateString("en-US", { day: "numeric" });
            const timeStr = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={evt.id}
                className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[#E2E8F0] dark:border-slate-700/80 p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col sm:flex-row gap-4 items-start"
              >
                {/* Date Block */}
                <div className="w-14 sm:w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-2 text-center shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {dateMonth}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white leading-tight">
                    {dateDay}
                  </div>
                  <div className="text-[9px] text-[#64748B] dark:text-slate-400 font-bold mt-0.5">
                    {timeStr}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {evt.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(evt.starts_at).toLocaleDateString([], {
                          weekday: "short",
                        })}
                        , {timeStr} GMT
                      </span>
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-[#0F172A] dark:text-white leading-snug">
                    {evt.title}
                  </h4>

                  <p className="text-xs text-[#64748B] dark:text-slate-300 mt-1.5 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Host and Attendees bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={evt.host_member.avatar_url}
                        alt={evt.host_member.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-[11px] text-[#475569] dark:text-slate-300 font-medium">
                        Hosted by <strong>{evt.host_member.full_name}</strong>
                      </span>
                      <span className="text-[#64748B] dark:text-slate-400 text-[11px] flex items-center gap-1 ml-2 font-semibold">
                        <Users className="w-3 h-3" />
                        <span>{evt.attendees_count} attending</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRsvp(evt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          evt.user_has_rsvped
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{evt.user_has_rsvped ? "RSVP'd ✓" : "RSVP Attend"}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadIcs(evt)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F8FAFC] dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-600 transition-colors flex items-center gap-1"
                        title="Download standard .ics iCalendar file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.ics</span>
                      </button>

                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 hover:bg-blue-50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1"
                        title="Add directly to Google Calendar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Cal</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
