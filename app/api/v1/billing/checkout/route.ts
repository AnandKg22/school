import { NextResponse } from "next/server";
import {
  MOCK_COURSES,
  MOCK_MEMBERS,
  MOCK_GATEWAY_CONFIG,
  MOCK_SUBSCRIPTIONS,
  MOCK_COURSE_PURCHASES,
  MOCK_INVOICES,
} from "@/lib/school-mock";
import {
  Subscription,
  CoursePurchase,
  Invoice,
  PlanTier,
  BillingInterval,
} from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = "subscription", // "subscription" | "course"
      tier = "pro",
      course_id,
      interval = "month", // "month" | "year" | "one_time"
      provider = "stripe", // "stripe" | "paypal"
      member_id = "usr_sarah_002",
      success_url,
      cancel_url,
    } = body;

    // Check if provider is enabled
    if (provider === "stripe" && !MOCK_GATEWAY_CONFIG.stripe_enabled) {
      return NextResponse.json(
        { success: false, error: "Stripe payment gateway is currently disabled by administrator" },
        { status: 400 }
      );
    }
    if (provider === "paypal" && !MOCK_GATEWAY_CONFIG.paypal_enabled) {
      return NextResponse.json(
        { success: false, error: "PayPal payment gateway is currently disabled by administrator" },
        { status: 400 }
      );
    }

    const member = MOCK_MEMBERS.find((m) => m.id === member_id) || MOCK_MEMBERS[1];
    let amount = 0;
    let description = "";

    if (type === "subscription") {
      if (tier === "vip") {
        amount = interval === "year" ? 990 : 99;
        description = `AKSchool VIP Membership (${interval === "year" ? "Annual - 2 Months Free" : "Monthly"})`;
      } else {
        // Pro tier
        amount = interval === "year" ? 290 : 29;
        description = `AKSchool Pro Creator Membership (${interval === "year" ? "Annual - 2 Months Free" : "Monthly"})`;
      }
    } else if (type === "course") {
      const course = MOCK_COURSES.find((c) => c.id === course_id);
      if (!course) {
        return NextResponse.json(
          { success: false, error: "Course not found for checkout" },
          { status: 404 }
        );
      }

      const pricing = course.pricing;
      if (interval === "one_time") {
        amount = pricing?.one_time_price || 149;
        description = `${course.title} (Lifetime License)`;
      } else if (interval === "year") {
        amount = pricing?.yearly_price || 190;
        description = `${course.title} (Annual Lab Pass)`;
      } else {
        amount = pricing?.monthly_price || 19;
        description = `${course.title} (Monthly Lab Pass)`;
      }
    }

    const sessionId =
      provider === "stripe"
        ? `cs_live_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        : `ORDER-PAYPAL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const checkoutUrl =
      provider === "stripe"
        ? `https://checkout.stripe.com/pay/${sessionId}`
        : `https://www.paypal.com/checkoutnow?token=${sessionId}`;

    // Optimistically prepare records
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (type === "subscription") {
      const sub: Subscription = {
        id: `sub_${Date.now()}`,
        community_id: member.community_id,
        member_id: member.id,
        plan_tier: tier as PlanTier,
        billing_interval: interval as BillingInterval,
        amount,
        currency: "USD",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + (interval === "year" ? 365 : 30) * 86400000).toISOString(),
        cancel_at_period_end: false,
        provider: provider as "stripe" | "paypal",
        provider_subscription_id: sessionId,
        created_at: new Date().toISOString(),
      };
      MOCK_SUBSCRIPTIONS.unshift(sub);
      member.plan_tier = tier as PlanTier;

      const invoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoice_number: invoiceNumber,
        member_id: member.id,
        subscription_id: sub.id,
        item_description: description,
        amount,
        currency: "USD",
        status: "paid",
        provider: provider as "stripe" | "paypal",
        receipt_url: `https://school.akstack.com/invoices/${invoiceNumber.toLowerCase()}.pdf`,
        created_at: new Date().toISOString(),
      };
      MOCK_INVOICES.unshift(invoice);
    } else {
      const purchase: CoursePurchase = {
        id: `pur_${Date.now()}`,
        community_id: member.community_id,
        member_id: member.id,
        course_id: course_id!,
        purchase_type: interval as "one_time" | "monthly" | "yearly",
        amount,
        currency: "USD",
        provider: provider as "stripe" | "paypal",
        provider_payment_id: sessionId,
        expires_at:
          interval === "one_time"
            ? undefined
            : new Date(Date.now() + (interval === "year" ? 365 : 30) * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      MOCK_COURSE_PURCHASES.unshift(purchase);

      const invoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoice_number: invoiceNumber,
        member_id: member.id,
        course_id: course_id!,
        item_description: description,
        amount,
        currency: "USD",
        status: "paid",
        provider: provider as "stripe" | "paypal",
        receipt_url: `https://school.akstack.com/invoices/${invoiceNumber.toLowerCase()}.pdf`,
        created_at: new Date().toISOString(),
      };
      MOCK_INVOICES.unshift(invoice);
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      checkout_url: checkoutUrl,
      provider,
      type,
      amount,
      currency: "USD",
      description,
      invoice_number: invoiceNumber,
      message: `Checkout session initialized via ${provider.toUpperCase()}`,
      data: {
        sessionId,
        checkoutUrl,
        provider,
        amount,
        description,
        invoiceNumber,
      },
    });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
