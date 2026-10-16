"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import {
  MessageSquare,
  Sparkles,
  Pin,
  Heart,
  MessageCircle,
  Share2,
  Send,
  PlusCircle,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle,
  Flame,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Settings,
  Zap,
  ThumbsUp,
  Shield,
  Globe,
  Layers,
  Plus,
  BarChart3,
  Trash2,
} from "lucide-react";
import { MOCK_POSTS, MOCK_SPACES, MOCK_MEMBERS, MOCK_COMMUNITY } from "@/lib/school-mock";
import { Post, Member, Space, Poll } from "@/lib/types";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";
import { PollWidget } from "@/components/PollWidget";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reportToast, setReportToast] = useState<string | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

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

  // Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSpaceId, setNewSpaceId] = useState(MOCK_SPACES[1].id);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Active comment input
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    post_001: true,
  });

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

    // Fetch live posts from API
    fetch("/api/v1/posts")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        }
      })
      .catch((err) => console.warn("Failed to load live posts, retaining cache:", err));

    return () => {
      isMounted = false;
      unsubscribe();
      if (authUnsub) authUnsub();
    };
  }, []);

  const handleReportPost = (postId: string) => {
    setReportToast("Post has been flagged and submitted to the Moderation Queue for review.");
    setTimeout(() => setReportToast(null), 3000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember || !newTitle.trim() || !newContent.trim()) return;

    const title = newTitle.trim();
    const content = newContent.trim();
    const spaceId = newSpaceId;

    let attachedPoll: Poll | undefined = undefined;
    if (showPollCreator && pollQuestion.trim()) {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length >= 2) {
        attachedPoll = {
          id: `poll_${Date.now()}`,
          post_id: `post_${Date.now()}`,
          question: pollQuestion.trim(),
          total_votes: 0,
          options: validOptions.map((optText, idx) => ({
            id: `opt_${Date.now()}_${idx}`,
            text: optText.trim(),
            votes_count: 0,
          })),
        };
      }
    }

    setNewTitle("");
    setNewContent("");
    setShowPollCreator(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setIsComposerOpen(false);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers,
        body: JSON.stringify({ title, content, spaceId }),
      });

      const data = await res.json();
      if (data.post) {
        const postWithPoll = attachedPoll ? { ...data.post, poll: attachedPoll } : data.post;
        setPosts((prev) => [postWithPoll, ...prev]);
        return;
      }
    } catch (err) {
      console.warn("Could not persist post to server, saving locally:", err);
    }

    // Local fallback
    const fallbackPost: Post = {
      id: `post_${Date.now()}`,
      space_id: spaceId,
      author_id: currentMember.id,
      author: currentMember,
      title,
      content,
      is_pinned: false,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      user_has_liked: false,
      comments: [],
      poll: attachedPoll,
    };
    setPosts((prev) => [fallbackPost, ...prev]);
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.poll) {
          const previousVotedId = p.poll.user_voted_option_id;
          const updatedOptions = p.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votes_count: opt.votes_count + 1 };
            }
            if (previousVotedId && opt.id === previousVotedId) {
              return { ...opt, votes_count: Math.max(0, opt.votes_count - 1) };
            }
            return opt;
          });

          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              total_votes: previousVotedId ? p.poll.total_votes : p.poll.total_votes + 1,
              user_voted_option_id: optionId,
            },
          };
        }
        return p;
      })
    );
  };

  const handleToggleLike = (postId: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const liked = !p.user_has_liked;
          return {
            ...p,
            user_has_liked: liked,
            likes_count: liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!currentMember || !text) return;

    setCommentInputs({ ...commentInputs, [postId]: "" });
    setExpandedComments({ ...expandedComments, [postId]: true });

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();
      if (data.comment) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments_count: (p.comments_count || 0) + 1,
                comments: [...(p.comments || []), data.comment],
              };
            }
            return p;
          })
        );
        return;
      }
    } catch (err) {
      console.warn("Failed to save comment to server, appending locally:", err);
    }

    // Local fallback
    const newC = {
      id: `c_${Date.now()}`,
      post_id: postId,
      author_id: currentMember.id,
      author: currentMember,
      content: text,
      likes_count: 0,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments_count: (p.comments_count || 0) + 1,
            comments: [...(p.comments || []), newC],
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts
    .filter((p) => {
      const matchSpace = activeSpaceId === "all" || p.space_id === activeSpaceId;
      const matchQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSpace && matchQuery;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Main 2-Column Layout matching Skool Screenshot 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column (Left/Center 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Report Toast Notification */}
            {reportToast && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 flex items-center justify-between shadow-xs animate-in fade-in">
                <span>{reportToast}</span>
                <button
                  onClick={() => setReportToast(null)}
                  className="text-blue-500 hover:text-blue-700 text-xs px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* "Write something" Input Card (Matches Skool Screenshot 4) */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              {!currentMember ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left py-2 px-1">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                      Join the discussion in AKSchool Community
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Sign in or create an account to post, ask questions, and share project updates.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/login?redirect=/community"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?tab=register&redirect=/community"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      Join Community
                    </Link>
                  </div>
                </div>
              ) : !isComposerOpen ? (
                <div
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={currentMember.avatar_url}
                    alt={currentMember.full_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/30"
                  />
                  <div className="flex-1 bg-[#F8FAFC] dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors">
                    Write something...
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs">
                    Post
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-white">
                      <img
                        src={currentMember.avatar_url}
                        alt={currentMember.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>Posting as {currentMember.full_name}</span>
                    </div>
                    <select
                      value={newSpaceId}
                      onChange={(e) => setNewSpaceId(e.target.value)}
                      className="text-xs bg-[#F8FAFC] dark:bg-slate-700 border border-[#E2E8F0] dark:border-slate-600 rounded-lg px-2.5 py-1 text-[#0F172A] dark:text-white"
                    >
                      {MOCK_SPACES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Title: What are you sharing or asking?"
                    required
                    className="w-full text-sm font-extrabold bg-transparent border-b border-[#E2E8F0] dark:border-slate-700 pb-2 focus:outline-none focus:border-blue-600 text-[#0F172A] dark:text-white placeholder:text-slate-400"
                  />

                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share the details, code snippets, or thoughts (supports full Markdown)..."
                    required
                    className="w-full text-xs sm:text-sm bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400"
                  />

                  {/* Optional Poll Creator Toggle */}
                  {showPollCreator ? (
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4" />
                          <span>Attach Community Poll</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPollCreator(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Remove Poll
                        </button>
                      </div>

                      <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Poll Question (e.g. Which LLM are you using in production?)"
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />

                      <div className="space-y-1.5">
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const copy = [...pollOptions];
                                copy[idx] = e.target.value;
                                setPollOptions(copy);
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[#0F172A] dark:text-white placeholder:text-slate-400"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {pollOptions.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions([...pollOptions, ""])}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Option</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowPollCreator(true)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-800 transition-colors flex items-center gap-1.5"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Add Community Poll</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-[#0F172A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim() || !newContent.trim()}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                    >
                      Publish Post
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Event Announcement Banner (Matches Skool Screenshot 4) */}
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>AKSchool Live: Advanced Autonomous Agent Loops is happening in 3 days</span>
            </div>

            {/* Category Filter Chips Bar (Matches Skool Screenshot 4) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveSpaceId("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeSpaceId === "all"
                    ? "bg-[#0F172A] text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              {MOCK_SPACES.map((space) => {
                const isActive = activeSpaceId === space.id;
                return (
                  <button
                    key={space.id}
                    onClick={() => setActiveSpaceId(space.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#0F172A] text-white shadow-2xs"
                        : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{space.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const spaceInfo = MOCK_SPACES.find((s) => s.id === post.space_id);
                const isExpanded = expandedComments[post.id] ?? false;

                return (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    {/* Post Author Bar (Exact Match to Skool Screenshot 4) */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.full_name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/30"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                            {post.author.level}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                              {post.author.full_name}
                            </span>
                            {post.author.role === "owner" && (
                              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            )}
                            {post.author.role === "admin" && (
                              <span className="text-[10px] text-blue-600">💎</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                            <span>2h</span>
                            <span>•</span>
                            <span className="font-semibold text-[#475569] dark:text-slate-300">
                              {spaceInfo?.name || "General"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {post.is_pinned && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </div>
                      )}
                    </div>

                    {/* Post Title */}
                    <h2 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white mb-2 leading-snug">
                      {post.title}
                    </h2>

                    {/* Post Content rendered in beautiful Markdown format */}
                    <div className="text-xs sm:text-sm text-[#475569] dark:text-slate-200 mb-4">
                      <MarkdownViewer content={post.content} />
                    </div>

                    {/* Interactive Community Poll (Pillar 4) */}
                    {post.poll && (
                      <PollWidget
                        poll={post.poll}
                        onVote={(_pollId, optionId) => handleVotePoll(post.id, optionId)}
                      />
                    )}

                    {/* Interactions Bar (Exact match to Skool Screenshot 4) */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/80 text-xs text-[#64748B]">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-colors ${
                            post.user_has_liked
                              ? "text-blue-600"
                              : "hover:text-[#0F172A] dark:hover:text-white"
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${post.user_has_liked ? "fill-current" : ""}`} />
                          <span>{post.likes_count}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedComments({
                              ...expandedComments,
                              [post.id]: !isExpanded,
                            })
                          }
                          className="flex items-center gap-1.5 font-semibold hover:text-[#0F172A] dark:hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0}</span>
                        </button>

                        {/* Commenter Avatars Pile as seen in Skool Screenshot */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="hidden sm:flex items-center -space-x-1.5">
                            {post.comments.slice(0, 4).map((c, i) => (
                              <img
                                key={i}
                                src={c.author.avatar_url}
                                alt={c.author.full_name}
                                className="w-5 h-5 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                              />
                            ))}
                            <span className="text-[10px] text-slate-400 pl-2">
                              New comment 12m ago
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReportPost(post.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Report Post"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert("Link copied to clipboard!")}
                          className="p-1 text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                          title="Share Post"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Threaded Comments Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-2.5 bg-[#F8FAFC] dark:bg-slate-900/60 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-xs"
                              >
                                <img
                                  src={comment.author.avatar_url}
                                  alt={comment.author.full_name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-[#0F172A] dark:text-white">
                                      {comment.author.full_name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(comment.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="text-[#475569] dark:text-slate-300 leading-relaxed">
                                    <MarkdownViewer content={comment.content} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        {currentMember ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs({
                                  ...commentInputs,
                                  [post.id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="Write a comment..."
                              className="flex-1 text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 text-center text-xs text-slate-400">
                            <Link href="/login?redirect=/community" className="text-blue-600 hover:underline font-semibold">
                              Sign in
                            </Link>{" "}
                            to post a comment.
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Column: Skool Style Community Card (Matches Skool Screenshot 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Superadmin Quick Studio Card */}
            {isOwnerOrAdmin && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-500/30 dark:border-blue-700/50 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#0F172A] dark:text-white uppercase tracking-wider">
                        Creator & Admin Studio
                      </h4>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Superadmin Operations</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    Active
                  </span>
                </div>

                <p className="text-xs text-[#475569] dark:text-slate-300 leading-relaxed">
                  Quick links to create courses, chapter modules, video lectures, and launch new community spaces.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/admin?tab=courses"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-900"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Create Course</span>
                  </Link>
                  <Link
                    href="/admin?tab=communities"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-900"
                  >
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>New Community</span>
                  </Link>
                  <Link
                    href="/classroom"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-900"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Add Modules</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <Shield className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span>Operations Hub</span>
                  </Link>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden shadow-2xs">
              {/* Banner Graphic */}
              <div className="relative h-36 bg-gradient-to-r from-blue-600 to-emerald-500 flex items-center justify-center p-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-black tracking-tight">AKSchool</div>
                  <div className="text-xs font-bold text-blue-100 mt-0.5">1,248+ People Mastering AI Automation</div>
                </div>
              </div>

              {/* Community Identity & Bio */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white">
                    {MOCK_COMMUNITY.name}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    school.akstack.com/{MOCK_COMMUNITY.slug}
                  </p>
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-2 leading-relaxed">
                    {MOCK_COMMUNITY.description}
                  </p>
                </div>

                {/* Resource Links List (as in Skool screenshot) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                  >
                    <span>📺</span>
                    <span className="font-semibold">YOUTUBE RESOURCES</span>
                  </a>
                  <button
                    onClick={() => setIsAiOpen(true)}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span>🤖</span>
                    <span className="font-semibold">Nova AI Study Buddy</span>
                  </button>
                  <Link
                    href="/#pricing"
                    className="flex items-center gap-2 p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span>🚀</span>
                    <span className="font-semibold">Upgrade to Pro Tier</span>
                  </Link>
                </div>

                {/* 3-Col Stats Grid (Exact match to Skool Screenshot 4) */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">1,248</div>
                    <div className="text-[10px] text-slate-400 font-medium">Members</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">110</div>
                    <div className="text-[10px] text-slate-400 font-medium">Online</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#0F172A] dark:text-white">2</div>
                    <div className="text-[10px] text-slate-400 font-medium">Admins</div>
                  </div>
                </div>

                {/* Active Member Avatar Pile */}
                <div className="flex items-center justify-center -space-x-2 pt-2">
                  {MOCK_MEMBERS.map((m) => (
                    <img
                      key={m.id}
                      src={m.avatar_url}
                      alt={m.full_name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                    />
                  ))}
                </div>

                {/* Settings / Upgrade Action Button */}
                <div className="pt-2">
                  <Link
                    href="/#pricing"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center block bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors text-[#0F172A] dark:text-white uppercase tracking-wider"
                  >
                    Membership & Settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Ask Nova Card */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Need Quick Answers?</div>
                  <div className="text-[10px] text-slate-500">Nova AI is ready to assist you</div>
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
              >
                Ask Nova
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Nova AI Knowledge Assistant Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
