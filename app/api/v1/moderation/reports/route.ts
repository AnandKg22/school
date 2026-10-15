import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// In-memory reports store fallback
let mockReports = [
  {
    id: "flag_01",
    postTitle: "100x Crypto Guarantee Inside",
    authorName: "Anonymous Visitor",
    reason: "Aggressive spam / unsolicited promotion",
    reportedAt: "2026-10-14 16:30",
    status: "pending",
  },
  {
    id: "flag_02",
    postTitle: "Unlicensed course mirror",
    authorName: "BotAccount_99",
    reason: "Copyright violation",
    reportedAt: "2026-10-14 14:10",
    status: "pending",
  },
];

// GET /api/v1/moderation/reports - List flagged items for moderators/admins
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    // Role verification
    const { data: member } = await client
      .from("app_school_members")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "owner" && member.role !== "admin" && member.role !== "moderator")) {
      return NextResponse.json({ error: "Forbidden: Moderator role required." }, { status: 403 });
    }

    return NextResponse.json({ reports: mockReports });
  } catch (err: any) {
    console.error("GET /api/v1/moderation/reports exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/v1/moderation/reports - Take action on flagged content (dismiss / remove)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const client = createAuthenticatedServerClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data: member } = await client
      .from("app_school_members")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "owner" && member.role !== "admin" && member.role !== "moderator")) {
      return NextResponse.json({ error: "Forbidden: Moderator role required." }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, action } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: "reportId and action are required." }, { status: 400 });
    }

    mockReports = mockReports.filter((r) => r.id !== reportId);

    return NextResponse.json({
      success: true,
      reportId,
      action,
      remainingCount: mockReports.length,
    });
  } catch (err: any) {
    console.error("POST /api/v1/moderation/reports exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
