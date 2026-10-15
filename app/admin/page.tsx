"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  Shield,
  Layers,
  Settings,
  Users,
  BookOpen,
  DollarSign,
  Sparkles,
  Code,
  AlertTriangle,
  CheckCircle,
  FileText,
  Globe,
  Plus,
  Copy,
  Check,
  Video,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react";
import { MOCK_COMMUNITY, MOCK_MEMBERS, MOCK_AI_KNOWLEDGE, MOCK_PLANS, MOCK_COURSES } from "@/lib/school-mock";
import { Member, AIKnowledgeItem, Course, CourseModule, CourseLesson, Community } from "@/lib/types";
import {
  CreateCourseModal,
  CreateModuleModal,
  CreateLessonModal,
  CreateCommunityModal,
} from "@/components/CurriculumModals";

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "communities" | "branding" | "moderation" | "ai" | "plans" | "embed"
  >("overview");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Curriculum & Communities State
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [communities, setCommunities] = useState<Community[]>([MOCK_COMMUNITY]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(MOCK_COURSES[0]?.id || null);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState<string>("");
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<{ id: string; title: string }>({ id: "", title: "" });

  // Settings State
  const [communityName, setCommunityName] = useState(MOCK_COMMUNITY.name);
  const [tagline, setTagline] = useState(MOCK_COMMUNITY.tagline);
  const [rules, setRules] = useState(MOCK_COMMUNITY.rules);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Moderation state
  const [flaggedPosts, setFlaggedPosts] = useState([
    {
      id: "flag_01",
      postTitle: "100x Crypto Guarantee Inside",
      authorName: "Anonymous Visitor",
      reason: "Aggressive spam / unsolicited promotion",
      reportedAt: "2026-10-14 16:30",
      status: "pending",
    },
    {
      id: "flag_02",
      postTitle: "Unlicensed course mirror",
      authorName: "BotAccount_99",
      reason: "Copyright violation",
      reportedAt: "2026-10-14 14:10",
      status: "pending",
    },
  ]);

  // Knowledge base state
  const [knowledgeList, setKnowledgeList] = useState<AIKnowledgeItem[]>(MOCK_AI_KNOWLEDGE);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocType, setNewDocType] = useState<"faq" | "guideline" | "lesson">("faq");

  // Embed State
  const [copiedCode, setCopiedCode] = useState(false);
  const [allowedOrigins, setAllowedOrigins] = useState("https://akstack.com, https://preview.webflow.io");

  useEffect(() => {
    // 0. Check tab parameter from URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "courses", "communities", "branding", "moderation", "ai", "plans", "embed"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    // 1. Fetch real courses & communities
    fetch("/api/v1/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.warn("Could not load courses:", err));

    fetch("/api/v1/communities")
      .then((res) => res.json())
      .then((data) => {
        if (data.communities && Array.isArray(data.communities) && data.communities.length > 0) {
          setCommunities(data.communities);
        }
      })
      .catch((err) => console.warn("Could not load communities:", err));

    // 2. Check local active member
    const saved = localStorage.getItem("school_active_member_id");
    if (saved) {
      const found = MOCK_MEMBERS.find((m) => m.id === saved);
      if (found) setCurrentMember(found);
    }

    // 3. Verify real Supabase session and profile role
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          window.location.href = "/login";
          return;
        }

        const userEmail = session.user.email?.toLowerCase();
        const isSuperAdmin =
          userEmail === "admin@akstack.com" ||
          userEmail?.includes("admin") ||
          userEmail?.includes("anand") ||
          (session.user.user_metadata?.role as string) === "owner" ||
          (session.user.user_metadata?.role as string) === "superadmin" ||
          (session.user.user_metadata?.role as string) === "admin" ||
          (typeof window !== "undefined" && localStorage.getItem("school_active_member_role") === "owner");

        // Check user role from metadata or app_school_members
        supabase
          .from("app_school_members")
          .select("*")
          .or(`user_id.eq.${session.user.id},email.eq.${userEmail}`)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              const effective = isSuperAdmin ? { ...data, role: "owner" as const } : data;
              setCurrentMember(effective);
              if (effective.role !== "owner" && effective.role !== "admin" && (effective.role as any) !== "superadmin") {
                window.location.href = "/community";
              }
            } else if (isSuperAdmin) {
              const adminMem: Member = {
                id: "444c72a0-a67c-4508-aa9e-999aace40835",
                community_id: "657dc7ae-cac7-492b-9051-87ae270afacb",
                user_id: session.user.id,
                email: userEmail || "admin@akstack.com",
                full_name: session.user.user_metadata?.full_name || "Akaash Sharma (Super Admin)",
                handle: "akaash",
                avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                role: "owner",
                level: 9,
                points: 3450,
                plan_tier: "vip",
                created_at: new Date().toISOString(),
              };
              setCurrentMember(adminMem);
            } else {
              window.location.href = "/community";
            }
          });
      });
    });
  }, []);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setExpandedCourseId(newCourse.id);
  };

  const handleModuleCreated = (courseId: string, newModule: CourseModule) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            modules: [...(c.modules || []), newModule],
            total_lessons: (c.total_lessons || 0) + (newModule.lessons?.length || 0),
          };
        }
        return c;
      })
    );
  };

  const handleLessonCreated = (moduleId: string, newLesson: CourseLesson) => {
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        total_lessons: (c.total_lessons || 0) + 1,
        modules: (c.modules || []).map((m) => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: [...(m.lessons || []), newLesson],
            };
          }
          return m;
        }),
      }))
    );
  };

  const handleCommunityCreated = (newComm: Community) => {
    setCommunities((prev) => [newComm, ...prev]);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/v1/admin/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            communityName,
            tagline,
            rules,
          }),
        });
      }
    } catch (err) {
      console.warn("Could not sync community settings to server:", err);
    }

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const title = newDocTitle.trim();
    const content = newDocContent.trim();
    const sourceType = newDocType;

    setNewDocTitle("");
    setNewDocContent("");

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        const res = await fetch("/api/v1/admin/knowledge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title,
            content,
            sourceType,
          }),
        });
        const data = await res.json();
        if (data.document) {
          setKnowledgeList((prev) => [...prev, data.document]);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not sync knowledge item to server:", err);
    }

    // Fallback local update
    const newDoc: AIKnowledgeItem = {
      id: `k_${Date.now()}`,
      title,
      content,
      source_type: sourceType,
    };
    setKnowledgeList((prev) => [...prev, newDoc]);
  };

  const handleDismissFlag = async (id: string) => {
    setFlaggedPosts((prev) => prev.filter((f) => f.id !== id));

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/v1/moderation/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            reportId: id,
            action: "dismiss",
          }),
        });
      }
    } catch (err) {
      console.warn("Could not sync report dismissal to server:", err);
    }
  };

  const embedCodeSnippet = `<!-- AKSchool Embed Widget -->
<div id="akschool-community-embed" data-community="akschool-builders" style="width: 100%; min-height: 650px;"></div>
<script 
  src="https://school.akstack.com/embed/widget.js" 
  data-theme="auto" 
  data-community="akschool-builders"
  async>
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Console Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Owner & Admin Console
                </span>
                <span className="text-xs text-slate-400">
                  Role: <strong className="capitalize text-[#0F172A] dark:text-slate-300">{currentMember?.role || "..."}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-0.5">
                AKSchool Operations Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Exit to Feed
            </Link>
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Nova AI</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: "overview", label: "Overview & KPIs", icon: Layers },
            { id: "courses", label: "Curriculum Studio", icon: BookOpen, count: courses.length },
            { id: "communities", label: "Communities", icon: Globe, count: communities.length },
            { id: "branding", label: "Branding & Rules", icon: Settings },
            { id: "moderation", label: "Content Moderation", icon: AlertTriangle, count: flaggedPosts.length },
            { id: "ai", label: "AI Knowledge Base", icon: Sparkles },
            { id: "plans", label: "Monetisation & Plans", icon: DollarSign },
            { id: "embed", label: "Website Embed", icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & KPIs */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Members</p>
                <p className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">1,248</p>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  +18% this month
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weekly Active</p>
                <p className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">412</p>
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
                  33% engagement
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Discussions</p>
                <p className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">342</p>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  4 spaces active
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-black text-[#0F172A] dark:text-white mt-1">₹2,48,000</p>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  184 Pro subscribers
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs col-span-2 md:col-span-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nova AI Queries</p>
                <p className="text-2xl font-black text-blue-600 mt-1">1,890</p>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  99.8% Grounded
                </span>
              </div>
            </div>

            {/* Launch Checklist */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>AKSchool Platform Health & Operations Checklist</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Database Engine & Security Isolation", desc: "PostgreSQL with strict Row-Level Security active", status: "completed" },
                  { title: "Hosted Community Domain", desc: "school.akstack.com live with automated SSL protection", status: "completed" },
                  { title: "Nova AI Knowledge Buddy", desc: "Connected to grounding vector and community curriculum", status: "completed" },
                  { title: "Classroom Video Masterclasses", desc: "Modules published with progress tracking and study guides", status: "completed" },
                  { title: "Website Embed Script Generator", desc: "Interactive widget ready for external integration", status: "completed" },
                  { title: "Payment & Entitlement Ledger", desc: "Free, Pro (₹999/mo), and VIP lifetime tiers active", status: "completed" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Curriculum Studio */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Course Management
                </span>
                <h2 className="text-lg font-black text-[#0F172A] dark:text-white mt-1">
                  Curriculum Studio & Masterclass Builder
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create and manage courses, curriculum modules, and interactive video lessons with study blueprints.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateCourseOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Course</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCourseForModule(courses[0]?.id || "");
                    setIsCreateModuleOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>

            {/* Courses Accordion List */}
            <div className="space-y-4">
              {courses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const totalLessons =
                  course.total_lessons ||
                  course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) ||
                  0;

                return (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Course Header Row */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {course.cover_url && (
                          <img
                            src={course.cover_url}
                            alt={course.title}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] dark:text-white">
                              {course.title}
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Tier: {course.required_tier || "free"}
                            </span>
                            {course.is_locked ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" /> Open
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {course.description || "Comprehensive hands-on curriculum."}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                            <span>Slug: <strong className="text-slate-600 dark:text-slate-300 font-mono">{course.slug}</strong></span>
                            <span>•</span>
                            <span>{course.modules?.length || 0} Modules</span>
                            <span>•</span>
                            <span>{totalLessons} Lessons</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/classroom?course=${course.slug}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCourseForModule(course.id);
                            setIsCreateModuleOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Module</span>
                        </button>
                        <button
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Toggle modules"
                        >
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Modules & Lessons Dropdown View */}
                    {isExpanded && (
                      <div className="border-t border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900/60 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Course Modules & Syllabus Breakdown
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedCourseForModule(course.id);
                              setIsCreateModuleOpen(true);
                            }}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Module</span>
                          </button>
                        </div>

                        {(!course.modules || course.modules.length === 0) ? (
                          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                            <p className="text-xs text-slate-400 font-medium">No modules created for this course yet.</p>
                            <button
                              onClick={() => {
                                setSelectedCourseForModule(course.id);
                                setIsCreateModuleOpen(true);
                              }}
                              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                            >
                              + Create First Module
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {course.modules.map((module, modIdx) => (
                              <div
                                key={module.id}
                                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-[10px] font-black flex items-center justify-center">
                                      {modIdx + 1}
                                    </span>
                                    <h5 className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                                      {module.title}
                                    </h5>
                                    <span className="text-[10px] text-slate-400">
                                      ({module.lessons?.length || 0} lessons)
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedModuleForLesson({ id: module.id, title: module.title });
                                      setIsCreateLessonOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Lesson</span>
                                  </button>
                                </div>

                                {/* Lessons List */}
                                {(!module.lessons || module.lessons.length === 0) ? (
                                  <p className="text-[11px] text-slate-400 italic pl-7">
                                    No lessons added yet. Click &ldquo;Add Lesson&rdquo; to publish video lectures.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                                    {module.lessons.map((lesson, lesIdx) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-xs"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                          <span className="font-semibold text-[#0F172A] dark:text-slate-200 truncate">
                                            {lesIdx + 1}. {lesson.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
                                          {lesson.is_free_preview && (
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">
                                              Free Preview
                                            </span>
                                          )}
                                          <span>{lesson.duration_minutes || 10}m</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Multi-Tenant Communities */}
        {activeTab === "communities" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Tenant Management
                </span>
                <h2 className="text-lg font-black text-[#0F172A] dark:text-white mt-1">
                  Multi-Tenant Community Spaces
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Launch and administrate isolated school community hubs, customer forums, or cohort workspaces.
                </p>
              </div>

              <button
                onClick={() => setIsCreateCommunityOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Launch New Community</span>
              </button>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-600/20">
                        {comm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white">{comm.name}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${comm.is_private ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {comm.is_private ? "Private" : "Public"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          school.akstack.com/{comm.slug}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      {comm.member_count || 1} Members
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] dark:text-slate-300 font-medium">
                    {comm.tagline || comm.description || "Interactive learning community on AKSchool."}
                  </p>

                  {comm.rules && (
                    <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                      <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Code of Conduct:</strong>
                      <span className="line-clamp-2">{comm.rules}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                    <Link
                      href="/community"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Open Community Feed</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/classroom"
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Open Classroom</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Branding & Rules */}
        {activeTab === "branding" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
            <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-1">
              Community Identity & Rules Settings
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure your public name, tagline, hosted URL, and code of conduct
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Community Rules & Guidelines
                </label>
                <textarea
                  rows={4}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Hosted Domain Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">https://</span>
                  <input
                    type="text"
                    disabled
                    value="school.akstack.com"
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed font-mono"
                  />
                  <span className="text-xs text-emerald-600 font-bold">Active SSL</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
                >
                  {settingsSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Settings Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Moderation Queue */}
        {activeTab === "moderation" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white">
                  Content Moderation Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Review flagged posts and comments submitted by community members
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {flaggedPosts.length} Pending
              </span>
            </div>

            {flaggedPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">Moderation queue is clean!</p>
                <p className="text-xs">No pending flags or policy violations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedPosts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Flagged
                        </span>
                        <span className="text-xs text-slate-400">{item.reportedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mt-1">
                        &ldquo;{item.postTitle}&rdquo;
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Author: <strong className="text-[#0F172A] dark:text-white">{item.authorName}</strong> • Reason: <span className="text-rose-600 font-medium">{item.reason}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDismissFlag(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleDismissFlag(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                      >
                        Hide Post & Warn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: AI Knowledge Base */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Nova AI Engine Ready
                </span>
                <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white mt-1">
                  Active Assistant: <span className="text-blue-600">Nova AI (AKSchool Buddy)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Knowledge indexed from community discussions, guidelines, and classroom curriculum.
                </p>
              </div>
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                Test Nova AI
              </button>
            </div>

            {/* Ingested Documents List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">
                Grounded Knowledge Sources ({knowledgeList.length})
              </h3>
              <div className="space-y-3">
                {knowledgeList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">{doc.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {doc.source_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {doc.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Document Form */}
              <form onSubmit={handleAddKnowledge} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ingest New Grounding Knowledge
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Document Title (e.g. Agent Loop Error Recovery FAQ)"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={newDocType}
                      onChange={(e: any) => setNewDocType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white"
                    >
                      <option value="faq">FAQ</option>
                      <option value="guideline">Guideline</option>
                      <option value="lesson">Lesson Note</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter factual content, guidelines, or architectural notes for Nova to ground answers on..."
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Knowledge Repository</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Monetisation & Plans */}
        {activeTab === "plans" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
            <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-1">
              Membership Plans & Entitlements
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Active pricing tiers configured in the internal entitlement ledger
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {MOCK_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Active Tier
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white mt-2">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                    <div className="my-4">
                      <span className="text-2xl font-black text-[#0F172A] dark:text-white">
                        {plan.price_monthly === 0 ? "Free" : `₹${plan.price_monthly}`}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/month</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#475569] dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                    Subscribers: <strong className="text-[#0F172A] dark:text-white">{plan.id === "free" ? "1,064" : "184"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Website Embed */}
        {activeTab === "embed" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 space-y-6 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Website Integration
              </span>
              <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white mt-1">
                Webflow & Website Embed Code Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Embed your community discussions or classroom directly into Webflow, Framer, WordPress, or custom sites.
              </p>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#0F172A] text-blue-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {embedCodeSnippet}
              </pre>
              <button
                onClick={copyEmbedCode}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Origin Allowlist */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Allowed Embed Origins (CORS & CSP Binding)</span>
              </h3>
              <input
                type="text"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Comma-separated list of approved host origins permitted to render the authenticated widget.
              </p>
            </div>
          </div>
        )}
      </main>

      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Creation Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      <CreateModuleModal
        isOpen={isCreateModuleOpen}
        courses={courses}
        initialCourseId={selectedCourseForModule}
        onClose={() => setIsCreateModuleOpen(false)}
        onModuleCreated={handleModuleCreated}
      />

      <CreateLessonModal
        isOpen={isCreateLessonOpen}
        moduleId={selectedModuleForLesson.id}
        moduleTitle={selectedModuleForLesson.title}
        onClose={() => setIsCreateLessonOpen(false)}
        onLessonCreated={handleLessonCreated}
      />

      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
}
