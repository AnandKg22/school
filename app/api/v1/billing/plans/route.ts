import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// GET /api/v1/billing/plans - List membership plans
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const { data: plans, error } = await client
      .from("app_school_plans")
      .select("*")
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Failed to query plans:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (err: any) {
    console.error("GET /api/v1/billing/plans exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
