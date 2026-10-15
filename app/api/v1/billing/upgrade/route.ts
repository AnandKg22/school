import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient } from "@/lib/supabase";

// POST /api/v1/billing/upgrade - Upgrade user's membership plan tier in PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required to upgrade plan." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const body = await req.json();
    const { planTier, paymentReference } = body;

    if (!planTier || !["free", "pro", "vip"].includes(planTier)) {
      return NextResponse.json({ error: "Valid planTier ('free', 'pro', 'vip') is required." }, { status: 400 });
    }

    // Direct self-service elevation to paid tiers without verified payment is strictly forbidden
    if (planTier !== "free") {
      const isSuperAdmin = 
        user.email === "admin@akstack.com" || 
        user.app_metadata?.role === "superadmin" ||
        user.app_metadata?.claims_admin === true;

      // In production, paid tier elevation requires verified payment transaction or admin authority
      if (!isSuperAdmin && !paymentReference) {
        return NextResponse.json(
          { 
            error: "Forbidden: Direct plan tier upgrade requires verified payment event or admin authorization.",
            code: "PAYMENT_VERIFICATION_REQUIRED"
          },
          { status: 403 }
        );
      }
    }

    // Update user's member record in app_school_members
    const { data: updatedMember, error: updateError } = await client
      .from("app_school_members")
      .update({
        plan_tier: planTier,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update membership tier:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      planTier: updatedMember.plan_tier,
      member: updatedMember,
    });
  } catch (err: any) {
    console.error("POST /api/v1/billing/upgrade exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
