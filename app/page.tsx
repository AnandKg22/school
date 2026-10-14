"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  MessageSquare,
  BookOpen,
  Sparkles,
  ArrowRight,
  Check,
  Play,
  Users,
  Flame,
  Star,
  Search,
  Filter,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";
import { MOCK_COURSES, MOCK_PLANS } from "@/lib/school-mock";

export default function HomePage() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { label: "Trending", icon: "🔥" },
    { label: "AI Engineering", icon: "🤖" },
    { label: "Agentic Systems", icon: "⚡" },
    { label: "Full-Stack Cloud", icon: "💻" },
    { label: "SaaS Builders", icon: "🚀" },
    { label: "Showcases", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>AKSchool • The Modern Academy & Community Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0F172A] dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Master Autonomous AI & Build With{" "}
            <span className="text-signature-gradient">
              Fellow Engineers
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-[#475569] dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The all-in-one academy for software engineers and founders. Watch structured video masterclasses, share verified code blueprints, and study with <strong>Nova AI</strong>.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/community"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Community & Academy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsAiOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-[#0F172A] dark:text-slate-200 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ask Nova AI Study Buddy</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-[#E2E8F0] dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">1,248+</div>
              <div className="text-xs text-[#64748B] mt-1">Active AI Builders</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-[#64748B] mt-1">Verified Code Blueprints</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">2 Flagship</div>
              <div className="text-xs text-[#64748B] mt-1">Academy Masterclasses</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600">24/7 Live</div>
              <div className="text-xs text-[#64748B] mt-1">Nova AI Study Buddy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skool Explore Style Category Filters & Featured Courses */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Category Pill Bar (Exact match to Skool Screenshot 1) */}
        <div className="flex items-center justify-between gap-3 mb-8 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.label
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-[#475569] border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Featured Academy Cards (Matches Skool 3-Column Card Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Agentic Masterclass */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src={MOCK_COURSES[0].cover_url}
                alt={MOCK_COURSES[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#0F172A]/90 text-white backdrop-blur-sm">
                FREE MASTERCLASS
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    AK
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">AKSchool Engineering</span>
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-2 line-clamp-1">
                  {MOCK_COURSES[0].title}
                </h3>
                <p className="text-xs text-[#475569] dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {MOCK_COURSES[0].description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-[#0F172A] dark:text-white">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>1,248</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>5.0 (89)</span>
                </div>
                <span className="font-extrabold text-blue-600">Free Access</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pro Application Engineering */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src={MOCK_COURSES[1].cover_url}
                alt={MOCK_COURSES[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white backdrop-blur-sm">
                PRO ACADEMY
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    CL
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Production Systems</span>
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-2 line-clamp-1">
                  {MOCK_COURSES[1].title}
                </h3>
                <p className="text-xs text-[#475569] dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {MOCK_COURSES[1].description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-[#0F172A] dark:text-white">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>620</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>5.0 (42)</span>
                </div>
                <span className="font-extrabold text-[#0F172A] dark:text-white">₹999/mo</span>
              </div>
            </div>
          </div>

          {/* Card 3: Nova AI Copilot Card */}
          <div className="bg-gradient-to-tr from-blue-600 to-emerald-500 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">
                Nova AI Study Buddy
              </h3>
              <p className="text-xs text-blue-50 leading-relaxed mb-6">
                Have questions while building? Nova indexes every lecture, discussion, and code blueprint to guide you 24/7 with zero hallucinations.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/20">
              <button
                onClick={() => setIsAiOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Chat with Nova</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Membership Plans */}
      <section id="pricing" className="py-16 bg-white dark:bg-slate-900 border-t border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Straightforward Membership
            </h2>
            <p className="mt-2 text-3xl font-black text-[#0F172A] dark:text-white">
              Join For Free, Scale With Pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {MOCK_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col justify-between relative border ${
                  plan.price_monthly > 0
                    ? "border-blue-600 ring-2 ring-blue-600 shadow-xl"
                    : "border-[#E2E8F0] dark:border-slate-700"
                }`}
              >
                {plan.price_monthly > 0 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                    Most Popular Builder Plan
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#0F172A] dark:text-white">
                      ₹{plan.price_monthly}
                    </span>
                    <span className="text-xs text-slate-500">/month</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <Link
                    href="/community"
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-center block transition-all ${
                      plan.price_monthly > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                        : "bg-slate-100 dark:bg-slate-700 text-[#0F172A] dark:text-white hover:bg-slate-200"
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
      <footer className="mt-auto py-8 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#0F172A] dark:text-white">AKSchool</span>
            <span>• Built for AI Engineers & Builders</span>
          </div>
          <div>
            © {new Date().getFullYear()} AKSchool. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Nova AI Study Buddy Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
