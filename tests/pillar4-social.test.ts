import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as postVote } from "@/app/api/v1/community/polls/vote/route";
import { GET as getMessages, POST as postMessage } from "@/app/api/v1/community/messages/route";
import { GET as getEvents, POST as postEventRsvp } from "@/app/api/v1/community/events/route";
import { GET as getEventIcs } from "@/app/api/v1/community/events/[id]/ics/route";

describe("Pillar 4: Real-Time Social & Community Features Suite", () => {
  describe("1. Interactive Polls Engine", () => {
    it("should reject poll voting when post_id or option_id is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/polls/vote", {
        method: "POST",
        body: JSON.stringify({ postId: "post_001" }),
      });
      const res = await postVote(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/post_id and option_id are required/i);
    });

    it("should successfully record a vote and recalculate option percentages", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/polls/vote", {
        method: "POST",
        body: JSON.stringify({
          postId: "post_001",
          optionId: "opt_01_a",
          memberId: "mem_sarah",
        }),
      });
      const res = await postVote(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalVotes).toBeGreaterThan(0);
      expect(json.data.hasVoted).toBe(true);
      expect(json.data.userVotedOptionId).toBe("opt_01_a");

      // Verify percentages sum to approximately 100%
      const totalPercentage = json.data.options.reduce(
        (sum: number, opt: { percentage: number }) => sum + opt.percentage,
        0
      );
      expect(totalPercentage).toBeGreaterThanOrEqual(98);
      expect(totalPercentage).toBeLessThanOrEqual(102);
    });
  });

  describe("2. 1-on-1 Direct Messaging System", () => {
    it("should list available direct message conversations", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/messages");
      const res = await getMessages(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.conversations)).toBe(true);
      expect(json.conversations.length).toBeGreaterThan(0);
      expect(json.conversations[0].participant).toHaveProperty("full_name");
    });

    it("should reject sending a direct message without content", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/messages", {
        method: "POST",
        body: JSON.stringify({ recipientId: "mem_sarah", content: "   " }),
      });
      const res = await postMessage(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Message content cannot be empty/i);
    });

    it("should send a new direct message and return the message object", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/messages", {
        method: "POST",
        body: JSON.stringify({
          senderId: "mem_akaash",
          recipientId: "mem_sarah",
          content: "Hey Sarah, check out the new RAG workshop schedule!",
        }),
      });
      const res = await postMessage(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.content).toBe("Hey Sarah, check out the new RAG workshop schedule!");
      expect(json.data.sender_id).toBe("mem_akaash");
    });
  });

  describe("3. Community Events Calendar & .ics Export", () => {
    it("should return the list of scheduled community events", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/events");
      const res = await getEvents(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.events)).toBe(true);
      expect(json.events.length).toBeGreaterThan(0);
      expect(json.events[0]).toHaveProperty("title");
      expect(json.events[0]).toHaveProperty("attendees_count");
    });

    it("should toggle RSVP attendance for a member", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/events", {
        method: "POST",
        body: JSON.stringify({
          eventId: "evt_001",
          memberId: "mem_tester",
        }),
      });
      const res = await postEventRsvp(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.eventId).toBe("evt_001");
      expect(typeof json.data.isAttending).toBe("boolean");
    });

    it("should generate a standard RFC 5545 .ics iCalendar file for an event", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/events/evt_001/ics");
      const res = await getEventIcs(req, {
        params: Promise.resolve({ id: "evt_001" }),
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/calendar");
      expect(res.headers.get("content-disposition")).toContain("attachment; filename=");

      const icsText = await res.text();
      expect(icsText).toContain("BEGIN:VCALENDAR");
      expect(icsText).toContain("VERSION:2.0");
      expect(icsText).toContain("PRODID:-//AKSchool//Autonomous Academy Events//EN");
      expect(icsText).toContain("BEGIN:VEVENT");
      expect(icsText).toContain("SUMMARY:Weekly Office Hours & Architecture Teardown with Akaash");
      expect(icsText).toContain("END:VEVENT");
      expect(icsText).toContain("END:VCALENDAR");
    });

    it("should return 404 when requesting .ics for an unknown event", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/events/evt_nonexistent/ics");
      const res = await getEventIcs(req, {
        params: Promise.resolve({ id: "evt_nonexistent" }),
      });
      expect(res.status).toBe(404);
      const text = await res.text();
      expect(text).toMatch(/Event not found/i);
    });
  });
});
