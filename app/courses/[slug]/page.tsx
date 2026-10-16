"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  Star,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Check,
  CreditCard,
  Layers,
  X,
  Share2,
  Users,
} from "lucide-react";
import { MOCK_COURSES, MOCK_MEMBERS } from "@/lib/school-mock";
import { Course, CourseLesson, PlanTier } from "@/lib/types";

export default function CourseSalesFunnelPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "agentic-ai-masterclass";

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activePreviewLesson, setActivePreviewLesson] = useState<CourseLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    mod_01: true,
    mod_saas_01: true,
    mod_vip_01: true,
  });
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanOption, setSelectedPlanOption] = useState<"lifetime" | "monthly" | "yearly">("lifetime");
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paypal">("stripe");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find course by slug or fallback
  const course: Course =
    MOCK_COURSES.find((c) => c.slug === slug || c.id === slug) || MOCK_COURSES[0];

  // Derive all lessons for preview
  const allLessons = course.modules?.flatMap((m) => m.lessons) || [];
  const freePreviewLessons = allLessons.filter((l) => l.is_free_preview);

  // Current active preview
  const currentVideoLesson = activePreviewLesson || freePreviewLessons[0] || allLessons[0];

  // Pricing calculations
  const baseLifetimePrice = course.pricing?.one_time_price || 149;
  const baseMonthlyPrice = course.pricing?.monthly_price || 19;
  const baseYearlyPrice = course.pricing?.yearly_price || 190;

  const currentPrice =
    selectedPlanOption === "lifetime"
      ? baseLifetimePrice
      : selectedPlanOption === "monthly"
      ? baseMonthlyPrice
      : baseYearlyPrice;

  const discountedPrice = Math.max(
    0,
    Math.round(currentPrice * (1 - discountPercent / 100))
  );

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "BUILDER20") {
      setDiscountPercent(20);
      setPromoError("");
    } else if (code === "VIP50") {
      setDiscountPercent(50);
      setPromoError("");
    } else if (code === "") {
      setDiscountPercent(0);
      setPromoError("");
    } else {
      setPromoError("Invalid discount code. Try 'BUILDER20' for 20% off.");
    }
  };

  const handleCompleteEnrollment = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getTierLabel = (tier: PlanTier) => {
    switch (tier) {
      case "vip":
        return "VIP Executive";
      case "pro":
        return "Pro Level";
      default:
        return "Included in Free Membership";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      <CommunityHeader onOpenAiCopilot={() => setIsCopilotOpen(true)} />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/courses" className="hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate">{course.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <header className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
              {getTierLabel(course.required_tier)}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Updated 2026 Edition
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold ml-auto">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.9 / 5</span>
              <span className="text-slate-400 font-normal">(842 verified reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-4xl leading-tight">
            {course.title}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-8 leading-relaxed">
            {course.description}
          </p>

          {/* Social Proof & Guarantees Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span><strong>1,248+</strong> builders enrolled</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Cryptographic Certificate</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Self-Paced Lifetime Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid: Video Teaser + Curriculum + Pricing Drawer */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Interactive Preview Player & Curriculum */}
          <div className="lg:col-span-8 space-y-10">

            {/* Video Teaser Player Card */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              {/* Video Display Area */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center group">
                <img
                  src={course.cover_url}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-40"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 flex flex-col justify-between p-6">
                  {/* Top Bar inside Video */}
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow">
                      <Play className="w-3 h-3 fill-white" />
                      Free Preview Sample
                    </span>
                    <span className="bg-slate-900/80 px-2.5 py-1 rounded-md text-slate-300">
                      Duration: {currentVideoLesson?.duration_minutes || 14} min
                    </span>
                  </div>

                  {/* Center Play Button */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                      ) : (
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                      )}
                    </button>
                    <span className="mt-3 text-xs sm:text-sm font-semibold text-white drop-shadow">
                      {isPlaying ? "Playing Video Preview..." : "Click to Play Preview Lecture"}
                    </span>
                  </div>

                  {/* Bottom Bar: Lecture Title */}
                  <div className="text-white">
                    <p className="text-xs text-blue-400 font-semibold mb-0.5">NOW PREVIEWING:</p>
                    <p className="text-sm sm:text-base font-bold truncate">
                      {currentVideoLesson?.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Free Preview Lecture Switcher */}
              <div className="p-4 bg-slate-950 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Available Sample Lectures:
                </p>
                <div className="flex flex-wrap gap-2">
                  {freePreviewLessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActivePreviewLesson(lesson);
                        setIsPlaying(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                        currentVideoLesson?.id === lesson.id
                          ? "bg-blue-600 text-white shadow"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>
                        Lesson {idx + 1}: {lesson.title.split(":")[0]} ({lesson.duration_minutes}m)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* What You Will Build (Projects) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Hands-On Engineering</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Real-World Projects You Will Ship
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Theory without implementation is useless. Every module produces working code you can deploy straight to production.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Autonomous Multi-Agent Loop",
                    desc: "Sense-Plan-Act feedback loops with memory compaction surviving 1M+ token contexts.",
                    tag: "TypeScript / Next.js 15",
                  },
                  {
                    title: "Deterministic Knowledge Router",
                    desc: "Zero-hallucination semantic query router combining SQL statistics with LLM reasoning.",
                    tag: "PostgreSQL / Vector",
                  },
                  {
                    title: "Multi-Tenant RLS Database",
                    desc: "Three-tier schema isolation with cryptographically signed tenant session claims.",
                    tag: "Supabase / PostgreSQL",
                  },
                  {
                    title: "Automated Self-Healing CI/CD",
                    desc: "Zero-downtime rolling container deployments with healthcheck monitoring.",
                    tag: "Docker / Dokploy",
                  },
                ].map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-colors"
                  >
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 mb-2">
                      {proj.tag}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{proj.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum Breakdown */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Course Curriculum</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.modules?.length || 0} Modules • {course.total_lessons} Detailed Lectures
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.values(openModules).every(Boolean);
                    const newStates: Record<string, boolean> = {};
                    course.modules?.forEach((m) => {
                      newStates[m.id] = !allOpen;
                    });
                    setOpenModules(newStates);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {Object.values(openModules).every(Boolean) ? "Collapse All" : "Expand All"}
                </button>
              </div>

              {/* Modules Accordion */}
              <div className="space-y-4 mt-6">
                {course.modules?.map((mod, modIdx) => {
                  const isOpen = openModules[mod.id] ?? false;
                  const modDuration = mod.lessons.reduce((acc, l) => acc + l.duration_minutes, 0);

                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {modIdx + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                            <p className="text-xs text-slate-500">
                              {mod.lessons.length} lessons • {modDuration} minutes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Lesson Items */}
                      {isOpen && (
                        <div className="divide-y divide-slate-100 p-2">
                          {mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.is_free_preview ? (
                                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <Play className="w-3 h-3 fill-emerald-600" />
                                  </span>
                                ) : (
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-3 h-3" />
                                  </span>
                                )}

                                <div>
                                  <p className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {lesson.title}
                                  </p>
                                  <span className="text-[11px] text-slate-400 flex items-center gap-2">
                                    <span>{lesson.duration_minutes} min</span>
                                    <span>•</span>
                                    <span>Full Architecture Blueprint</span>
                                  </span>
                                </div>
                              </div>

                              <div>
                                {lesson.is_free_preview ? (
                                  <button
                                    onClick={() => {
                                      setActivePreviewLesson(lesson);
                                      setIsPlaying(true);
                                      window.scrollTo({ top: 300, behavior: "smooth" });
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                  >
                                    Preview Free
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student Reviews & Testimonials */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Star className="w-4 h-4 fill-blue-600" />
                <span>Verified Outcomes</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                What Enrolled Engineers Are Saying
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Staff AI Engineer",
                    avatar: MOCK_MEMBERS[1].avatar_url,
                    text: "The deterministic semantic router and memory persistence patterns saved us 3 months of trial and error. The highest ROI course I took all year.",
                  },
                  {
                    name: "Marcus Vance",
                    role: "DevOps Lead",
                    avatar: MOCK_MEMBERS[2].avatar_url,
                    text: "Setting up automated container CI/CD and PostgreSQL multi-tenancy was painless with the provided blueprints. 10/10 masterclass.",
                  },
                  {
                    name: "Priya Nair",
                    role: "Full-Stack Builder",
                    avatar: MOCK_MEMBERS[3].avatar_url,
                    text: "As someone transitioning into AI engineering, the sense-plan-act loop breakdown made everything click. The quizzes and certificates are stellar.",
                  },
                  {
                    name: "David Ross",
                    role: "Product Founder",
                    avatar: MOCK_MEMBERS[4].avatar_url,
                    text: "Shipped our first autonomous agent SaaS within 3 weeks of enrolling. The community support and weekly coaching calls are invaluable.",
                  },
                ].map((testi, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <p className="text-xs sm:text-sm text-slate-700 italic mb-4 leading-relaxed">
                      &ldquo;{testi.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testi.avatar}
                        alt={testi.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{testi.name}</p>
                        <p className="text-[11px] text-slate-500">{testi.role}</p>
                      </div>
                      <div className="ml-auto flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Dossier */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={MOCK_MEMBERS[0].avatar_url}
                alt="Akaash Sharma"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-600 shadow-md flex-shrink-0"
              />
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
                  Course Instructor
                </span>
                <h3 className="text-xl font-bold text-slate-900">{MOCK_MEMBERS[0].full_name}</h3>
                <p className="text-xs text-blue-600 font-medium mb-3">
                  Platform Architect & Founder @ AKSchool
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Akaash has architected production autonomous multi-agent loops and enterprise cloud platforms handling millions of queries. He mentors over 1,248+ AI engineers worldwide.
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>1,248+ Students</span>
                  <span>•</span>
                  <span>14+ Years Building</span>
                  <span>•</span>
                  <span>4.9 Instructor Rating</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {[
                  {
                    q: "Are the source code blueprints included?",
                    a: "Yes. Every lesson includes verified TypeScript blueprints, Next.js 15 starter templates, and Docker Compose configurations ready to fork and customize.",
                  },
                  {
                    q: "How does the Cryptographic Certificate work?",
                    a: "Upon completing all modules and achieving 80%+ on course quizzes, an immutable cryptographic hash is generated with your name and verifiable on the public AKSchool registry.",
                  },
                  {
                    q: "Can I expense this with my employer?",
                    a: "Absolutely. We provide formal tax-compliant PDF invoices with company name and VAT/Tax ID input during checkout.",
                  },
                  {
                    q: "What if I get stuck while building?",
                    a: "You get full access to the course discussion space where instructors and alumni answer questions within 24 hours, plus weekly live Q&A office hours.",
                  },
                  {
                    q: "What is your refund policy?",
                    a: "We offer a 100% 30-day money-back guarantee. If you complete the lessons and feel this didn't level up your engineering skills, email us for a full refund.",
                  },
                ].map((faq, idx) => {
                  const isOpen = openFaqs[idx] ?? false;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60 pt-3 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Sticky Enrollment & Pricing Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl">
              
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">
                  Enrollment Open
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  30-Day Guarantee
                </span>
              </div>

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ${currentPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedPlanOption === "lifetime"
                      ? "one-time payment"
                      : selectedPlanOption === "monthly"
                      ? "/ month"
                      : "/ year"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full instant access to all curriculum, blueprints & community.
                </p>
              </div>

              {/* Plan Option Selector */}
              <div className="space-y-2.5 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedPlanOption("lifetime")}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedPlanOption === "lifetime"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">Lifetime Course Pass</p>
                    <p className="text-[11px] text-slate-500">Zero recurring fees, permanent access</p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">${baseLifetimePrice}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlanOption("monthly")}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedPlanOption === "monthly"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">All-Access Monthly</p>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                        All Courses
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Cancel anytime, includes live calls</p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">${baseMonthlyPrice}/mo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlanOption("yearly")}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedPlanOption === "yearly"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">Annual VIP Pass</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                        Save 20%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">2 months free + 1-on-1 audit</p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">${baseYearlyPrice}/yr</span>
                </button>
              </div>

              {/* Main CTA Button */}
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enroll Now & Get Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Value Inclusions */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <p className="font-bold text-slate-800 mb-1">What&apos;s included in this enrollment:</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Full access to {course.total_lessons} HD video lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Production TypeScript starter repositories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Interactive quizzes & cryptographic certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Private community channel & peer networking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Weekly live office hours with Akaash</span>
                </div>
              </div>

              {/* Money back badge */}
              <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 text-center">
                🔒 256-Bit Encrypted Secure Checkout via Stripe / PayPal.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile & Quick Enroll */}
      <aside aria-label="Quick Enrollment" className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={course.cover_url}
              alt={course.title}
              className="w-10 h-10 rounded-lg object-cover hidden sm:block flex-shrink-0"
            />
            <div className="truncate">
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{course.title}</p>
              <p className="text-[11px] text-slate-500">
                ${currentPrice} • Lifetime Access & Certificate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
            >
              Enroll Now (${currentPrice})
            </button>
          </div>
        </div>
      </aside>

      {/* 1-Click Interactive Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {checkoutSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  🎉 Welcome Aboard!
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  You are officially enrolled in <strong>{course.title}</strong>. An email receipt and access credentials have been sent to your inbox.
                </p>

                <div className="pt-4 flex flex-col gap-2">
                  <Link
                    href="/classroom"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow transition-all"
                  >
                    Start Learning in Classroom
                  </Link>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCheckoutSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Complete Your Enrollment</h3>
                    <p className="text-xs text-slate-500">{course.title}</p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Selected Plan Summary */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 capitalize">
                        {selectedPlanOption} Option
                      </p>
                      <p className="text-slate-500">Instant access to all modules</p>
                    </div>
                    <span className="text-base font-extrabold text-blue-700">
                      ${discountedPrice}
                    </span>
                  </div>

                  {/* Payment Gateway Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentProvider("stripe")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          paymentProvider === "stripe"
                            ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Credit Card / Stripe
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentProvider("paypal")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          paymentProvider === "paypal"
                            ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold text-blue-900">Pay</span>
                        <span className="font-bold text-sky-500">Pal</span>
                      </button>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Coupon or Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. BUILDER20"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {discountPercent > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        ✓ {discountPercent}% discount code applied successfully!
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-red-500 font-medium mt-1">{promoError}</p>
                    )}
                  </div>

                  {/* Simulated Card Inputs */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Cardholder Email
                      </label>
                      <input
                        type="email"
                        defaultValue="student@example.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>
                  </div>

                  {/* Checkout Submit Button */}
                  <button
                    type="button"
                    disabled={isCheckingOut}
                    onClick={handleCompleteEnrollment}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    {isCheckingOut ? (
                      <span>Processing Payment securely...</span>
                    ) : (
                      <span>Pay ${discountedPrice} & Enroll Instantly</span>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 SSL Encrypted • 30-Day Risk-Free Money Back Guarantee
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
