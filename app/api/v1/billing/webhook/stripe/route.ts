import { NextResponse } from "next/server";
import { MOCK_SUBSCRIPTIONS, MOCK_MEMBERS } from "@/lib/school-mock";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventType = event.type || "checkout.session.completed";

    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data?.object || {};
        const memberId = session.client_reference_id || "usr_sarah_002";
        const tier = session.metadata?.plan_tier || "pro";

        const member = MOCK_MEMBERS.find((m) => m.id === memberId);
        if (member) {
          member.plan_tier = tier;
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data?.object || {};
        const existing = MOCK_SUBSCRIPTIONS.find(
          (s) => s.provider_subscription_id === sub.id
        );
        if (existing) {
          existing.status = sub.status || "active";
          existing.cancel_at_period_end = Boolean(sub.cancel_at_period_end);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data?.object || {};
        const existing = MOCK_SUBSCRIPTIONS.find(
          (s) => s.provider_subscription_id === sub.id
        );
        if (existing) {
          existing.status = "canceled";
          const member = MOCK_MEMBERS.find((m) => m.id === existing.member_id);
          if (member) member.plan_tier = "free";
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Invoice paid event
        break;
      }

      default:
        console.log(`Unhandled Stripe webhook event: ${eventType}`);
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      message: `Processed Stripe event ${eventType}`,
    });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
