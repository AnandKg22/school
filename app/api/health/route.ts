import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "AKStack CommunityOS (School)",
    version: "1.0.0",
    cluster: "production",
    timestamp: new Date().toISOString(),
  });
}
