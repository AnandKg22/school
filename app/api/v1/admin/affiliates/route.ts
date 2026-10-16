import { NextRequest, NextResponse } from "next/server";
import { MOCK_AFFILIATES, MOCK_CONVERSIONS, MOCK_AFFILIATE_CONFIG } from "@/lib/school-mock";
import { AffiliateProgramConfig, AffiliatePartner, ReferralConversion } from "@/lib/types";

let currentConfig: AffiliateProgramConfig = { ...MOCK_AFFILIATE_CONFIG };
let runtimeAffiliatesList: AffiliatePartner[] = [...MOCK_AFFILIATES];
let runtimeConversionsList: ReferralConversion[] = [...MOCK_CONVERSIONS];

// GET /api/v1/admin/affiliates - SuperAdmin overview of affiliate program
export async function GET(req: NextRequest) {
  try {
    const totalCommissionEarned = runtimeAffiliatesList.reduce((acc, a) => acc + (a.paid_commission + a.unpaid_commission), 0);
    const totalPendingPayouts = runtimeAffiliatesList.reduce((acc, a) => acc + a.unpaid_commission, 0);

    return NextResponse.json({
      success: true,
      config: currentConfig,
      stats: {
        total_partners: runtimeAffiliatesList.length,
        total_referrals: runtimeAffiliatesList.reduce((acc, a) => acc + a.total_referrals, 0),
        total_revenue_referred: runtimeAffiliatesList.reduce((acc, a) => acc + a.total_revenue_generated, 0),
        total_commission_earned: totalCommissionEarned,
        total_pending_payouts: totalPendingPayouts,
      },
      affiliates: runtimeAffiliatesList,
      recent_conversions: runtimeConversionsList,
    });
  } catch (err: any) {
    console.error("GET /api/v1/admin/affiliates error:", err);
    return NextResponse.json({ error: "Failed to load affiliate admin overview." }, { status: 500 });
  }
}

// POST /api/v1/admin/affiliates - Update program rules or approve/pay a conversion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config, conversion_id, new_status, affiliate_id, payout_amount } = body;

    // 1. Update program config
    if (action === "update_config" && config) {
      currentConfig = {
        ...currentConfig,
        ...config,
      };
      return NextResponse.json({
        success: true,
        message: "Affiliate program configuration saved.",
        config: currentConfig,
      });
    }

    // 2. Approve or reject conversion
    if (action === "update_conversion" && conversion_id && new_status) {
      const convIndex = runtimeConversionsList.findIndex((c) => c.id === conversion_id);
      if (convIndex >= 0) {
        runtimeConversionsList[convIndex].status = new_status;
        return NextResponse.json({
          success: true,
          message: `Conversion updated to ${new_status}.`,
          conversion: runtimeConversionsList[convIndex],
        });
      }
    }

    // 3. Mark payout as paid
    if (action === "record_payout" && affiliate_id && payout_amount) {
      const affIndex = runtimeAffiliatesList.findIndex((a) => a.id === affiliate_id);
      if (affIndex >= 0) {
        const aff = runtimeAffiliatesList[affIndex];
        aff.paid_commission += payout_amount;
        aff.unpaid_commission = Math.max(0, aff.unpaid_commission - payout_amount);
        return NextResponse.json({
          success: true,
          message: `Recorded payout of $${payout_amount} to ${aff.referral_code}.`,
          affiliate: aff,
        });
      }
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/v1/admin/affiliates error:", err);
    return NextResponse.json({ error: "Failed to process affiliate admin request." }, { status: 500 });
  }
}
