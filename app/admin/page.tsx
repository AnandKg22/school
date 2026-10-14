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
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { MOCK_COMMUNITY, MOCK_MEMBERS, MOCK_POSTS, MOCK_COURSES, MOCK_AI_KNOWLEDGE, MOCK_PLANS } from "@/lib/school-mock";
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
    const saved = localStorage.getItem("school_active_member_id");
    if (saved) {
      const found = MOCK_MEMBERS.find((m) => m.id === saved);
      if (found) setCurrentMember(found);
    }
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

  const embedCodeSnippet = `<!-- AKStack CommunityOS Webflow Embed Widget -->
<div id="akstack-community-embed" data-tenant="comm_akstack_001" style="width: 100%; min-height: 650px;"></div>
<script 
  src="https://school.akstack.com/embed/widget.js" 
  data-theme="auto" 
  data-community="akstack-builders"
  async>
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <CommunityHeader onOpenAiCopilot={() => setIsAiOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Console Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Owner & Admin Console
                </span>
                <span className="text-xs text-slate-400">
                  Role: <strong className="capitalize text-slate-700 dark:text-slate-300">{currentMember.role}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                Community Management & Operations Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Exit to Feed
            </Link>
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask MiMo Copilot</span>
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
            { id: "embed", label: "Webflow & Embed", icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md shadow-orange-500/20"
                    : "glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
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
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Members</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">1,248</p>
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                  +18% this month
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weekly Active</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">412</p>
                <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1 mt-1">
                  33% engagement
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Discussions</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">342</p>
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                  4 spaces active
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹2,48,000</p>
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                  184 Pro subscribers
                </span>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 col-span-2 md:col-span-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">MiMo AI Queries</p>
                <p className="text-2xl font-black text-amber-500 mt-1">1,890</p>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-1">
                  Singapore Cluster
                </span>
              </div>
            </div>

            {/* Launch Checklist */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>PRD Launch Readiness & Setup Checklist</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Multi-Tenant Supabase DB Schema", desc: "app_school_* isolation & Row-Level Security enabled", status: "completed" },
                  { title: "Hosted Community Domain", desc: "school.akstack.com live via Traefik & Dokploy VPS", status: "completed" },
                  { title: "Xiaomi MiMo AI Singapore Gateway", desc: "token-plan-sgp.xiaomimimo.com connected with token plan key", status: "completed" },
                  { title: "Classroom Video Masterclass", desc: "Module 1 & 2 published with progress tracking", status: "completed" },
                  { title: "Webflow & Embed Script Generator", desc: "Iframe and script snippet ready for external sites", status: "completed" },
                  { title: "Payment & Entitlement Ledger", desc: "Free, Pro (₹999/mo), and VIP tiers active", status: "completed" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Community Identity & Rules Settings
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure your public name, tagline, hosted URL, and code of conduct
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Community Rules & Guidelines
                </label>
                <textarea
                  rows={4}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hosted Domain Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">https://</span>
                  <input
                    type="text"
                    disabled
                    value="school.akstack.com"
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed font-mono"
                  />
                  <span className="text-xs text-emerald-500 font-bold">Active SSL</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all"
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Content Moderation Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Review flagged posts and comments submitted by community members
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">
                {flaggedPosts.length} Pending
              </span>
            </div>

            {flaggedPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Moderation queue is clean!</p>
                <p className="text-xs">No pending flags or policy violations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedPosts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                          Flagged
                        </span>
                        <span className="text-xs text-slate-400">{item.reportedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        &ldquo;{item.postTitle}&rdquo;
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Author: <strong className="text-slate-700 dark:text-slate-300">{item.authorName}</strong> • Reason: <span className="text-rose-500 font-medium">{item.reason}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDismissFlag(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleDismissFlag(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm"
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
            {/* Engine Specs */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Xiaomi MiMo Gateway Online
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Active Model: <code className="text-amber-500">mimo-v2.6-flash</code>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cluster: <span className="font-mono text-slate-700 dark:text-slate-300">https://token-plan-sgp.xiaomimimo.com/v1</span> (Singapore) • 1M Context Window
                </p>
              </div>
              <button
                onClick={() => setIsAiOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-orange-500/20"
              >
                Test AI Copilot
              </button>
            </div>

            {/* Ingested Documents List */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">
                Grounded Knowledge Sources ({knowledgeList.length})
              </h3>
              <div className="space-y-3">
                {knowledgeList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
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
              <form onSubmit={handleAddKnowledge} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ingest New Grounding Document
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Document Title (e.g. Dokploy Deployment FAQ)"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={newDocType}
                      onChange={(e: any) => setNewDocType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                    placeholder="Enter factual content, guidelines, or architectural notes for the model to ground answers on..."
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Grounding Vector</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Monetisation & Plans */}
        {activeTab === "plans" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Membership Plans & Entitlements
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Active pricing tiers configured in the internal entitlement ledger
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Active Tier
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                    <div className="my-4">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {plan.price_monthly === 0 ? "Free" : `₹${plan.price_monthly}`}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/month</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                    Subscribers: <strong className="text-slate-700 dark:text-slate-200">{plan.id === "free" ? "1,064" : "184"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Webflow & Embed */}
        {activeTab === "embed" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                Website Integration (PRD Section 9)
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                Webflow & Website Embed Code Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Embed your community discussions or classroom directly into Webflow, Framer, WordPress, or custom sites.
              </p>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto border border-slate-800">
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
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Allowed Embed Origins (CORS & CSP Binding)</span>
              </h3>
              <input
                type="text"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Comma-separated list of approved host origins permitted to render the authenticated widget.
              </p>
            </div>

            {/* Custom Domain Instructions */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-300">Custom Domain CNAME Configuration</h4>
              <p>
                To point a custom subdomain (e.g. <code className="font-mono text-amber-600 dark:text-amber-400">community.yourdomain.com</code>), add a DNS CNAME record pointing to <code className="font-mono text-amber-600 dark:text-amber-400">school.akstack.com</code>. Dokploy Traefik will automatically provision a Let&apos;s Encrypt SSL certificate upon DNS propagation.
              </p>
            </div>
          </div>
        )}
      </main>

      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
