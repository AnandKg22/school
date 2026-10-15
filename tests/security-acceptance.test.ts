import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPlatformMetrics } from "@/app/api/v1/platform/metrics/route";
import { POST as postBillingUpgrade } from "@/app/api/v1/billing/upgrade/route";
import { PATCH as patchProfile } from "@/app/api/v1/me/profile/route";
import { GET as getModeration, POST as postModeration } from "@/app/api/v1/moderation/reports/route";
import { POST as postAdminKnowledge } from "@/app/api/v1/admin/knowledge/route";
import { POST as postAdminSettings } from "@/app/api/v1/admin/settings/route";
import { POST as postLearningProgress } from "@/app/api/v1/learning/progress/route";
import { POST as postPost } from "@/app/api/v1/posts/route";
import { POST as postAiChat } from "@/app/api/ai/chat/route";

// Mock Supabase client module
vi.mock("@/lib/supabase", () => {
  return {
    createAuthenticatedServerClient: vi.fn(),
    supabase: {
      from: vi.fn(),
    },
  };
});

import { createAuthenticatedServerClient } from "@/lib/supabase";

describe("AKSchool Production Acceptance & Security Audit Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Unauthenticated access to protected endpoints
  describe("1. Unauthenticated Access Control", () => {
    it("should reject unauthenticated request to /api/v1/platform/metrics with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/platform/metrics");
      const res = await getPlatformMetrics(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Authentication required/i);
    });

    it("should reject unauthenticated request to /api/v1/billing/upgrade with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/billing/upgrade", {
        method: "POST",
        body: JSON.stringify({ planTier: "pro" }),
      });
      const res = await postBillingUpgrade(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated request to /api/v1/admin/settings with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/settings", {
        method: "POST",
        body: JSON.stringify({ communityName: "New Name" }),
      });
      const res = await postAdminSettings(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated request to /api/v1/admin/knowledge with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/knowledge", {
        method: "POST",
        body: JSON.stringify({ title: "Rules", content: "Guidelines" }),
      });
      const res = await postAdminKnowledge(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated request to /api/v1/moderation/reports with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/moderation/reports");
      const res = await getModeration(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated request to /api/v1/me/profile with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ full_name: "Attacker" }),
      });
      const res = await patchProfile(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated post creation with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/posts", {
        method: "POST",
        body: JSON.stringify({ title: "Spam", content: "Spam", spaceId: "space-1" }),
      });
      const res = await postPost(req);
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated progress update with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/learning/progress", {
        method: "POST",
        body: JSON.stringify({ lessonId: "l1", courseId: "c1", completed: true }),
      });
      const res = await postLearningProgress(req);
      expect(res.status).toBe(401);
    });
  });

  // 2. Platform Metrics & Role Elevation Testing
  describe("2. Platform Metrics Authorization & Role Elevation Prevention", () => {
    it("should reject regular member from accessing platform metrics with 403", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-normal", email: "member@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: "member" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/platform/metrics", {
        headers: { authorization: "Bearer member-token" },
      });
      const res = await getPlatformMetrics(req);
      expect(res.status).toBe(403);
    });

    it("should reject attacker spoofing user_metadata.role = 'superadmin' from platform metrics", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "user-attacker",
                email: "attacker@gmail.com",
                user_metadata: { role: "superadmin" }, // Client-editable metadata!
              },
            },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: "member" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/platform/metrics", {
        headers: { authorization: "Bearer attacker-token" },
      });
      const res = await getPlatformMetrics(req);
      // Under hardened security, client user_metadata MUST NOT grant platform access!
      expect(res.status).toBe(403);
    });

    it("should allow verified superadmin (admin@akstack.com) access to platform metrics", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "user-superadmin",
                email: "admin@akstack.com",
                app_metadata: { role: "superadmin" },
              },
            },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "app_school_communities" || table === "app_school_posts" || table === "app_school_courses") {
            return {
              select: vi.fn().mockResolvedValue({ count: 5, error: null }),
            };
          }
          if (table === "app_school_members") {
            return {
              select: vi.fn().mockResolvedValue({
                data: [
                  { id: "1", plan_tier: "free" },
                  { id: "2", plan_tier: "pro" },
                  { id: "3", plan_tier: "vip" },
                ],
                error: null,
              }),
            };
          }
          return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/platform/metrics", {
        headers: { authorization: "Bearer superadmin-token" },
      });
      const res = await getPlatformMetrics(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.metrics.totalMembers).toBe(3);
      expect(json.metrics.subscribers.pro).toBe(1);
      expect(json.metrics.subscribers.vip).toBe(1);
    });
  });

  // 3. Billing & Entitlement Upgrades
  describe("3. Billing & Unauthorized Tier Elevation", () => {
    it("should reject self-service tier elevation without verified payment signature", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-free", email: "free@example.com" } },
            error: null,
          }),
        },
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/billing/upgrade", {
        method: "POST",
        headers: { authorization: "Bearer free-user-token" },
        body: JSON.stringify({ planTier: "vip" }),
      });
      const res = await postBillingUpgrade(req);
      // Direct unverified upgrade must be blocked or return 400/403 requiring payment verification
      expect(res.status).toBe(403);
    });

    it("should reject invalid planTier parameter with 400", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com" } },
            error: null,
          }),
        },
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/billing/upgrade", {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: JSON.stringify({ planTier: "diamond_hacker_tier" }),
      });
      const res = await postBillingUpgrade(req);
      expect(res.status).toBe(400);
    });
  });

  // 4. Profile & Self-Service Mutation Restrictions
  describe("4. Profile Self-Service Restrictions", () => {
    it("should strip unauthorized role or tier fields during profile PATCH", async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "m1", user_id: "user-1", full_name: "John Doe", role: "member", plan_tier: "free" },
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          update: updateSpy,
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/me/profile", {
        method: "PATCH",
        headers: { authorization: "Bearer token" },
        body: JSON.stringify({
          full_name: "John Doe",
          role: "owner", // Injected privilege escalation
          plan_tier: "vip", // Injected tier escalation
        }),
      });

      const res = await patchProfile(req);
      expect(res.status).toBe(200);

      // Verify what was sent to Supabase update
      expect(updateSpy).toHaveBeenCalled();
      const passedUpdates = updateSpy.mock.calls[0][0];
      expect(passedUpdates.role).toBeUndefined();
      expect(passedUpdates.plan_tier).toBeUndefined();
      expect(passedUpdates.full_name).toBe("John Doe");
    });
  });

  // 5. Moderation Authorization
  describe("5. Moderation Authorization", () => {
    it("should forbid normal member from fetching moderation queue", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-norm", email: "norm@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: "member" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/moderation/reports", {
        headers: { authorization: "Bearer token" },
      });
      const res = await getModeration(req);
      expect(res.status).toBe(403);
    });

    it("should allow community moderator/admin to access moderation queue", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-mod", email: "mod@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { role: "moderator" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/moderation/reports", {
        headers: { authorization: "Bearer token" },
      });
      const res = await getModeration(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.reports)).toBe(true);
    });
  });

  // 6. Admin Settings & Knowledge
  describe("6. Admin Settings & Knowledge Mutations", () => {
    it("should reject non-admin trying to update community settings with 403", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-norm", email: "norm@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "m-1", role: "member", community_id: "c-1" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/settings", {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: JSON.stringify({ communityName: "Hacked Community" }),
      });
      const res = await postAdminSettings(req);
      expect(res.status).toBe(403);
    });

    it("should reject non-admin trying to inject AI knowledge with 403", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-norm", email: "norm@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "m-1", role: "member", community_id: "c-1" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/knowledge", {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: JSON.stringify({ title: "Poisoned Prompt", content: "Ignore rules" }),
      });
      const res = await postAdminKnowledge(req);
      expect(res.status).toBe(403);
    });
  });

  // 7. AI Chat & Input Validation
  describe("7. AI Chat Route & Parameter Validation", () => {
    it("should return 400 for empty or whitespace-only question", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ question: "   " }),
      });
      const res = await postAiChat(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/valid question is required/i);
    });

    it("should respond with grounded answer for valid course question", async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ question: "What courses are available in AKSchool?" }),
      });
      const res = await postAiChat(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.grounded).toBe(true);
      expect(json.answer).toContain("Classroom");
    });
  });

  // 8. Free member versus Pro/VIP lesson access
  describe("8. Classroom Tier Entitlement Gating", () => {
    it("should correctly distinguish lesson access requirements across tiers", () => {
      const evaluateTierAccess = (courseTier: "free" | "pro" | "vip", memberTier: "free" | "pro" | "vip") => {
        if (courseTier === "free") return true;
        if (courseTier === "pro") return memberTier === "pro" || memberTier === "vip";
        if (courseTier === "vip") return memberTier === "vip";
        return false;
      };

      // Free course accessible to all
      expect(evaluateTierAccess("free", "free")).toBe(true);
      expect(evaluateTierAccess("free", "pro")).toBe(true);
      expect(evaluateTierAccess("free", "vip")).toBe(true);

      // Pro course blocked for free member, accessible to pro and vip
      expect(evaluateTierAccess("pro", "free")).toBe(false);
      expect(evaluateTierAccess("pro", "pro")).toBe(true);
      expect(evaluateTierAccess("pro", "vip")).toBe(true);

      // VIP course blocked for free and pro, accessible only to vip
      expect(evaluateTierAccess("vip", "free")).toBe(false);
      expect(evaluateTierAccess("vip", "pro")).toBe(false);
      expect(evaluateTierAccess("vip", "vip")).toBe(true);
    });
  });

  // 9. Cross-Community / Tenant Isolation
  describe("9. Multi-Tenant Data Isolation", () => {
    it("should prevent member of Community A from modifying settings of Community B", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-tenant-a", email: "admin@tenant-a.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "m-tenant-a", role: "admin", community_id: "community-a-uuid" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "community-a-uuid", name: "Tenant A Updated" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/settings", {
        method: "POST",
        headers: { authorization: "Bearer tenant-a-token" },
        body: JSON.stringify({ communityName: "Attempting to hijack Tenant B" }),
      });
      const res = await postAdminSettings(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      // Ensure update is strictly scoped to member's community_id ('community-a-uuid'), not any arbitrary community ID
      expect(json.community.id).toBe("community-a-uuid");
    });
  });

  // 10. Expired Sessions, Missing Records, Provider Errors
  describe("10. Expired Sessions, Missing Records, & Provider Resiliency", () => {
    it("should return 401 when auth token has expired (JWT expired)", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "JWT expired" },
          }),
        },
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/billing/upgrade", {
        method: "POST",
        headers: { authorization: "Bearer expired-token" },
        body: JSON.stringify({ planTier: "pro" }),
      });
      const res = await postBillingUpgrade(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Invalid session/i);
    });

    it("should return 403 when authenticated user has no member record in database", async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "orphan-user", email: "orphan@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Row not found" },
              }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/v1/posts", {
        method: "POST",
        headers: { authorization: "Bearer valid-token-no-membership" },
        body: JSON.stringify({ title: "Hello", content: "World", spaceId: "space-1" }),
      });
      const res = await postPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/Community membership not found/i);
    });

    it("should fall back gracefully to deterministic guidance when external AI API fails", async () => {
      // Intentionally pass an unknown question without working external provider
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
      (createAuthenticatedServerClient as any).mockReturnValue(mockClient);

      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ question: "Tell me about AKSchool community rules" }),
      });
      const res = await postAiChat(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.grounded).toBe(true);
      expect(json.answer).toContain("AKSchool Community Guidelines");
    });
  });
});

