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
  Check
} from "lucide-react";
import { MOCK_COMMUNITY, MOCK_MEMBERS, MOCK_AI_KNOWLEDGE, MOCK_PLANS } from "@/lib/school-mock";
import { Member, AIKnowledgeItem } from "@/lib/types";

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "branding" | "moderation" | "ai" | "plans" | "embed">("overview");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member>(MOCK_MEMBERS[0]);

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
    // 1. Check local active member
    const saved = localStorage.getItem("school_active_member_id");
    if (saved) {
      const found = MOCK_MEMBERS.find((m) => m.id === saved);
      if (found) setCurrentMember(found);
    }

    // 2. Verify real Supabase session and profile role
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          // If no active session, redirect to login
          window.location.href = "/login";
          return;
        }

        // Check user role from metadata or app_school_members
        supabase
          .from("app_school_members")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setCurrentMember(data);
              if (data.role !== "owner" && data.role !== "admin") {
                // Not authorized to view admin operations
                window.location.href = "/community";
              }
            }
          });
      });
    });
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const newDoc: AIKnowledgeItem = {
      id: `k_${Date.now()}`,
      title: newDocTitle.trim(),
      content: newDocContent.trim(),
      source_type: newDocType,
    };
    setKnowledgeList([...knowledgeList, newDoc]);
    setNewDocTitle("");
    setNewDocContent("");
  };

  const handleDismissFlag = (id: string) => {
    setFlaggedPosts(flaggedPosts.filter((f) => f.id !== id));
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
                  Role: <strong className="capitalize text-[#0F172A] dark:text-slate-300">{currentMember.role}</strong>
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
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-500"}`}>
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
    </div>
  );
}
