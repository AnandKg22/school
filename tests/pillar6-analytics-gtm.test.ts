import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAnalyticsOverview } from "@/app/api/v1/analytics/overview/route";
import { GET as getGtmLogs, POST as postGtmLog } from "@/app/api/v1/analytics/gtm/logs/route";
import { GET as getManagers, POST as postManager, DELETE as deleteManager } from "@/app/api/v1/admin/managers/route";

describe("Pillar 6: Creator Analytics, GTM Engineering & Delegated Views Suite", () => {
  describe("1. Creator Financial, Churn & Engagement Analytics Engine", () => {
    it("should retrieve full analytics overview with MRR, ARR, Churn, and LMS funnels", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/overview");
      const res = await getAnalyticsOverview(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.analytics).toHaveProperty("revenue");
      expect(json.analytics).toHaveProperty("churn");
      expect(json.analytics).toHaveProperty("courses");
      expect(json.analytics).toHaveProperty("engagement");

      // Verify Revenue Metrics
      const { revenue, churn, courses, engagement } = json.analytics;
      expect(revenue.mrr).toBeGreaterThan(0);
      expect(revenue.arr).toBe(revenue.mrr * 12);
      expect(revenue.growth_rate_pct).toBeGreaterThan(0);
      expect(revenue.by_gateway.stripe).toBeGreaterThan(0);
      expect(revenue.by_gateway.paypal).toBeGreaterThan(0);

      // Verify Churn Metrics
      expect(churn.churn_rate_pct).toBeLessThan(10); // Under 10% healthy SaaS churn
      expect(churn.retention_rate_pct).toBeGreaterThan(90);
      expect(churn.voluntary_cancellations_30d).toBeGreaterThanOrEqual(0);
      expect(churn.payment_failures_30d).toBeGreaterThanOrEqual(0);

      // Verify Course Completion Funnels
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
      const firstCourse = courses[0];
      expect(firstCourse).toHaveProperty("enrolled_count");
      expect(firstCourse).toHaveProperty("started_count");
      expect(firstCourse).toHaveProperty("completed_count");
      expect(firstCourse).toHaveProperty("completion_rate_pct");
      expect(firstCourse).toHaveProperty("quiz_pass_rate_pct");
      expect(firstCourse.started_count).toBeLessThanOrEqual(firstCourse.enrolled_count);
      expect(firstCourse.completed_count).toBeLessThanOrEqual(firstCourse.started_count);

      // Verify Community Engagement Metrics
      expect(engagement.dau).toBeGreaterThan(0);
      expect(engagement.mau).toBeGreaterThan(engagement.dau);
      expect(engagement.stickiness_ratio).toBeCloseTo((engagement.dau / engagement.mau) * 100, 1);
      expect(Array.isArray(engagement.top_contributors)).toBe(true);
      expect(engagement.top_contributors.length).toBeGreaterThan(0);
    });
  });

  describe("2. GTM Engineering & Customer Interaction Logs Stream", () => {
    it("should retrieve customer interaction logs with lifecycle stages and UTM tags", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/gtm/logs");
      const res = await getGtmLogs(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.logs)).toBe(true);
      expect(json.logs.length).toBeGreaterThan(0);

      const log = json.logs[0];
      expect(log).toHaveProperty("id");
      expect(log).toHaveProperty("event_type");
      expect(log).toHaveProperty("lifecycle_stage");
      expect(log).toHaveProperty("metadata");
    });

    it("should ingest a new customer touchpoint with UTM parameters and lifecycle stage", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/gtm/logs", {
        method: "POST",
        body: JSON.stringify({
          event_type: "paywall_hit",
          lifecycle_stage: "lead",
          member_name: "Test Founder",
          member_email: "founder@startup.io",
          target_id: "course_vip_03",
          target_name: "Executive Architecture Mastery",
          metadata: {
            utm_source: "linkedin-post",
            utm_medium: "social",
            utm_campaign: "enterprise-launch",
            device: "MacBook Pro / Chrome",
            country: "United States",
          },
        }),
      });

      const res = await postGtmLog(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.log.event_type).toBe("paywall_hit");
      expect(json.log.lifecycle_stage).toBe("lead");
      expect(json.log.metadata.utm_source).toBe("linkedin-post");
      expect(json.log.metadata.utm_campaign).toBe("enterprise-launch");
    });

    it("should filter logs by lifecycle stage", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/gtm/logs?lifecycle_stage=vip");
      const res = await getGtmLogs(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      json.logs.forEach((log: any) => {
        expect(log.lifecycle_stage).toBe("vip");
      });
    });

    it("should export customer interaction logs as RFC 4180 standard CSV", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/gtm/logs?format=csv");
      const res = await getGtmLogs(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      expect(res.headers.get("content-disposition")).toContain(".csv");

      const text = await res.text();
      expect(text).toContain("ID,Timestamp,Event Type,Lifecycle Stage");
      expect(text.split("\n").length).toBeGreaterThan(2);
    });
  });

  describe("3. Manager RBAC Delegation & View Scoping", () => {
    it("should list active managers with granular permission scopes", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/managers");
      const res = await getManagers(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.managers)).toBe(true);
      expect(json.managers.length).toBeGreaterThan(0);

      const mgr = json.managers[0];
      expect(mgr).toHaveProperty("role_title");
      expect(mgr).toHaveProperty("can_view_revenue");
      expect(mgr).toHaveProperty("can_view_gtm_logs");
      expect(mgr).toHaveProperty("can_view_lms_analytics");
    });

    it("should invite a new manager with delegated view permissions", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/managers", {
        method: "POST",
        body: JSON.stringify({
          member_email: "growth.lead@akstack.com",
          member_name: "Jordan Hayes",
          role_title: "growth_lead",
          custom_title: "Head of GTM Engineering",
          can_view_revenue: true,
          can_view_gtm_logs: true,
          can_view_lms_analytics: false,
          can_view_community_metrics: true,
          can_export_reports: true,
        }),
      });

      const res = await postManager(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.manager.member_email).toBe("growth.lead@akstack.com");
      expect(json.manager.can_view_revenue).toBe(true);
      expect(json.manager.can_view_gtm_logs).toBe(true);
      expect(json.manager.can_view_lms_analytics).toBe(false);
    });

    it("should update permissions for an existing manager", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/managers", {
        method: "POST",
        body: JSON.stringify({
          member_email: "growth.lead@akstack.com",
          can_view_lms_analytics: true,
        }),
      });

      const res = await postManager(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.manager.can_view_lms_analytics).toBe(true);
    });

    it("should revoke manager access via DELETE", async () => {
      // Fetch current managers to get an ID
      const listReq = new NextRequest("http://localhost:3000/api/v1/admin/managers");
      const listRes = await getManagers(listReq);
      const listJson = await listRes.json();
      const targetManager = listJson.managers[0];

      const deleteReq = new NextRequest(`http://localhost:3000/api/v1/admin/managers?id=${targetManager.id}`, {
        method: "DELETE",
      });
      const delRes = await deleteManager(deleteReq);
      expect(delRes.status).toBe(200);

      const delJson = await delRes.json();
      expect(delJson.success).toBe(true);
      expect(delJson.message).toMatch(/revoked/i);
    });
  });
});
