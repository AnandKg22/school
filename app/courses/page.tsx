"use client";

import { useState } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  BookOpen,
  Sparkles,
  Star,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  Filter,
} from "lucide-react";
import { MOCK_COURSES } from "@/lib/school-mock";
import { PlanTier } from "@/lib/types";

export default function CoursesCatalogPage() {
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesTier =
      selectedTier === "all" ? true : course.required_tier === selectedTier;
    const matchesQuery =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesQuery;
  });

  const getTierBadge = (tier: PlanTier) => {
    switch (tier) {
      case "vip":
        return {
          label: "VIP Masterclass",
          badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "pro":
        return {
          label: "Pro Level",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
        };
      default:
        return {
          label: "Included Free",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <CommunityHeader onOpenAiCopilot={() => setIsCopilotOpen(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-100 border-b border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AKSchool Academy Curriculum</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Production-Ready AI Engineering Masterclasses
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Hands-on architectural masterclasses designed for software engineers, founders, and modern builders. Zero fluff, fully tested blueprints.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-800">4.9 / 5</span> rating (840+ reviews)
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Verifiable Cryptographic Certificates</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-7">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tier Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 ml-1 hidden sm:block" />
            {[
              { id: "all", label: "All Courses" },
              { id: "free", label: "Free Courses" },
              { id: "pro", label: "Pro Tier" },
              { id: "vip", label: "VIP Executive" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTier(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedTier === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search masterclasses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const tierBadge = getTierBadge(course.required_tier);
            const totalDuration =
              course.modules?.reduce(
                (acc, mod) =>
                  acc +
                  mod.lessons.reduce((lAcc, les) => lAcc + les.duration_minutes, 0),
                0
              ) || 75;

            return (
              <article
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Course Cover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={course.cover_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Tier Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tierBadge.badgeClass}`}
                    >
                      {tierBadge.label}
                    </span>
                  </div>

                  {/* Free Previews Available Badge */}
                  {course.modules?.some((m) =>
                    m.lessons.some((l) => l.is_free_preview)
                  ) && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 backdrop-blur-sm">
                      <Play className="w-3 h-3 fill-white" />
                      Free Previews
                    </div>
                  )}

                  {/* Pricing Pill */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    {course.pricing?.one_time_price
                      ? `$${course.pricing.one_time_price} Lifetime`
                      : "Free with Membership"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.total_lessons} Lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round(totalDuration / 60)} hrs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Certificate</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>Production GitHub Starter Repos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>Private community study space</span>
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                      <span>View Curriculum</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Community Membership Callout */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
              Unlimited Access Pass
            </span>
            <h2 className="text-3xl font-extrabold mb-4">
              Get Every Course + Live Weekly Coaching
            </h2>
            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              Unlock our entire library of current and upcoming agentic engineering masterclasses, join weekly live office hours, and network with 1,248+ AI builders.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/courses/agentic-ai-masterclass"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                Explore All-Access Membership
              </Link>
              <Link
                href="/classroom"
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-3 rounded-xl text-sm transition-all border border-slate-700"
              >
                Go to Classroom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
