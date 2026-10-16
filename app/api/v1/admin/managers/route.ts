import { NextRequest, NextResponse } from "next/server";
import { MOCK_MANAGERS } from "@/lib/school-mock";
import { ManagerPermission } from "@/lib/types";

let runtimeManagers: ManagerPermission[] = [...MOCK_MANAGERS];

// GET /api/v1/admin/managers - List all community managers & their view permissions
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      count: runtimeManagers.length,
      managers: runtimeManagers,
    });
  } catch (err: any) {
    console.error("GET /api/v1/admin/managers error:", err);
    return NextResponse.json({ error: "Failed to fetch managers." }, { status: 500 });
  }
}

// POST /api/v1/admin/managers - Add, invite, or update manager view permissions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      member_email,
      member_name,
      role_title = "growth_lead",
      custom_title,
      can_view_revenue = false,
      can_view_gtm_logs = false,
      can_view_lms_analytics = true,
      can_view_community_metrics = true,
      can_export_reports = false,
      can_manage_curriculum = false,
      can_moderate_content = false,
      status = "active",
    } = body;

    if (!member_email) {
      return NextResponse.json({ error: "member_email is required." }, { status: 400 });
    }

    const existingIndex = runtimeManagers.findIndex(
      (m) => (id && m.id === id) || m.member_email.toLowerCase() === member_email.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing manager permissions
      const updated: ManagerPermission = {
        ...runtimeManagers[existingIndex],
        member_name: member_name || runtimeManagers[existingIndex].member_name,
        role_title,
        custom_title: custom_title || runtimeManagers[existingIndex].custom_title,
        status,
        can_view_revenue,
        can_view_gtm_logs,
        can_view_lms_analytics,
        can_view_community_metrics,
        can_export_reports,
        can_manage_curriculum,
        can_moderate_content,
      };
      runtimeManagers[existingIndex] = updated;

      return NextResponse.json({
        success: true,
        message: `Permissions updated for ${updated.member_name}`,
        manager: updated,
      });
    }

    // Create new manager permission record
    const newManager: ManagerPermission = {
      id: `mgr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      community_id: "comm_akschool_001",
      member_id: `usr_mgr_${Date.now()}`,
      member_name: member_name || member_email.split("@")[0],
      member_email,
      role_title,
      custom_title: custom_title || `${role_title.replace("_", " ").toUpperCase()}`,
      status,
      created_at: new Date().toISOString(),
      can_view_revenue,
      can_view_gtm_logs,
      can_view_lms_analytics,
      can_view_community_metrics,
      can_export_reports,
      can_manage_curriculum,
      can_moderate_content,
    };

    runtimeManagers = [newManager, ...runtimeManagers];

    return NextResponse.json({
      success: true,
      message: `Successfully invited manager ${newManager.member_name} with custom view permissions`,
      manager: newManager,
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/admin/managers error:", err);
    return NextResponse.json({ error: "Failed to save manager permissions." }, { status: 500 });
  }
}

// DELETE /api/v1/admin/managers - Revoke manager access
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Manager id is required." }, { status: 400 });
    }

    const initialLength = runtimeManagers.length;
    runtimeManagers = runtimeManagers.filter((m) => m.id !== id);

    if (runtimeManagers.length === initialLength) {
      return NextResponse.json({ error: "Manager not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Manager access revoked successfully.",
    });
  } catch (err: any) {
    console.error("DELETE /api/v1/admin/managers error:", err);
    return NextResponse.json({ error: "Failed to revoke manager." }, { status: 500 });
  }
}
