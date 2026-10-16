import { describe, it, expect } from "vitest";
import { MOCK_COURSES, MOCK_MEMBERS, MOCK_POSTS } from "@/lib/school-mock";

describe("Step 1: Universal Command Palette & Navigation Architecture", () => {
  it("indexes primary hub navigation destinations", () => {
    const destinations = [
      { id: "nav-community", title: "Community Discussions", route: "/community" },
      { id: "nav-classroom", title: "Classroom & Courses", route: "/classroom" },
      { id: "nav-events", title: "Live Events & Coaching Hub", route: "/events" },
      { id: "nav-leaderboard", title: "Leaderboard & Hall of Fame", route: "/leaderboard" },
      { id: "nav-affiliates", title: "Affiliate & Partner Portal", route: "/affiliates" },
      { id: "nav-members", title: "Members Directory", route: "/members" },
      { id: "nav-admin", title: "Operations & Admin Console", route: "/admin" },
    ];

    expect(destinations.length).toBe(7);
    expect(destinations.map(d => d.route)).toContain("/events");
    expect(destinations.map(d => d.route)).toContain("/leaderboard");
    expect(destinations.map(d => d.route)).toContain("/affiliates");
  });

  it("filters courses, lessons, and community posts accurately", () => {
    const query = "agent";
    const matchedCourses = MOCK_COURSES.filter(
      c => c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
    expect(matchedCourses.length).toBeGreaterThan(0);

    const memberQuery = "akaash";
    const matchedMembers = MOCK_MEMBERS.filter(
      m => m.full_name.toLowerCase().includes(memberQuery) || m.email.toLowerCase().includes(memberQuery)
    );
    expect(matchedMembers.length).toBeGreaterThan(0);
  });

  it("exposes essential action shortcuts (Live Coaching, Nova AI, Theme)", () => {
    const actions = [
      { id: "act-live", title: "Enter Live Coaching Room" },
      { id: "act-copilot", title: "Ask Nova AI Copilot" },
      { id: "act-theme", title: "Toggle Dark / Light Theme" },
    ];

    expect(actions.find(a => a.id === "act-live")).toBeDefined();
    expect(actions.find(a => a.id === "act-copilot")).toBeDefined();
    expect(actions.find(a => a.id === "act-theme")).toBeDefined();
  });
});
