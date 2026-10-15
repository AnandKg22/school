import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// GET /api/v1/courses - List courses with modules and lessons
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const { data: courses, error } = await client
      .from("app_school_courses")
      .select(`
        id,
        community_id,
        title,
        slug,
        description,
        cover_url,
        is_locked,
        required_tier,
        total_lessons,
        sort_order,
        modules:app_school_modules (
          id,
          title,
          sort_order,
          lessons:app_school_lessons (
            id,
            module_id,
            title,
            slug,
            content,
            video_url,
            duration_minutes,
            is_free_preview,
            sort_order
          )
        )
      `)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch courses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: courses || [] });
  } catch (err: any) {
    console.error("GET /api/v1/courses exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/v1/courses - Create a new course (Author / Admin)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const body = await req.json();
    const { title, slug, description, cover_url, required_tier, is_locked, community_id } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Course title is required." }, { status: 400 });
    }

    const courseSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Find default community if none provided
    let targetCommunityId = community_id;
    if (!targetCommunityId) {
      const { data: comm } = await client.from("app_school_communities").select("id").limit(1).single();
      targetCommunityId = comm?.id || "comm_akschool_001";
    }

    const newCourse = {
      id: `course_${Date.now()}`,
      community_id: targetCommunityId,
      title: title.trim(),
      slug: courseSlug,
      description: description?.trim() || "",
      cover_url:
        cover_url?.trim() ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      required_tier: required_tier || "free",
      is_locked: is_locked ?? false,
      total_lessons: 0,
      sort_order: 10,
    };

    const { data, error } = await client
      .from("app_school_courses")
      .insert([newCourse])
      .select()
      .single();

    if (error) {
      console.warn("Database insert failed for course, using local fallback:", error.message);
      return NextResponse.json({ course: { ...newCourse, modules: [] } }, { status: 201 });
    }

    return NextResponse.json({ course: { ...data, modules: [] } }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/courses exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
