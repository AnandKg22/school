import { NextRequest, NextResponse } from "next/server";
import { MOCK_BROADCASTS, MOCK_BROADCAST_TEMPLATES } from "@/lib/school-mock";
import { EmailBroadcast } from "@/lib/types";

let runtimeBroadcasts: EmailBroadcast[] = [...MOCK_BROADCASTS];

// GET /api/v1/admin/broadcasts - List all email broadcasts & newsletter templates
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      count: runtimeBroadcasts.length,
      templates: MOCK_BROADCAST_TEMPLATES,
      broadcasts: runtimeBroadcasts,
      stats: {
        total_sent: runtimeBroadcasts.filter((b) => b.status === "sent").length,
        avg_open_rate: 56.5,
        avg_click_rate: 30.1,
      },
    });
  } catch (err: any) {
    console.error("GET /api/v1/admin/broadcasts error:", err);
    return NextResponse.json({ error: "Failed to fetch broadcasts." }, { status: 500 });
  }
}

// POST /api/v1/admin/broadcasts - Draft or send a new email broadcast
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      preview_text = "",
      content_html,
      audience = "all_members",
      status = "sent",
      scheduled_at,
    } = body;

    if (!subject || !content_html) {
      return NextResponse.json({ error: "Subject and content_html are required." }, { status: 400 });
    }

    const recipientCountMap = {
      all_members: 1248,
      pro_only: 380,
      vip_only: 85,
      free_only: 783,
      course_students: 420,
    };

    const newBroadcast: EmailBroadcast = {
      id: `bc_${Date.now()}`,
      community_id: "comm_akschool_001",
      subject,
      preview_text,
      content_html,
      audience,
      status,
      recipient_count: (recipientCountMap as any)[audience] || 1248,
      open_rate_pct: status === "sent" ? 0.0 : undefined,
      click_rate_pct: status === "sent" ? 0.0 : undefined,
      scheduled_at,
      sent_at: status === "sent" ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };

    runtimeBroadcasts = [newBroadcast, ...runtimeBroadcasts];

    return NextResponse.json({
      success: true,
      message: status === "sent" 
        ? `Broadcast sent successfully to ${newBroadcast.recipient_count} members!`
        : "Broadcast draft saved.",
      broadcast: newBroadcast,
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/admin/broadcasts error:", err);
    return NextResponse.json({ error: "Failed to send email broadcast." }, { status: 500 });
  }
}
