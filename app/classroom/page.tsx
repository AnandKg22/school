"use client";

import { useState } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
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
  Share2
} from "lucide-react";
import { MOCK_COURSES } from "@/lib/school-mock";
import { CourseLesson, CourseModule } from "@/lib/types";

export default function ClassroomPage() {
  const [activeCourse, setActiveCourse] = useState(MOCK_COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<CourseLesson>(
    MOCK_COURSES[0].modules![0].lessons[0]
  );
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    les_01: true,
  });

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const totalLessonsCount =
    activeCourse.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPct =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Course Banner Strip */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Active Masterclass
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {activeCourse.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {completedCount} of {totalLessonsCount} Completed ({progressPct}%)
              </div>
              <div className="w-36 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video & Curriculum Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column: Video Player & Lecture Notes */}
          <div className="lg:col-span-8 space-y-6">
            {/* 16:9 Video Player */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <div className="relative aspect-video bg-black">
                {activeLesson.video_url ? (
                  <iframe
                    src={activeLesson.video_url}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    Video lecture is being rendered
                  </div>
                )}
              </div>

              {/* Lesson Action Bar */}
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeLesson.duration_minutes} minutes</span>
                    <span>•</span>
                    <span className="text-amber-500 font-medium">Free Preview Lecture</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeLesson.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonCompletion(activeLesson.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      completedLessons[activeLesson.id]
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-orange-500/20"
                    }`}
                  >
                    {completedLessons[activeLesson.id] ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
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
            </div>

            {/* Lecture Notes & Markdown Content */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lecture Study Guide & References
                </span>
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI about this lesson</span>
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeLesson.content}
              </div>

              {/* Resource Download blueprint */}
              <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Lesson Code Blueprint & Dockerfile
                    </div>
                    <div className="text-[10px] text-slate-400">
                      production-agent-loop.ts • 14.2 KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert("Downloading lesson code blueprint...")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Curriculum Accordion & Locked Courses */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Course Syllabus */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
                Course Syllabus
              </h3>

              <div className="space-y-4">
                {activeCourse.modules?.map((mod) => (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white px-2 py-1">
                      {mod.title}
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
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300"
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

            {/* Pro Course Teaser */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-transparent to-amber-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  Pro Tier Masterclass
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                {MOCK_COURSES[1].title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Unlock 6 advanced modules on self-hosted PostgreSQL Swarm, Traefik SSL termination, and automated deployment pipelines.
              </p>
              <Link
                href="/#pricing"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 block hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Upgrade to Pro (₹999/mo)
              </Link>
            </div>
          </div>
        </div>
      </main>

      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
