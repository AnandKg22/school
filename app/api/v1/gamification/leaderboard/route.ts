import { NextResponse } from "next/server";
import { MOCK_LEADERBOARD, MOCK_BADGES } from "@/lib/school-mock";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "month";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // In production with live Supabase:
    // Query `app_school_members` joined with `app_school_streaks` ordered by points DESC
    const leaderboard = MOCK_LEADERBOARD.slice(0, limit);

    return NextResponse.json({
      success: true,
      timeframe,
      total_contributors: leaderboard.length,
      leaderboard,
      badges_catalog: MOCK_BADGES,
    });
  } catch (error: any) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
