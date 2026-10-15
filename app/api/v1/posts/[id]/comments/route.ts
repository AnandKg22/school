import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// POST /api/v1/posts/[id]/comments - Add a comment to a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required to comment." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data: member, error: memberError } = await client
      .from("app_school_members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Community membership not found." }, { status: 403 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
    }

    const { data: comment, error: insertError } = await client
      .from("app_school_comments")
      .insert({
        post_id: postId,
        author_id: member.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        author:app_school_members (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (insertError) {
      console.error("Failed to insert comment:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Increment post comments_count in database
    const { data: postData } = await client
      .from("app_school_posts")
      .select("comments_count")
      .eq("id", postId)
      .single();

    if (postData) {
      await client
        .from("app_school_posts")
        .update({ comments_count: (postData.comments_count || 0) + 1 })
        .eq("id", postId);
    }

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error("Comment route exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
