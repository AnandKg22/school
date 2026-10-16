import { NextRequest, NextResponse } from "next/server";
import { MOCK_LIVE_SESSIONS } from "@/lib/school-mock";
import { LiveSessionRoom } from "@/lib/types";

let runtimeLiveSessions: LiveSessionRoom[] = [...MOCK_LIVE_SESSIONS];

// GET /api/v1/community/live-rooms - List live and upcoming coaching sessions
export async function GET(req: NextRequest) {
  try {
    const activeSession = runtimeLiveSessions.find((s) => s.is_live_now);
    const upcomingSessions = runtimeLiveSessions.filter((s) => !s.is_live_now);

    return NextResponse.json({
      success: true,
      active_session: activeSession || null,
      upcoming_sessions: upcomingSessions,
      total_count: runtimeLiveSessions.length,
    });
  } catch (err: any) {
    console.error("GET /api/v1/community/live-rooms error:", err);
    return NextResponse.json({ error: "Failed to fetch live coaching sessions." }, { status: 500 });
  }
}

// POST /api/v1/community/live-rooms - Start a live room or schedule a new coaching call
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, title, description, platform = "native", join_url, scheduled_start, agenda = [], required_tier = "free" } = body;

    // 1. Toggle Go Live Now
    if (action === "toggle_live" && id) {
      const session = runtimeLiveSessions.find((s) => s.id === id);
      if (session) {
        session.is_live_now = !session.is_live_now;
        return NextResponse.json({
          success: true,
          message: session.is_live_now ? "Broadcast started! Members are notified." : "Broadcast ended.",
          session,
        });
      }
    }

    // 2. Schedule new live room
    if (!title || !join_url) {
      return NextResponse.json({ error: "Title and join_url are required." }, { status: 400 });
    }

    const newSession: LiveSessionRoom = {
      id: `live_${Date.now()}`,
      community_id: "comm_akschool_001",
      title,
      description: description || "Interactive live video coaching and code-along workshop.",
      host_id: "usr_admin_001",
      host_name: "Akaash Sharma (Super Admin)",
      host_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      platform,
      join_url,
      is_live_now: false,
      scheduled_start: scheduled_start || new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 60,
      agenda: agenda.length > 0 ? agenda : ["Live Architecture Teardown", "Open Community Q&A"],
      attendees_count: 0,
      required_tier,
    };

    runtimeLiveSessions = [newSession, ...runtimeLiveSessions];

    return NextResponse.json({
      success: true,
      message: "Coaching call scheduled successfully.",
      session: newSession,
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/community/live-rooms error:", err);
    return NextResponse.json({ error: "Failed to schedule live room." }, { status: 500 });
  }
}
