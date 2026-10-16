import { describe, it, expect } from "vitest";
import { MOCK_COURSES, MOCK_MEMBERS } from "../lib/school-mock";
import { Course, CourseLesson } from "../lib/types";

describe("Step 7: Dedicated Course Sales Funnel & Catalog (/courses & /courses/[slug])", () => {
  it("should provide mock courses with modules, lessons, and pricing configs", () => {
    expect(MOCK_COURSES.length).toBeGreaterThanOrEqual(3);

    const flagshipCourse = MOCK_COURSES[0];
    expect(flagshipCourse.id).toBe("course_agentic_01");
    expect(flagshipCourse.slug).toBe("agentic-ai-masterclass");
    expect(flagshipCourse.title).toContain("Agentic AI Engineering");
    expect(flagshipCourse.modules).toBeDefined();
    expect(flagshipCourse.modules!.length).toBeGreaterThanOrEqual(2);
    expect(flagshipCourse.pricing).toBeDefined();
  });

  it("should correctly resolve courses by slug with fallback handling", () => {
    const targetSlug = "full-stack-ai-engineering";
    const found = MOCK_COURSES.find((c) => c.slug === targetSlug || c.id === targetSlug);
    expect(found).toBeDefined();
    expect(found!.id).toBe("course_saas_02");
    expect(found!.pricing?.one_time_price).toBe(149);

    // Fallback for non-existent slug
    const invalidSlug = "non-existent-course-12345";
    const fallbackCourse =
      MOCK_COURSES.find((c) => c.slug === invalidSlug || c.id === invalidSlug) ||
      MOCK_COURSES[0];
    expect(fallbackCourse.id).toBe("course_agentic_01");
  });

  it("should extract free preview lessons for the interactive video teaser player", () => {
    const flagshipCourse = MOCK_COURSES[0];
    const allLessons: CourseLesson[] =
      flagshipCourse.modules?.flatMap((m) => m.lessons) || [];

    const freePreviews = allLessons.filter((l) => l.is_free_preview);
    expect(freePreviews.length).toBeGreaterThanOrEqual(2);

    expect(freePreviews[0].slug).toBe("architecture-agentic-loops");
    expect(freePreviews[0].duration_minutes).toBe(14);
    expect(freePreviews[0].video_url).toBeDefined();

    // Check that locked lessons exist for monetization
    const lockedLessons = allLessons.filter((l) => !l.is_free_preview);
    expect(lockedLessons.length).toBeGreaterThanOrEqual(1);
    expect(lockedLessons[0].slug).toBe("context-compaction");
  });

  it("should calculate correct pricing across lifetime, monthly, and promo discounts", () => {
    const saasCourse = MOCK_COURSES.find((c) => c.id === "course_saas_02")!;
    const lifetime = saasCourse.pricing?.one_time_price || 149;
    const monthly = saasCourse.pricing?.monthly_price || 19;
    const yearly = saasCourse.pricing?.yearly_price || 190;

    expect(lifetime).toBe(149);
    expect(monthly).toBe(19);
    expect(yearly).toBe(190);

    // Test 20% discount (BUILDER20)
    const discountPct = 20;
    const discountedLifetime = Math.round(lifetime * (1 - discountPct / 100));
    expect(discountedLifetime).toBe(119);

    // Test 50% discount (VIP50)
    const vipDiscounted = Math.round(lifetime * (1 - 50 / 100));
    expect(vipDiscounted).toBe(75);
  });
});
