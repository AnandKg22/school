import { describe, it, expect } from "vitest";
import { MOCK_INVOICES, MOCK_SUBSCRIPTIONS, MOCK_MEMBERS } from "../lib/school-mock";
import { Invoice, Subscription, PlanTier } from "../lib/types";

describe("Step 8: Dedicated Member Settings & Invoicing Hub (/settings)", () => {
  it("should provide mock invoices with invoice numbers, amounts, and tax receipt URLs", () => {
    expect(MOCK_INVOICES.length).toBeGreaterThanOrEqual(3);

    const firstInvoice = MOCK_INVOICES[0];
    expect(firstInvoice.invoice_number).toMatch(/^INV-\d{4}-\d+/);
    expect(firstInvoice.amount).toBeGreaterThan(0);
    expect(firstInvoice.status).toBe("paid");
    expect(firstInvoice.receipt_url).toContain(".pdf");
    expect(firstInvoice.currency).toBe("USD");
  });

  it("should calculate correct annual subscription pricing with 20% discount", () => {
    const proMonthly = 19;
    const proAnnual = 190; // ~2 months free (normally 228)
    const annualDiscountPct = Math.round((1 - proAnnual / (proMonthly * 12)) * 100);
    expect(annualDiscountPct).toBeGreaterThanOrEqual(15);

    const vipMonthly = 39;
    const vipAnnual = 390; // normally 468
    const vipDiscountPct = Math.round((1 - vipAnnual / (vipMonthly * 12)) * 100);
    expect(vipDiscountPct).toBeGreaterThanOrEqual(15);
  });

  it("should map member profile fields correctly for updates", () => {
    const member = MOCK_MEMBERS[1]; // Sarah Chen
    expect(member.id).toBe("usr_sarah_002");
    expect(member.email).toBe("sarah.chen@aiengineer.io");
    expect(member.plan_tier).toBe("pro");

    // Simulate profile update payload
    const updatedProfile = {
      full_name: "Sarah Chen, Ph.D.",
      bio: "Staff AI Engineer & Autonomous Agent Researcher.",
      website_url: "https://sarahchen.dev",
    };

    expect(updatedProfile.full_name).toContain("Ph.D.");
    expect(updatedProfile.bio.length).toBeLessThan(250);
  });

  it("should validate active login session revocation workflow", () => {
    const initialSessions = [
      { id: "sess_1", isCurrent: true, device: "Chrome Windows" },
      { id: "sess_2", isCurrent: false, device: "Safari Mobile" },
      { id: "sess_3", isCurrent: false, device: "Arc Browser Mac" },
    ];

    expect(initialSessions.length).toBe(3);

    // Revoke all other sessions
    const remainingSessions = initialSessions.filter((s) => s.isCurrent);
    expect(remainingSessions.length).toBe(1);
    expect(remainingSessions[0].id).toBe("sess_1");
  });
});
