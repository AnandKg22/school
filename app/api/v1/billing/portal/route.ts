import { NextResponse } from "next/server";
import { MOCK_SUBSCRIPTIONS, MOCK_INVOICES, MOCK_MEMBERS } from "@/lib/school-mock";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const member_id = body.member_id || "usr_sarah_002";
    const member = MOCK_MEMBERS.find((m) => m.id === member_id) || MOCK_MEMBERS[1];

    const subscriptions = MOCK_SUBSCRIPTIONS.filter((s) => s.member_id === member.id);
    const invoices = MOCK_INVOICES.filter((i) => i.member_id === member.id);

    const portalUrl = `https://billing.stripe.com/p/session/live_${Date.now()}`;

    return NextResponse.json({
      success: true,
      portal_url: portalUrl,
      current_tier: member.plan_tier,
      subscriptions,
      invoices,
      data: {
        portalUrl,
        currentTier: member.plan_tier,
        subscriptions,
        invoices,
      },
    });
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
