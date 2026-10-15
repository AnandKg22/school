import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// GET /api/v1/posts - List posts with author and comments
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");

    let query = client
      .from("app_school_posts")
      .select(`
        id,
        space_id,
        author_id,
        title,
        content,
        is_pinned,
        likes_count,
        comments_count,
        created_at,
        author:app_school_members (
          id,
          full_name,
          handle,
          avatar_url,
          role,
          level
        ),
        comments:app_school_comments (
          id,
          content,
          created_at,
          author:app_school_members (
            id,
            full_name,
            avatar_url,
            role
          )
        )
      `)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (spaceId && spaceId !== "all") {
      query = query.eq("space_id", spaceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch posts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err: any) {
    console.error("GET /api/v1/posts exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/v1/posts - Create a new discussion post
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required to post." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    // Verify member record
    const { data: member, error: memberError } = await client
      .from("app_school_members")
      .select("id, community_id")
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Community membership not found." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, spaceId } = body;

    if (!title || !content || !spaceId) {
      return NextResponse.json({ error: "Title, content, and spaceId are required." }, { status: 400 });
    }

    const { data: post, error: insertError } = await client
      .from("app_school_posts")
      .insert({
        space_id: spaceId,
        author_id: member.id,
        title: title.trim(),
        content: content.trim(),
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        id,
        space_id,
        author_id,
        title,
        content,
        is_pinned,
        likes_count,
        comments_count,
        created_at,
        author:app_school_members (
          id,
          full_name,
          handle,
          avatar_url,
          role,
          level
        )
      `)
      .single();

    if (insertError) {
      console.error("Failed to insert post:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    console.error("POST /api/v1/posts exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
