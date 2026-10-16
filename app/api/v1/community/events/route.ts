import { NextResponse } from "next/server";
import { MOCK_EVENTS } from "@/lib/school-mock";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let events = MOCK_EVENTS;
    if (category && category !== "all") {
      events = events.filter((e) => e.category === category);
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
      data: events,
    });
  } catch (error: any) {
    console.error("Events GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch community events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event_id = body.event_id || body.eventId;
    const member_id = body.member_id || body.memberId;
    const rsvp = body.rsvp;

    if (!event_id) {
      return NextResponse.json(
        { success: false, error: "event_id is required" },
        { status: 400 }
      );
    }

    const event = MOCK_EVENTS.find((e) => e.id === event_id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const newRsvpStatus = rsvp !== undefined ? Boolean(rsvp) : !event.user_has_rsvped;
    event.user_has_rsvped = newRsvpStatus;
    event.attendees_count = newRsvpStatus
      ? event.attendees_count + 1
      : Math.max(0, event.attendees_count - 1);

    return NextResponse.json({
      success: true,
      event,
      data: { eventId: event.id, isAttending: newRsvpStatus },
      user_has_rsvped: newRsvpStatus,
      message: newRsvpStatus ? "Successfully RSVP'd to event" : "Removed RSVP",
    });
  } catch (error: any) {
    console.error("Events POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event RSVP" },
      { status: 500 }
    );
  }
}
