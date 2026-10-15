"use client";

import { useState } from "react";
import { X, BookOpen, Layers, Video, Globe, Plus, Check, Sparkles } from "lucide-react";
import { Course, CourseModule, CourseLesson, Community } from "@/lib/types";

// ==========================================
// 1. Create Course Modal
// ==========================================
interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export function CreateCourseModal({ isOpen, onClose, onCourseCreated }: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
  const [requiredTier, setRequiredTier] = useState<"free" | "pro" | "vip">("free");
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/v1/courses", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          slug,
          description,
          cover_url: coverUrl,
          required_tier: requiredTier,
          is_locked: isLocked,
        }),
      });

      const data = await res.json();
      if (data.course) {
        onCourseCreated(data.course);
        onClose();
        return;
      }
    } catch (err) {
      console.warn("Failed to save course on server, applying local fallback:", err);
    }

    // Fallback
    const localCourse: Course = {
      id: `course_${Date.now()}`,
      community_id: "comm_akschool_001",
      title,
      slug,
      description,
      cover_url: coverUrl,
      is_locked: isLocked,
      required_tier: requiredTier,
      total_lessons: 0,
      sort_order: 10,
      modules: [],
    };
    onCourseCreated(localCourse);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">Create New Course</h3>
              <p className="text-[11px] text-slate-400">Add a structured curriculum track to your academy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Autonomous AI Agents from Scratch"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Course URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="autonomous-ai-agents"
              className="w-full font-mono text-[11px] bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-3 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Access Tier</label>
              <select
                value={requiredTier}
                onChange={(e) => setRequiredTier(e.target.value as any)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white font-medium capitalize"
              >
                <option value="free">Free (All Members)</option>
                <option value="pro">Pro ($49/mo)</option>
                <option value="vip">VIP Executive ($149/mo)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. Create Module Modal
// ==========================================
interface CreateModuleModalProps {
  isOpen: boolean;
  courses: Course[];
  initialCourseId?: string;
  onClose: () => void;
  onModuleCreated: (courseId: string, module: CourseModule) => void;
}

export function CreateModuleModal({
  isOpen,
  courses,
  initialCourseId,
  onClose,
  onModuleCreated,
}: CreateModuleModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCourseId) return;

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/v1/courses/modules", {
        method: "POST",
        headers,
        body: JSON.stringify({
          course_id: selectedCourseId,
          title: title.trim(),
          sort_order: 1,
        }),
      });

      const data = await res.json();
      if (data.module) {
        onModuleCreated(selectedCourseId, data.module);
        onClose();
        return;
      }
    } catch (err) {
      console.warn("Server module insert exception:", err);
    }

    // Fallback
    const localMod: CourseModule = {
      id: `mod_${Date.now()}`,
      course_id: selectedCourseId,
      title: title.trim(),
      sort_order: 1,
      lessons: [],
    };
    onModuleCreated(selectedCourseId, localMod);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">Add Curriculum Module</h3>
              <p className="text-[11px] text-slate-400">Group lessons into a coherent learning chapter</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Target Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-medium"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Module Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Module 3: Multi-Agent Collaboration & Orchestration"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. Create Lesson Modal
// ==========================================
interface CreateLessonModalProps {
  isOpen: boolean;
  moduleId: string;
  moduleTitle?: string;
  onClose: () => void;
  onLessonCreated: (moduleId: string, lesson: CourseLesson) => void;
}

export function CreateLessonModal({
  isOpen,
  moduleId,
  moduleTitle,
  onClose,
  onLessonCreated,
}: CreateLessonModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [duration, setDuration] = useState(15);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [content, setContent] = useState(`### Lecture Overview

In this lesson, we cover practical blueprints and live implementations:

1. Architecture and design principles
2. Step-by-step code walkthrough
3. Deployment and testing instructions
`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !moduleId) return;

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/v1/courses/lessons", {
        method: "POST",
        headers,
        body: JSON.stringify({
          module_id: moduleId,
          title: title.trim(),
          slug,
          content,
          video_url: videoUrl,
          duration_minutes: duration,
          is_free_preview: isFreePreview,
        }),
      });

      const data = await res.json();
      if (data.lesson) {
        onLessonCreated(moduleId, data.lesson);
        onClose();
        return;
      }
    } catch (err) {
      console.warn("Server lesson insert exception:", err);
    }

    // Fallback
    const localLesson: CourseLesson = {
      id: `les_${Date.now()}`,
      module_id: moduleId,
      title: title.trim(),
      slug,
      content,
      video_url: videoUrl,
      duration_minutes: duration,
      is_free_preview: isFreePreview,
      sort_order: 1,
    };
    onLessonCreated(moduleId, localLesson);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">Publish New Lesson</h3>
              <p className="text-[11px] text-slate-400">
                Adding to: <span className="text-emerald-600 font-semibold">{moduleTitle || "Module"}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Lesson 2.3: Tool Error Self-Correction Loops"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Video Embed URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Estimated Duration (mins)</label>
              <input
                type="number"
                min="1"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="freePreview"
              checked={isFreePreview}
              onChange={(e) => setIsFreePreview(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="freePreview" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Free Preview Lesson (Unauthenticated visitors can sample this lecture)
            </label>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
              Lesson Study Material & Code (Markdown Supported)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed notes, code blocks, checklists..."
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Lesson</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. Create Community Modal
// ==========================================
interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommunityCreated: (community: Community) => void;
}

export function CreateCommunityModal({ isOpen, onClose, onCommunityCreated }: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/v1/communities", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          slug,
          tagline,
          description,
          is_private: isPrivate,
        }),
      });

      const data = await res.json();
      if (data.community) {
        onCommunityCreated(data.community);
        onClose();
        return;
      }
    } catch (err) {
      console.warn("Server community insert exception:", err);
    }

    // Fallback
    const localComm: Community = {
      id: `comm_${Date.now()}`,
      name: name.trim(),
      slug,
      tagline,
      description,
      is_private: isPrivate,
      member_count: 1,
    };
    onCommunityCreated(localComm);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A] dark:text-white">Launch New Community</h3>
              <p className="text-[11px] text-slate-400">Create a dedicated multi-tenant community space</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Community Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Next.js SaaS Architecture Masters"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Community Subdomain / URL Slug</label>
            <div className="flex items-center bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono text-[11px]">
              <span>school.akstack.com/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="saas-architecture"
                className="flex-1 bg-transparent text-[#0F172A] dark:text-white focus:outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. The premier hub for high-scale enterprise software builders"
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">About & Purpose</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe who this community is for and what activities take place..."
              className="w-full bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-3 text-[#0F172A] dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="commPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="commPrivate" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Private Community (Requires admin invitation or paid approval to enter)
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Community</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
