import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient } from "@/lib/supabase";

// GET /api/v1/learning/progress - Fetch user's completed lessons
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ completedLessons: [] });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ completedLessons: [] });
    }

    // Resolve member
    const { data: member } = await client
      .from("app_school_members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ completedLessons: [] });
    }

    const { data: progressList, error } = await client
      .from("app_school_progress")
      .select("lesson_id, completed_at")
      .eq("member_id", member.id);

    if (error) {
      console.error("Failed to fetch progress:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completedLessonIds = (progressList || []).map((p) => p.lesson_id);
    return NextResponse.json({ completedLessons: completedLessonIds });
  } catch (err: any) {
    console.error("GET /api/v1/learning/progress exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/v1/learning/progress - Toggle lesson completion
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required to update progress." }, { status: 401 });
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
    const { lessonId, courseId, completed } = body;

    if (!lessonId || !courseId) {
      return NextResponse.json({ error: "lessonId and courseId are required." }, { status: 400 });
    }

    if (completed) {
      // Mark complete (insert progress record)
      const { error: insertError } = await client
        .from("app_school_progress")
        .upsert(
          {
            member_id: member.id,
            lesson_id: lessonId,
            course_id: courseId,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "member_id,lesson_id" }
        );

      if (insertError) {
        console.error("Failed to mark lesson completed:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, completed: true });
    } else {
      // Mark incomplete (delete progress record)
      const { error: deleteError } = await client
        .from("app_school_progress")
        .delete()
        .eq("member_id", member.id)
        .eq("lesson_id", lessonId);

      if (deleteError) {
        console.error("Failed to remove lesson completion:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, completed: false });
    }
  } catch (err: any) {
    console.error("POST /api/v1/learning/progress exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
