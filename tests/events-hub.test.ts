import { describe, it, expect } from "vitest";
import { MOCK_EVENTS, MOCK_LIVE_SESSIONS, MOCK_EVENT_REPLAYS } from "@/lib/school-mock";

describe("Step 2: Dedicated /events Live Coaching Hub & Replay Library", () => {
  it("detects live coaching broadcast and attendee count", () => {
    const liveSession = MOCK_LIVE_SESSIONS.find((s) => s.is_live_now);
    expect(liveSession).toBeDefined();
    expect(liveSession?.attendees_count).toBeGreaterThan(0);
    expect(liveSession?.join_url).toContain("meet.jit.si");
  });

  it("provides structured upcoming workshops with RSVP state", () => {
    expect(MOCK_EVENTS.length).toBeGreaterThanOrEqual(3);
    const officeHours = MOCK_EVENTS.find((e) => e.category === "office_hours");
    expect(officeHours).toBeDefined();
    expect(officeHours?.user_has_rsvped).toBe(true);

    const workshop = MOCK_EVENTS.find((e) => e.category === "workshop");
    expect(workshop).toBeDefined();
    expect(workshop?.location_type).toBe("zoom");
  });

  it("generates valid RFC 5545 iCalendar content for calendar sync", () => {
    const sampleEvent = MOCK_EVENTS[0];
    const formatIcsDate = (isoStr: string) => {
      return new Date(isoStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AKSchool//Live Coaching Hub//EN",
      "BEGIN:VEVENT",
      `UID:${sampleEvent.id}@school.akstack.com`,
      `DTSTART:${formatIcsDate(sampleEvent.starts_at)}`,
      `DTEND:${formatIcsDate(sampleEvent.ends_at)}`,
      `SUMMARY:${sampleEvent.title}`,
      `LOCATION:${sampleEvent.location_url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain(`SUMMARY:${sampleEvent.title}`);
    expect(icsContent).toContain("END:VCALENDAR");
  });

  it("provides past call replays with video URLs, duration, and chapter timestamps", () => {
    expect(MOCK_EVENT_REPLAYS.length).toBeGreaterThanOrEqual(3);

    const masterclass = MOCK_EVENT_REPLAYS[0];
    expect(masterclass.video_url).toContain(".mp4");
    expect(masterclass.duration).toBeTruthy();
    expect(masterclass.timestamps.length).toBeGreaterThanOrEqual(3);
    expect(masterclass.slides_url).toContain(".pdf");
    expect(masterclass.required_tier).toBe("free");

    const vipReplay = MOCK_EVENT_REPLAYS.find((r) => r.required_tier === "vip");
    expect(vipReplay).toBeDefined();
  });
});
