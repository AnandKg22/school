import { NextResponse } from "next/server";
import { MOCK_STREAKS } from "@/lib/school-mock";
import { Streak } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member_id") || "usr_admin_001";

    const streak: Streak = MOCK_STREAKS[memberId] || {
      member_id: memberId,
      current_streak_days: 1,
      longest_streak_days: 1,
      last_activity_date: new Date().toISOString().split("T")[0],
      fire_active: true,
    };

    return NextResponse.json({
      success: true,
      streak,
    });
  } catch (error: any) {
    console.error("Streak GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load streak" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { member_id } = body;

    if (!member_id) {
      return NextResponse.json(
        { success: false, error: "member_id is required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = MOCK_STREAKS[member_id];

    let newCurrentStreak = 1;
    let newLongestStreak = 1;

    if (existing) {
      const lastDate = existing.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastDate === today) {
        // Already checked in today
        newCurrentStreak = existing.current_streak_days;
        newLongestStreak = existing.longest_streak_days;
      } else if (lastDate === yesterday) {
        // Continuous streak
        newCurrentStreak = existing.current_streak_days + 1;
        newLongestStreak = Math.max(existing.longest_streak_days, newCurrentStreak);
      } else {
        // Streak broken
        newCurrentStreak = 1;
        newLongestStreak = existing.longest_streak_days;
      }
    }

    const updated: Streak = {
      member_id,
      current_streak_days: newCurrentStreak,
      longest_streak_days: newLongestStreak,
      last_activity_date: today,
      fire_active: true,
    };

    MOCK_STREAKS[member_id] = updated;

    return NextResponse.json({
      success: true,
      streak: updated,
      message: `Streak updated to ${updated.current_streak_days} days!`,
    });
  } catch (error: any) {
    console.error("Streak POST API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record activity streak" },
      { status: 500 }
    );
  }
}
