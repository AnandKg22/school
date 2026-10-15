import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// GET /api/v1/members - List members in community
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = client
      .from("app_school_members")
      .select("id, community_id, user_id, email, full_name, handle, avatar_url, role, level, points, bio, plan_tier, created_at")
      .order("points", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,handle.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const { data: members, error } = await query;

    if (error) {
      console.error("Failed to query members:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members: members || [] });
  } catch (err: any) {
    console.error("GET /api/v1/members exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
