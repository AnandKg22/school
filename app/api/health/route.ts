import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "AKSchool",
    version: "1.0.0",
    cluster: "production",
    timestamp: new Date().toISOString(),
  });
}
