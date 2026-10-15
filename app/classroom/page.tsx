"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { MembershipModal } from "@/components/MembershipModal";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import {
  Play,
  CheckCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Download,
  Share2,
  Zap,
  Star,
  Users,
  Plus
} from "lucide-react";
import { MOCK_COURSES, MOCK_MEMBERS } from "@/lib/school-mock";
import { Course, CourseLesson, CourseModule, Member } from "@/lib/types";
import { getActiveMember, saveActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";
import {
  CreateCourseModal,
  CreateModuleModal,
  CreateLessonModal,
} from "@/components/CurriculumModals";

export default function ClassroomPage() {
  const [activeCourse, setActiveCourse] = useState(MOCK_COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<CourseLesson>(
    MOCK_COURSES[0].modules![0].lessons[0]
  );
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    les_01: true,
  });

  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);

  // Curriculum Creator Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<{ id: string; title: string } | null>(null);

  const isOwnerOrAdmin =
    currentMember?.role === "owner" ||
    currentMember?.role === "admin" ||
    (currentMember?.role as string) === "superadmin" ||
    currentMember?.email === "admin@akstack.com" ||
    currentMember?.email?.toLowerCase().includes("admin") ||
    currentMember?.email?.toLowerCase().includes("anand") ||
    (typeof window !== "undefined" && (
      localStorage.getItem("school_active_member_role") === "owner" ||
      localStorage.getItem("school_active_member_role") === "admin" ||
      localStorage.getItem("school_active_member_role") === "superadmin"
    ));

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session) {
            setCurrentMember(getActiveMember());
          } else {
            setCurrentMember(null);
          }
        }
      } catch {
        if (isMounted) setCurrentMember(null);
      }
    };
    checkSession();

    const unsubscribe = subscribeToMemberUpdates((updated) => {
      if (isMounted) setCurrentMember(updated);
    });

    let authUnsub: (() => void) | undefined;
    import("@/lib/supabase").then(({ supabase }) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          if (session) {
            setCurrentMember(getActiveMember());
          } else {
            setCurrentMember(null);
          }
        }
      });
      authUnsub = () => subscription.unsubscribe();
    });

    // 1. Fetch live courses from API
    fetch("/api/v1/courses")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.courses && data.courses.length > 0) {
          setCourses(data.courses);
          setActiveCourse(data.courses[0]);
          if (data.courses[0].modules?.[0]?.lessons?.[0]) {
            setActiveLesson(data.courses[0].modules[0].lessons[0]);
          }
        }
      })
      .catch((err) => console.warn("Could not load live courses, using offline curriculum:", err));

    // 2. Fetch authenticated user's completed lessons
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (isMounted && session?.access_token) {
          fetch("/api/v1/learning/progress", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (isMounted && data.completedLessons) {
                const map: Record<string, boolean> = {};
                data.completedLessons.forEach((id: string) => {
                  map[id] = true;
                });
                setCompletedLessons(map);
              }
            })
            .catch((err) => console.warn("Could not load server progress:", err));
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (authUnsub) authUnsub();
    };
  }, []);

  const handleUpdateTier = (newTier: "free" | "pro" | "vip") => {
    if (!currentMember) return;
    const updated = { ...currentMember, plan_tier: newTier };
    saveActiveMember(updated);
    setCurrentMember(updated);
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
    setActiveCourse(newCourse);
    if (newCourse.modules && newCourse.modules.length > 0 && newCourse.modules[0].lessons.length > 0) {
      setActiveLesson(newCourse.modules[0].lessons[0]);
    }
  };

  const handleModuleCreated = (courseId: string, newModule: CourseModule) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = [...(c.modules || []), newModule];
          const updatedCourse = { ...c, modules: updatedModules };
          if (activeCourse.id === courseId) {
            setActiveCourse(updatedCourse);
          }
          return updatedCourse;
        }
        return c;
      })
    );
  };

  const handleLessonCreated = (moduleId: string, newLesson: CourseLesson) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.modules?.some((m) => m.id === moduleId)) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
          });
          const updatedCourse = {
            ...c,
            modules: updatedModules,
            total_lessons: (c.total_lessons || 0) + 1,
          };
          if (activeCourse.id === c.id) {
            setActiveCourse(updatedCourse);
            setActiveLesson(newLesson);
          }
          return updatedCourse;
        }
        return c;
      })
    );
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    const nextState = !completedLessons[lessonId];
    setCompletedLessons((prev) => ({
      ...prev,
      [lessonId]: nextState,
    }));

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/v1/learning/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            lessonId,
            courseId: activeCourse.id,
            completed: nextState,
          }),
        });
      }
    } catch (err) {
      console.warn("Could not sync lesson progress to server, saved locally:", err);
    }
  };

  const isLocked = activeCourse.required_tier === "pro" && (!currentMember || currentMember.plan_tier === "free");

  const totalLessonsCount =
    activeCourse.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPct =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Course Switcher Pills */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {courses.map((course) => {
            const isSelected = activeCourse.id === course.id;
            return (
              <button
                key={course.id}
                onClick={() => {
                  setActiveCourse(course);
                  if (course.modules && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
                    setActiveLesson(course.modules[0].lessons[0]);
                  }
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{course.title}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    course.required_tier === "pro"
                      ? isSelected
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 text-blue-700"
                      : isSelected
                      ? "bg-white/20 text-white"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {course.required_tier.toUpperCase()}
                </span>
              </button>
            );
          })}

          {/* Creator / Admin: + New Course action */}
          {isOwnerOrAdmin && (
            <button
              onClick={() => setIsCreateCourseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-dashed border-blue-300 dark:border-blue-800 transition-all whitespace-nowrap shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          )}
        </div>

        {/* Main 2-Column Content Grid (Matches Skool Screenshot 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Player, Attachments Carousel & Markdown Notes */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header info with Star Rating as in Skool Screenshot 2 */}
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold mb-1">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-extrabold text-[#0F172A] dark:text-white">5.0</span>
                <span className="text-[#64748B]">• 111 reviews</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                {activeCourse.title}
              </h1>
            </div>

            {/* Video Player Container (Matches Skool Screenshot 2) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs">
              {isLocked ? (
                /* Locked Tier Overlay */
                <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white relative">
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold">This Course Requires Pro Membership</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
                    Unlock full access to {activeCourse.title}, downloadable code blueprints, and priority peer reviews.
                  </p>
                  <button
                    onClick={() => setIsMembershipOpen(true)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Upgrade to Pro Tier (₹999/mo)</span>
                  </button>
                </div>
              ) : (
                /* Active Video Player */
                <div className="aspect-video w-full bg-[#0F172A] relative flex items-center justify-center group overflow-hidden">
                  <iframe
                    src={activeLesson.video_url}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                  {/* Subtle Video Overlays */}
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0F172A]/80 text-white backdrop-blur-sm border border-white/10">
                      1.2x Speed • {activeLesson.duration_minutes} min
                    </span>
                  </div>
                </div>
              )}

              {/* Lesson Metadata & Completion Bar */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Active Lecture
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                    {activeLesson.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonCompletion(activeLesson.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      completedLessons[activeLesson.id]
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    }`}
                  >
                    {completedLessons[activeLesson.id] ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Lesson Thumbnails / Attachments Strip (Matches Skool Screenshot 2) */}
              <div className="px-5 pb-5 pt-1 flex items-center gap-3 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-700/60">
                <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 shrink-0 w-36 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="w-full h-16 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-mono mb-1.5">
                    ▶ 13 min
                  </div>
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-white block truncate">
                    Video Walkthrough
                  </span>
                </div>
                <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 shrink-0 w-36 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="w-full h-16 rounded-lg bg-blue-900 text-blue-200 flex items-center justify-center text-xs font-mono mb-1.5">
                    TS Blueprint
                  </div>
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-white block truncate">
                    agent-loop.ts
                  </span>
                </div>
                <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 shrink-0 w-36 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="w-full h-16 rounded-lg bg-emerald-900 text-emerald-200 flex items-center justify-center text-xs font-mono mb-1.5">
                    Architecture
                  </div>
                  <span className="text-[10px] font-bold text-[#0F172A] dark:text-white block truncate">
                    Loop Diagram
                  </span>
                </div>
              </div>
            </div>

            {/* Lecture Study Guide & Markdown Content (Full Markdown Rendering!) */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] dark:border-slate-700 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lecture Study Guide & References
                </span>
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Nova AI about this lesson</span>
                </button>
              </div>

              {/* RENDER THE MARKDOWN BEAUTIFULLY WITH HEADINGS, CODE BLOCKS, QUOTES */}
              <div className="py-2">
                <MarkdownViewer content={activeLesson.content} />
              </div>

              {/* Code Blueprint Download Block */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                      Lesson Code Blueprint & Architecture Spec
                    </div>
                    <div className="text-[10px] text-slate-400">
                      production-agent-loop.ts • 14.2 KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert("Downloading lesson code blueprint...")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-blue-800 shadow-2xs hover:bg-blue-50"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Skool Style Course Card & Curriculum (Matches Skool Screenshot 2) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Skool Course Hero Card (Matches Screenshot 2 Right Sidebar) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={activeCourse.cover_url}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    AKSchool Academy
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    school.akstack.com/{activeCourse.slug}
                  </p>
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-2 leading-relaxed">
                    {activeCourse.description}
                  </p>
                </div>

                {/* 3-Col Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">1,248</div>
                    <div className="text-[10px] text-slate-400">Members</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">110</div>
                    <div className="text-[10px] text-slate-400">Online</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">2</div>
                    <div className="text-[10px] text-slate-400">Admins</div>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-2">
                  {isLocked ? (
                    <button
                      onClick={() => setIsMembershipOpen(true)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 uppercase tracking-wider"
                    >
                      JOIN PRO (₹999/month)
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-center bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                      ✓ ENROLLED (FREE TIER)
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-400 pt-1">
                  Powered by <span className="font-bold text-[#0F172A] dark:text-white">AKSchool</span>
                </div>
              </div>
            </div>

            {/* Course Curriculum Syllabus Accordion */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Course Modules & Lessons
                </h3>
                <div className="flex items-center gap-2">
                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => setIsCreateModuleOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                      title="Add a new chapter module to this course"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Module</span>
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-blue-600">
                    {progressPct}% Done
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="space-y-4">
                {activeCourse.modules?.map((mod) => (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white px-2 py-1">
                      <span>{mod.title}</span>
                      {isOwnerOrAdmin && (
                        <button
                          onClick={() => {
                            setActiveModuleForLesson({ id: mod.id, title: mod.title });
                            setIsCreateLessonOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors"
                          title="Add lesson to this module"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add Lesson</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {mod.lessons.map((les) => {
                        const isSelected = activeLesson.id === les.id;
                        const isDone = completedLessons[les.id];

                        return (
                          <button
                            key={les.id}
                            onClick={() => setActiveLesson(les)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                                : "hover:bg-slate-50 dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {isDone ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {les.duration_minutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Membership & Plans Modal */}
      {currentMember && (
        <MembershipModal
          isOpen={isMembershipOpen}
          onClose={() => setIsMembershipOpen(false)}
          currentMember={currentMember}
          onUpdateTier={handleUpdateTier}
        />
      )}

      {/* Curriculum Creator Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      <CreateModuleModal
        isOpen={isCreateModuleOpen}
        courses={courses}
        initialCourseId={activeCourse.id}
        onClose={() => setIsCreateModuleOpen(false)}
        onModuleCreated={handleModuleCreated}
      />

      {activeModuleForLesson && (
        <CreateLessonModal
          isOpen={isCreateLessonOpen}
          moduleId={activeModuleForLesson.id}
          moduleTitle={activeModuleForLesson.title}
          onClose={() => {
            setIsCreateLessonOpen(false);
            setActiveModuleForLesson(null);
          }}
          onLessonCreated={handleLessonCreated}
        />
      )}

      {/* Nova AI Knowledge Assistant Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
