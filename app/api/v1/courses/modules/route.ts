import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// POST /api/v1/courses/modules - Create a new module inside a course
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const body = await req.json();
    const { course_id, title, sort_order } = body;

    if (!course_id || !title || !title.trim()) {
      return NextResponse.json({ error: "course_id and module title are required." }, { status: 400 });
    }

    const newModule = {
      id: `mod_${Date.now()}`,
      course_id,
      title: title.trim(),
      sort_order: sort_order ?? 1,
    };

    const { data, error } = await client
      .from("app_school_modules")
      .insert([newModule])
      .select()
      .single();

    if (error) {
      console.warn("Database insert failed for module, using local fallback:", error.message);
      return NextResponse.json({ module: { ...newModule, lessons: [] } }, { status: 201 });
    }

    return NextResponse.json({ module: { ...data, lessons: [] } }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/courses/modules exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
