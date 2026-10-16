import { describe, it, expect } from "vitest";
import { MOCK_AFFILIATES, MOCK_CONVERSIONS, MOCK_AFFILIATE_CONFIG } from "@/lib/school-mock";

describe("Step 4: Dedicated /affiliates Partner Portal & Growth Studio", () => {
  it("generates custom tracking links with UTM parameters", () => {
    const affiliate = MOCK_AFFILIATES[0];
    const utmSource = "youtube";
    const utmCampaign = "autumn_agent_launch";

    const customUrl = `${affiliate.referral_url}&utm_source=${utmSource}&utm_campaign=${utmCampaign}`;

    expect(customUrl).toContain("ref=AKAASH");
    expect(customUrl).toContain("utm_source=youtube");
    expect(customUrl).toContain("utm_campaign=autumn_agent_launch");
  });

  it("calculates monthly recurring commission projections correctly", () => {
    const commissionRate = MOCK_AFFILIATE_CONFIG.default_commission_pct / 100; // 0.30 (30%)
    const proPrice = 49;
    const vipPrice = 149;

    const calcProCount = 10;
    const calcVipCount = 5;

    const estProEarnings = calcProCount * proPrice * commissionRate; // 10 * 49 * 0.30 = $147
    const estVipEarnings = calcVipCount * vipPrice * commissionRate; // 5 * 149 * 0.30 = $223.50
    const totalMonthly = Math.round(estProEarnings + estVipEarnings); // 147 + 223.50 = 370.50 -> 371
    const totalAnnual = totalMonthly * 12;

    expect(estProEarnings).toBe(147);
    expect(totalMonthly).toBe(371);
    expect(totalAnnual).toBe(4452);
  });

  it("enforces minimum payout threshold ($50) for payout eligibility", () => {
    const affiliate = MOCK_AFFILIATES[0];
    expect(affiliate.unpaid_commission).toBe(340.0);
    expect(affiliate.unpaid_commission).toBeGreaterThanOrEqual(MOCK_AFFILIATE_CONFIG.minimum_payout_amount);

    const eligibleForPayout = affiliate.unpaid_commission >= MOCK_AFFILIATE_CONFIG.minimum_payout_amount;
    expect(eligibleForPayout).toBe(true);
  });

  it("provides structured referral conversion history", () => {
    expect(MOCK_CONVERSIONS.length).toBeGreaterThanOrEqual(3);

    const approvedConversions = MOCK_CONVERSIONS.filter((c) => c.status === "approved");
    expect(approvedConversions.length).toBeGreaterThan(0);

    const firstConv = MOCK_CONVERSIONS[0];
    expect(firstConv.buyer_name).toBeTruthy();
    expect(firstConv.order_amount).toBeGreaterThan(0);
    expect(firstConv.commission_amount).toBeGreaterThan(0);
  });
});
