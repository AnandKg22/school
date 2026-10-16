import { NextRequest, NextResponse } from "next/server";
import { MOCK_AFFILIATES, MOCK_CONVERSIONS, MOCK_AFFILIATE_CONFIG } from "@/lib/school-mock";
import { AffiliatePartner } from "@/lib/types";

let runtimeAffiliates: AffiliatePartner[] = [...MOCK_AFFILIATES];

// GET /api/v1/affiliates/me - Retrieve current member's affiliate partner details & conversions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("member_id") || "usr_admin_001";

    let affiliate = runtimeAffiliates.find((a) => a.member_id === memberId);

    // If member not yet in affiliate list, automatically generate partner link
    if (!affiliate) {
      const code = `REF_${memberId.substring(memberId.length - 4).toUpperCase()}`;
      affiliate = {
        id: `aff_${Date.now()}`,
        community_id: "comm_akschool_001",
        member_id: memberId,
        referral_code: code,
        referral_url: `https://school.akstack.com/join?ref=${code}`,
        commission_rate_pct: MOCK_AFFILIATE_CONFIG.default_commission_pct,
        total_clicks: 0,
        total_referrals: 0,
        total_revenue_generated: 0,
        unpaid_commission: 0,
        paid_commission: 0,
        payout_email: "member@example.com",
        payout_method: "paypal",
        status: "active",
        created_at: new Date().toISOString(),
      };
      runtimeAffiliates.push(affiliate);
    }

    const conversions = MOCK_CONVERSIONS.filter((c) => c.affiliate_id === affiliate?.id);

    return NextResponse.json({
      success: true,
      program_config: MOCK_AFFILIATE_CONFIG,
      affiliate,
      conversions,
    });
  } catch (err: any) {
    console.error("GET /api/v1/affiliates/me error:", err);
    return NextResponse.json({ error: "Failed to load affiliate partner details." }, { status: 500 });
  }
}

// POST /api/v1/affiliates/me - Update payout email, payment method, or custom referral slug
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { member_id = "usr_admin_001", payout_email, payout_method, custom_code } = body;

    const index = runtimeAffiliates.findIndex((a) => a.member_id === member_id);
    if (index === -1) {
      return NextResponse.json({ error: "Affiliate partner account not found." }, { status: 404 });
    }

    const current = runtimeAffiliates[index];
    const updated: AffiliatePartner = {
      ...current,
      payout_email: payout_email || current.payout_email,
      payout_method: payout_method || current.payout_method,
      referral_code: custom_code ? custom_code.toUpperCase() : current.referral_code,
      referral_url: custom_code
        ? `https://school.akstack.com/join?ref=${custom_code.toUpperCase()}`
        : current.referral_url,
    };

    runtimeAffiliates[index] = updated;

    return NextResponse.json({
      success: true,
      message: "Affiliate payout profile updated successfully.",
      affiliate: updated,
    });
  } catch (err: any) {
    console.error("POST /api/v1/affiliates/me error:", err);
    return NextResponse.json({ error: "Failed to update affiliate settings." }, { status: 500 });
  }
}
