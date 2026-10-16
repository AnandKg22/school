import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";
import { MOCK_ANALYTICS_SUMMARY, MOCK_MANAGERS } from "@/lib/school-mock";
import { AnalyticsSummary } from "@/lib/types";

// GET /api/v1/analytics/overview - Creator Analytics & Funnel Overview with RBAC
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let isSuperAdmin = false;
    let managerPermissions = null;

    if (authHeader) {
      try {
        const client = createAuthenticatedServerClient(authHeader);
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          isSuperAdmin = 
            user.email === "admin@akstack.com" || 
            user.app_metadata?.role === "superadmin" ||
            user.app_metadata?.claims_admin === true;

          if (!isSuperAdmin) {
            // Check if member is a designated manager
            const { data: member } = await client
              .from("app_school_members")
              .select("id, role")
              .eq("user_id", user.id)
              .single();

            if (member) {
              if (member.role === "owner" || member.role === "admin") {
                isSuperAdmin = true;
              } else {
                const { data: mgr } = await client
                  .from("app_school_manager_permissions")
                  .select("*")
                  .eq("member_id", member.id)
                  .eq("status", "active")
                  .single();

                if (mgr) {
                  managerPermissions = mgr;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not verify auth token in analytics overview, using fallback mode:", err);
      }
    }

    // Default to SuperAdmin view in local dev / prototype mode if no restrictive manager token is provided
    const canViewRevenue = isSuperAdmin || (managerPermissions ? managerPermissions.can_view_revenue : true);
    const canViewLms = isSuperAdmin || (managerPermissions ? managerPermissions.can_view_lms_analytics : true);
    const canViewCommunity = isSuperAdmin || (managerPermissions ? managerPermissions.can_view_community_metrics : true);

    const payload: Partial<AnalyticsSummary> = {
      community_id: MOCK_ANALYTICS_SUMMARY.community_id,
      timestamp: new Date().toISOString(),
    };

    if (canViewRevenue) {
      payload.revenue = MOCK_ANALYTICS_SUMMARY.revenue;
      payload.churn = MOCK_ANALYTICS_SUMMARY.churn;
    }

    if (canViewLms) {
      payload.courses = MOCK_ANALYTICS_SUMMARY.courses;
    }

    if (canViewCommunity) {
      payload.engagement = MOCK_ANALYTICS_SUMMARY.engagement;
    }

    return NextResponse.json({
      success: true,
      analytics: payload,
      permissions: {
        is_superadmin: isSuperAdmin,
        can_view_revenue: canViewRevenue,
        can_view_lms_analytics: canViewLms,
        can_view_community_metrics: canViewCommunity,
      },
    });
  } catch (err: any) {
    console.error("GET /api/v1/analytics/overview error:", err);
    return NextResponse.json({ error: "Internal server error fetching analytics." }, { status: 500 });
  }
}
