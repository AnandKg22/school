import { NextRequest, NextResponse } from "next/server";
import { MOCK_GTM_LOGS } from "@/lib/school-mock";
import { GTMInteractionLog } from "@/lib/types";

// In-memory store for dynamic runtime GTM event additions
let runtimeGtmLogs: GTMInteractionLog[] = [...MOCK_GTM_LOGS];

// GET /api/v1/analytics/gtm/logs - Query Customer Interaction Logs for GTM Engineering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("event_type");
    const stage = searchParams.get("lifecycle_stage");
    const search = searchParams.get("search")?.toLowerCase();
    const format = searchParams.get("format"); // "json" | "csv"
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let logs = [...runtimeGtmLogs];

    if (eventType) {
      logs = logs.filter((log) => log.event_type === eventType);
    }

    if (stage) {
      logs = logs.filter((log) => log.lifecycle_stage === stage);
    }

    if (search) {
      logs = logs.filter((log) => 
        (log.member_name && log.member_name.toLowerCase().includes(search)) ||
        (log.member_email && log.member_email.toLowerCase().includes(search)) ||
        (log.target_name && log.target_name.toLowerCase().includes(search)) ||
        (log.metadata.utm_source && log.metadata.utm_source.toLowerCase().includes(search)) ||
        (log.metadata.utm_campaign && log.metadata.utm_campaign.toLowerCase().includes(search))
      );
    }

    // Sort newest first
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const sliced = logs.slice(0, limit);

    if (format === "csv") {
      const headers = ["ID", "Timestamp", "Event Type", "Lifecycle Stage", "Member Name", "Email", "Target", "UTM Source", "UTM Campaign", "Device", "Country", "Amount"];
      const rows = sliced.map((l) => [
        l.id,
        l.created_at,
        l.event_type,
        l.lifecycle_stage,
        `"${(l.member_name || "").replace(/"/g, '""')}"`,
        l.member_email || "",
        `"${(l.target_name || "").replace(/"/g, '""')}"`,
        l.metadata.utm_source || "",
        l.metadata.utm_campaign || "",
        `"${(l.metadata.device || "").replace(/"/g, '""')}"`,
        l.metadata.country || "",
        l.metadata.amount || 0,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="gtm_interaction_logs_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total_count: logs.length,
      count: sliced.length,
      logs: sliced,
    });
  } catch (err: any) {
    console.error("GET /api/v1/analytics/gtm/logs error:", err);
    return NextResponse.json({ error: "Failed to retrieve GTM logs." }, { status: 500 });
  }
}

// POST /api/v1/analytics/gtm/logs - Log a new GTM customer touchpoint / event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      lifecycle_stage = "visitor",
      member_id,
      member_name,
      member_email,
      target_id,
      target_name,
      metadata = {},
    } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type is required." }, { status: 400 });
    }

    const newLog: GTMInteractionLog = {
      id: `gtm_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      community_id: "comm_akschool_001",
      member_id,
      member_name,
      member_email,
      event_type,
      lifecycle_stage,
      target_id,
      target_name,
      metadata: {
        device: metadata.device || "Browser / Web Client",
        country: metadata.country || "Global",
        ...metadata,
      },
      created_at: new Date().toISOString(),
    };

    runtimeGtmLogs = [newLog, ...runtimeGtmLogs];

    return NextResponse.json({
      success: true,
      log: newLog,
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/analytics/gtm/logs error:", err);
    return NextResponse.json({ error: "Failed to ingest GTM event." }, { status: 500 });
  }
}
