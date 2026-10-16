import { NextResponse } from "next/server";
import { MOCK_GATEWAY_CONFIG } from "@/lib/school-mock";
import { PaymentGatewayConfig, PaymentGatewayProvider } from "@/lib/types";

export async function GET(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      config: MOCK_GATEWAY_CONFIG,
      data: MOCK_GATEWAY_CONFIG,
    });
  } catch (error: any) {
    console.error("Gateway config GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load payment gateway configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      active_gateways,
      stripe_enabled,
      stripe_publishable_key,
      stripe_secret_key,
      stripe_webhook_secret,
      stripe_live_mode,
      paypal_enabled,
      paypal_client_id,
      paypal_secret,
      paypal_webhook_id,
      paypal_sandbox_mode,
      currency,
    } = body;

    // Validate active gateways mode
    if (active_gateways && !["stripe", "paypal", "both"].includes(active_gateways)) {
      return NextResponse.json(
        { success: false, error: "active_gateways must be 'stripe', 'paypal', or 'both'" },
        { status: 400 }
      );
    }

    if (active_gateways) {
      MOCK_GATEWAY_CONFIG.active_gateways = active_gateways as PaymentGatewayProvider;
    }
    if (typeof stripe_enabled === "boolean") {
      MOCK_GATEWAY_CONFIG.stripe_enabled = stripe_enabled;
    }
    if (stripe_publishable_key) {
      MOCK_GATEWAY_CONFIG.stripe_publishable_key = stripe_publishable_key;
    }
    if (stripe_secret_key) {
      MOCK_GATEWAY_CONFIG.stripe_secret_key_masked = `sk_${stripe_secret_key.slice(-4).padStart(stripe_secret_key.length, "•")}`;
    }
    if (stripe_webhook_secret) {
      MOCK_GATEWAY_CONFIG.stripe_webhook_secret_masked = `whsec_${stripe_webhook_secret.slice(-4).padStart(stripe_webhook_secret.length, "•")}`;
    }
    if (typeof stripe_live_mode === "boolean") {
      MOCK_GATEWAY_CONFIG.stripe_live_mode = stripe_live_mode;
    }
    if (typeof paypal_enabled === "boolean") {
      MOCK_GATEWAY_CONFIG.paypal_enabled = paypal_enabled;
    }
    if (paypal_client_id) {
      MOCK_GATEWAY_CONFIG.paypal_client_id = paypal_client_id;
    }
    if (paypal_secret) {
      MOCK_GATEWAY_CONFIG.paypal_secret_masked = `EC_${paypal_secret.slice(-4).padStart(paypal_secret.length, "•")}`;
    }
    if (paypal_webhook_id) {
      MOCK_GATEWAY_CONFIG.paypal_webhook_id = paypal_webhook_id;
    }
    if (typeof paypal_sandbox_mode === "boolean") {
      MOCK_GATEWAY_CONFIG.paypal_sandbox_mode = paypal_sandbox_mode;
    }
    if (currency) {
      MOCK_GATEWAY_CONFIG.currency = currency;
    }

    MOCK_GATEWAY_CONFIG.stripe_connected = Boolean(
      MOCK_GATEWAY_CONFIG.stripe_enabled && MOCK_GATEWAY_CONFIG.stripe_publishable_key
    );
    MOCK_GATEWAY_CONFIG.paypal_connected = Boolean(
      MOCK_GATEWAY_CONFIG.paypal_enabled && MOCK_GATEWAY_CONFIG.paypal_client_id
    );
    MOCK_GATEWAY_CONFIG.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Payment gateway settings updated and verified successfully",
      config: MOCK_GATEWAY_CONFIG,
      data: MOCK_GATEWAY_CONFIG,
    });
  } catch (error: any) {
    console.error("Gateway config POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment gateway configuration" },
      { status: 500 }
    );
  }
}
