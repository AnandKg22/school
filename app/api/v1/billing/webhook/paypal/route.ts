import { NextResponse } from "next/server";
import { MOCK_SUBSCRIPTIONS, MOCK_MEMBERS } from "@/lib/school-mock";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const transmissionId = request.headers.get("paypal-transmission-id");

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventType = event.event_type || "PAYMENT.CAPTURE.COMPLETED";

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const resource = event.resource || {};
        const memberId = resource.custom_id || "usr_sarah_002";
        const member = MOCK_MEMBERS.find((m) => m.id === memberId);
        if (member) {
          member.plan_tier = "pro";
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const sub = event.resource || {};
        const memberId = sub.custom_id || "usr_sarah_002";
        const member = MOCK_MEMBERS.find((m) => m.id === memberId);
        if (member) {
          member.plan_tier = "pro";
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const sub = event.resource || {};
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

      default:
        console.log(`Unhandled PayPal webhook event: ${eventType}`);
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      message: `Processed PayPal event ${eventType}`,
    });
  } catch (error: any) {
    console.error("PayPal webhook processing error:", error);
    return NextResponse.json(
      { error: "PayPal webhook handler failed" },
      { status: 500 }
    );
  }
}
