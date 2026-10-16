import { NextResponse } from "next/server";
import { MOCK_CERTIFICATES } from "@/lib/school-mock";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certList = Object.values(MOCK_CERTIFICATES);
    const certificate =
      certList.find((c) => c.id === id || c.certificate_number === id || c.verification_hash === id) ||
      MOCK_CERTIFICATES[id];

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Certificate not found or invalid verification token",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      status: "AUTHENTIC_AND_VERIFIED",
      verification_authority: "AKSchool Autonomous Engineering Academy",
      certificate,
    });
  } catch (error: any) {
    console.error("Certificate verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
