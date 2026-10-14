"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
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
  Filter
} from "lucide-react";
import { MOCK_POSTS, MOCK_SPACES, MOCK_MEMBERS, MOCK_COURSES } from "@/lib/school-mock";
import { Post, Member, Space } from "@/lib/types";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [reportToast, setReportToast] = useState<string | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member>(MOCK_MEMBERS[0]);

  // Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSpaceId, setNewSpaceId] = useState(MOCK_SPACES[1].id);

  // Active comment input
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    post_001: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("school_active_member_id");
    if (saved) {
      const found = MOCK_MEMBERS.find((m) => m.id === saved);
      if (found) setCurrentMember(found);
    }
  }, []);

  const handleReportPost = (postId: string) => {
    setReportToast("Post has been flagged and submitted to the Moderation Queue for review.");
    setTimeout(() => setReportToast(null), 3000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      space_id: newSpaceId,
      author_id: currentMember.id,
      author: currentMember,
      title: newTitle.trim(),
      content: newContent.trim(),
      is_pinned: false,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      user_has_liked: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setIsComposerOpen(false);
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

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const newC = {
            id: `c_${Date.now()}`,
            post_id: postId,
            author_id: currentMember.id,
            author: currentMember,
            content: text,
            likes_count: 0,
            created_at: new Date().toISOString(),
          };
          return {
            ...p,
            comments_count: (p.comments_count || 0) + 1,
            comments: [...(p.comments || []), newC],
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
    setExpandedComments({ ...expandedComments, [postId]: true });
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
      if (sortBy === "popular") {
        return b.likes_count - a.likes_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Spaces / Categories */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Discussion Spaces
                </span>
                <span className="text-xs font-semibold text-amber-500">
                  {posts.length} Posts
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveSpaceId("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSpaceId === "all"
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>All Discussions</span>
                  </div>
                  <span className="text-[10px] opacity-80">{posts.length}</span>
                </button>

                {MOCK_SPACES.map((space) => {
                  const count = posts.filter((p) => p.space_id === space.id).length;
                  const isActive = activeSpaceId === space.id;
                  return (
                    <button
                      key={space.id}
                      onClick={() => setActiveSpaceId(space.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{space.name}</span>
                      <span className="text-[10px] opacity-80">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* MiMo AI Assistant Banner */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="w-full p-3 rounded-xl bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>Ask Community AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Query courses and discussions with Xiaomi MiMo AI
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column: Feed & Composer */}
          <div className="lg:col-span-6 space-y-4">
            {/* Report Toast Notification */}
            {reportToast && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between shadow-sm animate-in fade-in">
                <span>{reportToast}</span>
                <button
                  onClick={() => setReportToast(null)}
                  className="text-amber-500 hover:text-amber-700 text-xs px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Real-Time Search & Sort Bar */}
            <div className="glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search discussions by keyword, topic, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0 text-xs">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    sortBy === "newest"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    sortBy === "popular"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Popular
                </button>
              </div>
            </div>

            {/* Post Authoring Composer */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              {!isComposerOpen ? (
                <div
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={currentMember.avatar_url}
                    alt={currentMember.full_name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/20"
                  />
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors">
                    Write a post or ask a question to the community...
                  </div>
                  <button className="px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors">
                    Post
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
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
                      className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
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
                    className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 pb-2 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />

                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share the details, code snippets, or architectural thoughts..."
                    required
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim() || !newContent.trim()}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all"
                    >
                      Publish Post
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const spaceInfo = MOCK_SPACES.find((s) => s.id === post.space_id);
                const isExpanded = expandedComments[post.id] ?? false;

                return (
                  <article
                    key={post.id}
                    className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all"
                  >
                    {/* Post Author Bar */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.full_name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {post.author.full_name}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Lvl {post.author.level}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            in <span className="font-semibold text-slate-600 dark:text-slate-300">{spaceInfo?.name || "General"}</span> • {new Date(post.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>

                      {post.is_pinned && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">
                      {post.content}
                    </div>

                    {/* Interactions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-semibold transition-colors ${
                            post.user_has_liked
                              ? "text-rose-500 fill-rose-500 font-bold"
                              : "hover:text-rose-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.user_has_liked ? "fill-current" : ""}`} />
                          <span>{post.likes_count}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedComments({
                              ...expandedComments,
                              [post.id]: !isExpanded,
                            })
                          }
                          className="flex items-center gap-1.5 font-semibold hover:text-amber-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0} comments</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReportPost(post.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Report Post to Moderation Queue"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert("Link copied to clipboard!")}
                          className="p-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                          title="Share Post"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Threaded Comments Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-3">
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-2.5 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs"
                              >
                                <img
                                  src={comment.author.avatar_url}
                                  alt={comment.author.full_name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {comment.author.full_name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(comment.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
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
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Column: Classroom Quick Widget & Community Stats */}
          <div className="lg:col-span-3 space-y-4">
            {/* Classroom Progress Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Classroom Masterclass
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  50% Complete
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden h-28 mb-3">
                <img
                  src={MOCK_COURSES[0].cover_url}
                  alt={MOCK_COURSES[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {MOCK_COURSES[0].title}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-amber-500 h-full w-1/2 rounded-full" />
              </div>

              <Link
                href="/classroom"
                className="w-full py-2 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Continue Lesson 2.1</span>
              </Link>
            </div>

            {/* Top Builders Leaderboard */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Top Builders
                </span>
                <Link
                  href="/members"
                  className="text-[11px] font-bold text-amber-500 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {MOCK_MEMBERS.slice(0, 3).map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 font-bold text-slate-400 text-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={m.avatar_url}
                        alt={m.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {m.full_name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      {m.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MiMo AI Knowledge Assistant Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
