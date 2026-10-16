import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAffiliateMe, POST as postAffiliateMe } from "@/app/api/v1/affiliates/me/route";
import { GET as getAdminAffiliates, POST as postAdminAffiliates } from "@/app/api/v1/admin/affiliates/route";
import { GET as getBroadcasts, POST as postBroadcast } from "@/app/api/v1/admin/broadcasts/route";
import { GET as getLiveRooms, POST as postLiveRooms } from "@/app/api/v1/community/live-rooms/route";

describe("Growth Suite: Affiliates, Email Broadcasts & Live Rooms", () => {
  describe("1. Affiliate & Referral Engine", () => {
    it("should retrieve member affiliate partner account and referral link", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/affiliates/me?member_id=usr_admin_001");
      const res = await getAffiliateMe(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.affiliate).toHaveProperty("referral_code");
      expect(json.affiliate).toHaveProperty("referral_url");
      expect(json.affiliate.commission_rate_pct).toBeGreaterThan(0);
      expect(Array.isArray(json.conversions)).toBe(true);
    });

    it("should update member payout email and custom referral code", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/affiliates/me", {
        method: "POST",
        body: JSON.stringify({
          member_id: "usr_admin_001",
          payout_email: "updated.payout@gmail.com",
          payout_method: "stripe",
          custom_code: "SUPERBUILDER",
        }),
      });

      const res = await postAffiliateMe(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.affiliate.payout_email).toBe("updated.payout@gmail.com");
      expect(json.affiliate.referral_code).toBe("SUPERBUILDER");
      expect(json.affiliate.referral_url).toContain("ref=SUPERBUILDER");
    });

    it("should provide SuperAdmin affiliate program statistics and partner list", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/affiliates");
      const res = await getAdminAffiliates(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.stats.total_partners).toBeGreaterThan(0);
      expect(json.stats.total_referrals).toBeGreaterThan(0);
      expect(Array.isArray(json.affiliates)).toBe(true);
    });

    it("should allow SuperAdmin to update default commission and record payout", async () => {
      // 1. Update config
      const configReq = new NextRequest("http://localhost:3000/api/v1/admin/affiliates", {
        method: "POST",
        body: JSON.stringify({
          action: "update_config",
          config: { default_commission_pct: 35, cookie_duration_days: 90 },
        }),
      });
      const configRes = await postAdminAffiliates(configReq);
      expect(configRes.status).toBe(200);
      const configJson = await configRes.json();
      expect(configJson.config.default_commission_pct).toBe(35);
      expect(configJson.config.cookie_duration_days).toBe(90);

      // 2. Record payout
      const payoutReq = new NextRequest("http://localhost:3000/api/v1/admin/affiliates", {
        method: "POST",
        body: JSON.stringify({
          action: "record_payout",
          affiliate_id: "aff_001",
          payout_amount: 50,
        }),
      });
      const payoutRes = await postAdminAffiliates(payoutReq);
      expect(payoutRes.status).toBe(200);
      const payoutJson = await payoutRes.json();
      expect(payoutJson.success).toBe(true);
      expect(payoutJson.message).toMatch(/recorded payout/i);
    });
  });

  describe("2. Automated Email & Newsletter Broadcasts", () => {
    it("should retrieve sent broadcasts and newsletter templates", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/broadcasts");
      const res = await getBroadcasts(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.broadcasts)).toBe(true);
      expect(Array.isArray(json.templates)).toBe(true);
      expect(json.templates.length).toBeGreaterThan(0);
      expect(json.stats.total_sent).toBeGreaterThan(0);
    });

    it("should compose and send a community newsletter broadcast", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/broadcasts", {
        method: "POST",
        body: JSON.stringify({
          subject: "🚀 Exclusive Masterclass: Autonomous Multi-Agent Swarms",
          preview_text: "Join us this Thursday for a live architectural review",
          content_html: "<p>Hello Builder,</p><p>You are invited to our live architectural teardown.</p>",
          audience: "pro_only",
          status: "sent",
        }),
      });

      const res = await postBroadcast(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.broadcast.subject).toContain("Exclusive Masterclass");
      expect(json.broadcast.audience).toBe("pro_only");
      expect(json.broadcast.recipient_count).toBe(380); // Pro audience count
      expect(json.broadcast.sent_at).toBeDefined();
    });
  });

  describe("3. Live Coaching & Meeting Rooms", () => {
    it("should list active broadcasting sessions and upcoming coaching calls", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/live-rooms");
      const res = await getLiveRooms(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.active_session).toBeDefined();
      expect(json.active_session.is_live_now).toBe(true);
      expect(Array.isArray(json.upcoming_sessions)).toBe(true);
      expect(Array.isArray(json.active_session.agenda)).toBe(true);
    });

    it("should schedule a new live coaching workshop", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/live-rooms", {
        method: "POST",
        body: JSON.stringify({
          title: "Hands-on Code Review: LangGraph Deadlock Recovery",
          description: "Live debugging and optimization with community members",
          platform: "google_meet",
          join_url: "https://meet.google.com/abc-defg-hij",
          scheduled_start: "2026-10-22T15:00:00Z",
          agenda: ["Inspect agent loops", "Trace memory leaks", "Q&A"],
          required_tier: "free",
        }),
      });

      const res = await postLiveRooms(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.title).toBe("Hands-on Code Review: LangGraph Deadlock Recovery");
      expect(json.session.platform).toBe("google_meet");
      expect(json.session.is_live_now).toBe(false);
    });

    it("should toggle live status for a session", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/community/live-rooms", {
        method: "POST",
        body: JSON.stringify({
          action: "toggle_live",
          id: "live_002",
        }),
      });

      const res = await postLiveRooms(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.is_live_now).toBe(true);
    });
  });
});
