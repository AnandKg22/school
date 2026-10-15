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
