import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getGateways, POST as postGateways } from "@/app/api/v1/admin/gateways/route";
import { GET as getCoursePricing, POST as postCoursePricing } from "@/app/api/v1/courses/[id]/pricing/route";
import { POST as postCheckout } from "@/app/api/v1/billing/checkout/route";
import { POST as postBillingPortal } from "@/app/api/v1/billing/portal/route";
import { POST as postStripeWebhook } from "@/app/api/v1/billing/webhook/stripe/route";
import { POST as postPaypalWebhook } from "@/app/api/v1/billing/webhook/paypal/route";

describe("Pillar 1: Monetization & Subscription Engine Suite", () => {
  describe("1. SuperAdmin Payment Gateways Architecture (Stripe & PayPal)", () => {
    it("should retrieve active gateway configuration with credentials", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/gateways");
      const res = await getGateways(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.config).toHaveProperty("active_gateways");
      expect(["stripe", "paypal", "both"]).toContain(json.config.active_gateways);
    });

    it("should reject invalid active_gateways selection with 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/gateways", {
        method: "POST",
        body: JSON.stringify({ active_gateways: "bitcoin_only" }),
      });
      const res = await postGateways(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/must be 'stripe', 'paypal', or 'both'/i);
    });

    it("should update gateway mode and mask secret keys securely", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/gateways", {
        method: "POST",
        body: JSON.stringify({
          active_gateways: "both",
          stripe_enabled: true,
          stripe_publishable_key: "pk_test_updated_51234",
          stripe_secret_key: "sk_test_supersecretkey12345678",
          paypal_enabled: true,
          paypal_client_id: "AU_PayPal_Client_Updated",
        }),
      });
      const res = await postGateways(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.config.active_gateways).toBe("both");
      expect(json.config.stripe_publishable_key).toBe("pk_test_updated_51234");
      expect(json.config.stripe_secret_key_masked).toContain("•");
    });
  });

  describe("2. Custom Course Pricing Studio", () => {
    it("should return pricing for an existing course", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/courses/course_saas_02/pricing");
      const res = await getCoursePricing(req, {
        params: Promise.resolve({ id: "course_saas_02" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.pricing).toHaveProperty("one_time_price");
      expect(json.pricing).toHaveProperty("monthly_price");
      expect(json.pricing).toHaveProperty("yearly_price");
    });

    it("should return 404 when querying pricing for an unknown course", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/courses/non_existent_course/pricing");
      const res = await getCoursePricing(req, {
        params: Promise.resolve({ id: "non_existent_course" }),
      });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toMatch(/Course not found/i);
    });

    it("should allow superadmin to update course custom pricing and tier gating", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/courses/course_saas_02/pricing", {
        method: "POST",
        body: JSON.stringify({
          pricing_type: "hybrid",
          one_time_price: 199,
          monthly_price: 25,
          yearly_price: 250,
          required_tier: "pro",
          allow_standalone_purchase: true,
        }),
      });
      const res = await postCoursePricing(req, {
        params: Promise.resolve({ id: "course_saas_02" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.pricing.one_time_price).toBe(199);
      expect(json.pricing.monthly_price).toBe(25);
    });
  });

  describe("3. Multi-Gateway Checkout Sessions (Stripe & PayPal)", () => {
    it("should create a checkout session for Pro Monthly subscription via Stripe", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          type: "subscription",
          tier: "pro",
          interval: "month",
          provider: "stripe",
          member_id: "usr_sarah_002",
        }),
      });
      const res = await postCheckout(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.provider).toBe("stripe");
      expect(json.amount).toBe(29);
      expect(json.session_id).toMatch(/^cs_/);
      expect(json.checkout_url).toContain("checkout.stripe.com");
    });

    it("should create a checkout session for VIP Annual subscription via PayPal", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          type: "subscription",
          tier: "vip",
          interval: "year",
          provider: "paypal",
          member_id: "usr_marcus_003",
        }),
      });
      const res = await postCheckout(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.provider).toBe("paypal");
      expect(json.amount).toBe(990);
      expect(json.session_id).toContain("ORDER-PAYPAL");
      expect(json.checkout_url).toContain("paypal.com");
    });

    it("should create a standalone course purchase checkout session", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          type: "course",
          course_id: "course_saas_02",
          interval: "one_time",
          provider: "stripe",
          member_id: "usr_sarah_002",
        }),
      });
      const res = await postCheckout(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.type).toBe("course");
      expect(json.amount).toBeGreaterThan(0);
      expect(json.invoice_number).toMatch(/^INV-/);
    });
  });

  describe("4. Customer Billing Portal & Invoices History", () => {
    it("should generate customer billing portal session and list member invoices", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/billing/portal", {
        method: "POST",
        body: JSON.stringify({ member_id: "usr_sarah_002" }),
      });
      const res = await postBillingPortal(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.portal_url).toContain("billing.stripe.com");
      expect(Array.isArray(json.invoices)).toBe(true);
    });
  });

  describe("5. Stripe & PayPal Webhook Handlers", () => {
    it("should process Stripe checkout.session.completed webhook", async () => {
      const payload = {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "usr_sarah_002",
            metadata: { plan_tier: "pro" },
          },
        },
      };
      const req = new NextRequest("http://localhost:3000/api/v1/billing/webhook/stripe", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res = await postStripeWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);
      expect(json.event).toBe("checkout.session.completed");
    });

    it("should process PayPal PAYMENT.CAPTURE.COMPLETED webhook", async () => {
      const payload = {
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: "usr_sarah_002",
          amount: { value: "29.00", currency_code: "USD" },
        },
      };
      const req = new NextRequest("http://localhost:3000/api/v1/billing/webhook/paypal", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res = await postPaypalWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);
      expect(json.event).toBe("PAYMENT.CAPTURE.COMPLETED");
    });
  });
});
