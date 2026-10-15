import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const userClient = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    // Verify member role in database
    const { data: member, error: memberError } = await userClient
      .from("app_school_members")
      .select("id, role, community_id")
      .eq("user_id", user.id)
      .single();

    if (memberError || !member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden: Owner or Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { communityName, tagline, rules } = body;

    if (!communityName || typeof communityName !== "string") {
      return NextResponse.json({ error: "Valid community name is required." }, { status: 400 });
    }

    // Mutate community record under verified admin authority
    const { data: updatedCommunity, error: updateError } = await userClient
      .from("app_school_communities")
      .update({
        name: communityName.trim(),
        tagline: tagline?.trim() || null,
        rules: rules?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.community_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update community settings:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      community: updatedCommunity,
    });
  } catch (err: any) {
    console.error("Admin settings handler exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
