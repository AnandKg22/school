import { NextResponse } from "next/server";
import { MOCK_COURSES, MOCK_COURSE_PRICING } from "@/lib/school-mock";
import { CoursePricing } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = MOCK_COURSES.find((c) => c.id === id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const pricing =
      MOCK_COURSE_PRICING[id] ||
      course.pricing || {
        course_id: id,
        pricing_type: "tier_only",
        one_time_price: 0,
        monthly_price: 0,
        yearly_price: 0,
        required_tier: course.required_tier,
        allow_standalone_purchase: false,
        currency: "USD",
      };

    return NextResponse.json({
      success: true,
      pricing,
      data: pricing,
    });
  } catch (error: any) {
    console.error("Course pricing GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course pricing" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = MOCK_COURSES.find((c) => c.id === id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      pricing_type,
      one_time_price,
      monthly_price,
      yearly_price,
      required_tier,
      allow_standalone_purchase,
      currency,
    } = body;

    const updatedPricing: CoursePricing = {
      course_id: id,
      pricing_type: pricing_type || "hybrid",
      one_time_price: Number(one_time_price) || 0,
      monthly_price: Number(monthly_price) || 0,
      yearly_price: Number(yearly_price) || 0,
      required_tier: required_tier || course.required_tier,
      allow_standalone_purchase: Boolean(allow_standalone_purchase),
      currency: currency || "USD",
    };

    MOCK_COURSE_PRICING[id] = updatedPricing;
    course.pricing = updatedPricing;
    if (required_tier) {
      course.required_tier = required_tier;
    }

    return NextResponse.json({
      success: true,
      message: "Course pricing configuration saved successfully",
      pricing: updatedPricing,
      data: updatedPricing,
    });
  } catch (error: any) {
    console.error("Course pricing POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course pricing" },
      { status: 500 }
    );
  }
}
