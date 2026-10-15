import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient } from "@/lib/supabase";

// PATCH /api/v1/me/profile - Update the authenticated user's member profile
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required to update profile." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, bio, avatar_url } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string" && full_name.trim()) {
      updates.full_name = full_name.trim();
    }
    if (typeof bio === "string") {
      updates.bio = bio.trim();
    }
    if (typeof avatar_url === "string" && avatar_url.trim()) {
      updates.avatar_url = avatar_url.trim();
    }

    const { data: updatedMember, error: updateError } = await client
      .from("app_school_members")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (err: any) {
    console.error("PATCH /api/v1/me/profile exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
