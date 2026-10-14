"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  MessageSquare,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Play,
  Users,
  Cpu,
  Layers,
  ChevronRight
} from "lucide-react";
import { MOCK_COURSES, MOCK_PLANS, MOCK_SPACES, MOCK_MEMBERS } from "@/lib/school-mock";

export default function HomePage() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(0,0,0,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>AKStack CommunityOS 1.0 • Powered by Xiaomi MiMo AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Own Your Community, Masterclasses &{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Paid Memberships
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            The no-code, AI-native alternative to Skool. Launch branded discussion spaces, video classrooms, automated tier gating, and an in-app AI knowledge copilot.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/community"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Live Community</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsAiOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ask MiMo Copilot</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">1,248+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active AI Builders</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grounded AI Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">&lt;0.8s</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">MiMo Inference Speed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Isolated RLS</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Self-Hosted PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skool-Style Features Grid */}
      <section id="features" className="py-16 sm:py-24 bg-white dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Complete Community OS
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Everything Needed to Run a Thriving Community & Academy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Discussion Spaces & Feed
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Organize conversations into clear spaces (Announcements, Q&A, Showcases). Author posts with rich formatting, emoji reactions, threaded comments, and pinned announcements.
              </p>
              <Link href="/community" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600">
                <span>View Community Feed</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Classroom Masterclasses
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Structured Course → Module → Lesson hierarchy. Video player, markdown lesson guides, resource downloads, and instant progress checkmarks for students.
              </p>
              <Link href="/classroom" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600">
                <span>Explore Classroom</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Xiaomi MiMo AI Copilot
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                An intelligent knowledge assistant connected to the Singapore Token Plan cluster (\`mimo-v2.6-flash\`). Indexes all community discussions and course lessons for instant, cited answers.
              </p>
              <button onClick={() => setIsAiOpen(true)} className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600">
                <span>Launch AI Assistant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Classroom Preview Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Featured Academy Curriculum
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                Master Autonomous Agents & Full-Stack Cloud Engineering
              </p>
            </div>
            <Link
              href="/classroom"
              className="mt-4 md:mt-0 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Browse All Masterclasses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {MOCK_COURSES.map((course) => (
              <div
                key={course.id}
                className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.cover_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                    {course.required_tier === "free" ? "Free Tier" : "Pro Membership"}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-semibold text-amber-400">
                      {course.total_lessons} Lessons Included
                    </span>
                    <h3 className="text-lg font-bold truncate">{course.title}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Access: {course.required_tier === "free" ? "Open to all members" : "Pro Tier Members"}
                    </span>
                    <Link
                      href="/classroom"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Learning</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Membership Plans */}
      <section id="pricing" className="py-16 sm:py-24 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Transparent Membership Tiers
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Join for Free, Upgrade for Full Enterprise Mastery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {MOCK_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative ${
                  plan.price_monthly > 0
                    ? "border-amber-500/40 ring-1 ring-amber-500/20 shadow-xl"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {plan.price_monthly > 0 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                    Most Popular Builder Plan
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      ₹{plan.price_monthly}
                    </span>
                    <span className="text-xs text-slate-500">/month</span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
                  <Link
                    href="/community"
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-center block transition-all ${
                      plan.price_monthly > 0
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {plan.price_monthly === 0 ? "Get Started for Free" : "Upgrade to Pro Tier"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">AKStack CommunityOS</span>
            <span>• An AI-Native Platform</span>
          </div>
          <div>
            Powered by Xiaomi MiMo AI V2.6 • Hosted with Dokploy VPS & Supabase
          </div>
        </div>
      </footer>

      {/* MiMo AI Assistant Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
