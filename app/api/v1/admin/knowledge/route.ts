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
    const { title, content, sourceType } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const { data: insertedDoc, error: insertError } = await userClient
      .from("app_school_ai_knowledge")
      .insert({
        community_id: member.community_id,
        title: title.trim(),
        content: content.trim(),
        source_type: sourceType || "faq",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert AI knowledge item:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: insertedDoc,
    });
  } catch (err: any) {
    console.error("Admin knowledge handler exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
