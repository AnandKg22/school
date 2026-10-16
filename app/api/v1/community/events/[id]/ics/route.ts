import { NextResponse } from "next/server";
import { MOCK_EVENTS } from "@/lib/school-mock";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = MOCK_EVENTS.find((e) => e.id === id);

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const formatIcsDate = (isoStr: string) => {
      const date = new Date(isoStr);
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AKSchool//Autonomous Academy Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@school.akstack.com`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(event.starts_at)}`,
      `DTEND:${formatIcsDate(event.ends_at)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location_url}`,
      `URL:${event.location_url}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("ICS export error:", error);
    return new NextResponse("Failed to generate .ics calendar event", { status: 500 });
  }
}
