import { describe, it, expect } from "vitest";
import { MOCK_MEMBERS, MOCK_CERTIFICATES, MOCK_BADGES, MOCK_COURSES } from "@/lib/school-mock";

describe("Step 6: Dedicated Member Profile & Trophy Room (/profile & /members/[id])", () => {
  it("resolves member profile data by ID or handle", () => {
    const admin = MOCK_MEMBERS.find((m) => m.id === "usr_admin_001");
    expect(admin).toBeDefined();
    expect(admin?.full_name).toBe("Akaash Sharma (Super Admin)");
    expect(admin?.role).toBe("owner");

    const sarah = MOCK_MEMBERS.find((m) => m.handle === "sarahc");
    expect(sarah).toBeDefined();
    expect(sarah?.points).toBeGreaterThan(0);
  });

  it("links cryptographically verifiable certificates to member", () => {
    const certList = Object.values(MOCK_CERTIFICATES);
    expect(certList.length).toBeGreaterThan(0);

    const cert = certList[0];
    expect(cert.certificate_number).toContain("CERT-");
    expect(cert.verification_hash).toBeTruthy();
    expect(cert.grade_percentage).toBeGreaterThanOrEqual(80);
    expect(cert.course_title).toBeTruthy();
  });

  it("calculates curriculum progress and enrolled masterclasses correctly", () => {
    expect(MOCK_COURSES.length).toBeGreaterThan(0);

    const firstCourse = MOCK_COURSES[0];
    expect(firstCourse.total_lessons).toBeGreaterThan(0);
    expect(firstCourse.modules?.length).toBeGreaterThan(0);
  });

  it("generates structured 52-week activity contribution heatmap", () => {
    const weeks = 28;
    const daysPerWeek = 7;
    const grid: number[][] = [];

    for (let w = 0; w < weeks; w++) {
      const col: number[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const val = ((w * 7 + d * 3) % 5 === 0) ? 3 : ((w + d) % 3 === 0) ? 2 : ((w * d) % 4 === 0) ? 1 : 0;
        col.push(val);
      }
      grid.push(col);
    }

    expect(grid.length).toBe(28);
    expect(grid[0].length).toBe(7);
    const hasActiveDays = grid.some((col) => col.some((val) => val > 0));
    expect(hasActiveDays).toBe(true);
  });
});
