"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  DollarSign,
  Copy,
  Check,
  TrendingUp,
  Users,
  Award,
  CreditCard,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Download,
  Share2,
  Sliders,
  FileText,
  CheckCircle,
  HelpCircle,
  Layers,
  Zap,
} from "lucide-react";
import {
  MOCK_AFFILIATES,
  MOCK_CONVERSIONS,
  MOCK_AFFILIATE_CONFIG,
  MOCK_MEMBERS,
} from "@/lib/school-mock";
import {
  AffiliatePartner,
  ReferralConversion,
  AffiliateProgramConfig,
  Member,
} from "@/lib/types";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export default function AffiliatesPage() {
  const [affiliate, setAffiliate] = useState<AffiliatePartner>(MOCK_AFFILIATES[0]);
  const [conversions, setConversions] = useState<ReferralConversion[]>(MOCK_CONVERSIONS);
  const [config, setConfig] = useState<AffiliateProgramConfig>(MOCK_AFFILIATE_CONFIG);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSwipeId, setCopiedSwipeId] = useState<string | null>(null);

  // UTM builder
  const [utmSource, setUtmSource] = useState("twitter");
  const [utmCampaign, setUtmCampaign] = useState("autumn2026");

  // Calculator sliders
  const [calcProCount, setCalcProCount] = useState<number>(10);
  const [calcVipCount, setCalcVipCount] = useState<number>(5);

  // Payout state
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "bank_wire">("paypal");
  const [payoutEmail, setPayoutEmail] = useState(MOCK_AFFILIATES[0].payout_email || "akaash.pay@akstack.com");
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "conversions" | "swipe_kit" | "settings">("overview");
  const [conversionFilter, setConversionFilter] = useState<string>("all");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  useEffect(() => {
    const active = getActiveMember();
    setCurrentMember(active || MOCK_MEMBERS[0]);
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      setCurrentMember(updated || MOCK_MEMBERS[0]);
    });
    return () => unsubscribe();
  }, []);

  // Compute live referral URL with UTM params
  const baseReferralUrl = affiliate.referral_url || `https://school.akstack.com/join?ref=${affiliate.referral_code}`;
  const fullCustomUrl = `${baseReferralUrl}&utm_source=${encodeURIComponent(utmSource)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copySwipeText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSwipeId(id);
    setTimeout(() => setCopiedSwipeId(null), 2000);
  };

  // Calculator estimations (assuming $49/mo Pro and $149/mo VIP, 30% commission)
  const estProEarnings = calcProCount * 49 * (config.default_commission_pct / 100);
  const estVipEarnings = calcVipCount * 149 * (config.default_commission_pct / 100);
  const totalEstMonthly = Math.round(estProEarnings + estVipEarnings);
  const totalEstAnnual = totalEstMonthly * 12;

  // Filter conversions
  const filteredConversions = conversions.filter((c) => {
    if (conversionFilter === "all") return true;
    return c.status === conversionFilter;
  });

  // Handle saving payout preferences
  const handleSavePayoutSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }, 600);
  };

  // Pre-written email swipe copy templates
  const SWIPE_TEMPLATES = [
    {
      id: "swipe_1",
      title: "The Zero-Hallucination AI Engineering Blueprint",
      audience: "Software Engineers & AI Developers",
      subject: "How top teams build production autonomous agent swarms (without hallucinations)",
      body: `Hey {{first_name}},\n\nMost AI tutorials stop at simple prompt wrappers. But if you're trying to build production agentic workflows that orchestrate database writes, API calls, and resilient error recovery, you need real architectural blueprints.\n\nI’ve been learning inside AKSchool — an academy built by enterprise engineers. They teach:\n- Multi-agent state machines with LangGraph\n- Supabase multi-tenant RLS isolation\n- Automated quality gates and testing pipelines\n\nYou can join using my partner link for immediate access to their video masterclasses and builder community:\n${fullCustomUrl}\n\nSee you inside,\n${currentMember?.full_name || "Akaash"}`,
    },
    {
      id: "swipe_2",
      title: "Invitation to Weekly Live Coaching & Code Audits",
      audience: "Founders & Technical Leaders",
      subject: "Exclusive Invite: Weekly Live Architecture Audits with Akaash Sharma",
      body: `Hi {{first_name}},\n\nEvery week, founders and lead developers gather for live architectural teardowns inside AKSchool. We bring our live codebases and debug RAG latency bottlenecks, agent loops, and production deployments.\n\nWhether you're starting a new SaaS or scaling an autonomous AI platform, this community saves weeks of trial-and-error.\n\nClaim your invitation here:\n${fullCustomUrl}\n\nBest regards,\n${currentMember?.full_name || "Akaash"}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================================================================= */}
        {/* HERO BANNER: Partner Status & Commission Rate                     */}
        {/* ================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-900 to-slate-950 border border-emerald-400/30 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AKSchool Official Partner Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Earn {config.default_commission_pct}% Recurring Commission on Every Referral
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Recommend the premier AI engineering academy and community to fellow builders. Earn continuous monthly income on memberships and course enrollments with a {config.cookie_duration_days}-day attribution window.
              </p>
            </div>

            {/* Quick Unpaid Balance Card */}
            <div className="p-6 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 text-left shrink-0 w-full lg:w-auto min-w-[280px]">
              <div className="flex items-center justify-between text-xs text-emerald-200 font-bold uppercase tracking-wider mb-2">
                <span>Available Payout</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ready
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                ${affiliate.unpaid_commission.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Lifetime Revenue: <strong className="text-emerald-400">${affiliate.total_revenue_generated.toFixed(2)}</strong>
              </p>
              <button
                onClick={() => setPayoutRequested(true)}
                disabled={affiliate.unpaid_commission < config.minimum_payout_amount || payoutRequested}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {payoutRequested ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Payout Processing ($350.00)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Request Payout (Min ${config.minimum_payout_amount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CUSTOM LINK GENERATOR & 4-METRIC STATS RIBBON                     */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Your Custom Partner Tracking Link</span>
            </h2>
            <p className="text-xs text-slate-500">
              Attach UTM parameters to trace clicks across YouTube, Twitter, newsletters, or personal blogs.
            </p>
          </div>

          {/* Link Builder Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Campaign Source
              </label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="e.g. twitter, youtube, newsletter"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Campaign Tag
              </label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="e.g. agent_playbook_october"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Resulting Link Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1 px-3 text-xs font-mono text-slate-700 dark:text-slate-300 truncate w-full">
              {fullCustomUrl}
            </div>
            <button
              onClick={() => copyToClipboard(fullCustomUrl)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Partner Link</span>
                </>
              )}
            </button>
          </div>

          {/* 4-KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Link Clicks</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{affiliate.total_clicks.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">3.1% Conversion</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Leads</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">184</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Free Community Tier</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paying Members</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{affiliate.total_referrals}</p>
              <p className="text-[11px] text-blue-500 font-semibold mt-0.5">Pro & VIP Subscribers</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission Rate</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{config.default_commission_pct}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{config.cookie_duration_days}-Day Cookie Window</p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SUBNAV TABS: Overview | Conversions | Swipe Kit | Payout Settings */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Earnings Calculator
          </button>

          <button
            onClick={() => setActiveTab("conversions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "conversions"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Referred Transactions ({conversions.length})
          </button>

          <button
            onClick={() => setActiveTab("swipe_kit")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "swipe_kit"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Marketing Swipe Copy & Media Kit
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "settings"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Payout Preferences
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: EARNINGS POTENTIAL CALCULATOR                              */}
        {/* ================================================================= */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <span>Estimate Your Monthly Recurring Commission</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Because subscriptions are recurring, every member you refer pays you each month they stay subscribed.
                </p>
              </div>

              {/* Slider 1: Pro Members ($49/mo) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Referred Pro Tier Members ($49/mo)</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{calcProCount} members</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={calcProCount}
                  onChange={(e) => setCalcProCount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0</span>
                  <span>25</span>
                  <span>50 members</span>
                </div>
              </div>

              {/* Slider 2: VIP Members ($149/mo) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Referred VIP Inner Circle ($149/mo)</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{calcVipCount} members</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={calcVipCount}
                  onChange={(e) => setCalcVipCount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0</span>
                  <span>15</span>
                  <span>30 members</span>
                </div>
              </div>

              {/* Calculation Breakdown Note */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Commissions are calculated automatically upon invoice clearance with Stripe and PayPal, and credited directly to your partner ledger every 30 days.
                </p>
              </div>
            </div>

            {/* Projection Summary Card */}
            <div className="bg-gradient-to-b from-emerald-500/10 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 dark:border-emerald-600/60 shadow-lg flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  Projected Income
                </span>

                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Monthly Earnings</span>
                  <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                    ${totalEstMonthly.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/mo</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Annualized Passive Income</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ${totalEstAnnual.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/year</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("swipe_kit")}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Promotion Materials</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: REFERRED TRANSACTIONS TABLE                                */}
        {/* ================================================================= */}
        {activeTab === "conversions" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Referral Conversions & Commission Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed ledger of every purchase made via your partner tracking link.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {["all", "approved", "pending", "paid"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setConversionFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      conversionFilter === status
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Member Referred</th>
                    <th className="py-3 px-3">Product / Tier</th>
                    <th className="py-3 px-3">Gross Sale</th>
                    <th className="py-3 px-3">Rate</th>
                    <th className="py-3 px-3">Your Commission</th>
                    <th className="py-3 px-3 text-right">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredConversions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-3 text-slate-500 font-mono">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {c.buyer_name}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {c.item_title}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-mono">
                        ${c.order_amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono">
                        {Math.round((c.commission_amount / (c.order_amount || 1)) * 100)}%
                      </td>
                      <td className="py-3.5 px-3 font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        +${c.commission_amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            c.status === "paid"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300"
                              : c.status === "approved"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-300"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MARKETING SWIPE COPY & MEDIA KIT                           */}
        {/* ================================================================= */}
        {activeTab === "swipe_kit" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Proven Email & Social Swipe Copy Templates</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Copy and paste these high-converting templates into your email newsletter, Substack, or Twitter threads.
                </p>
              </div>

              <div className="space-y-6">
                {SWIPE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Target: {tmpl.audience}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {tmpl.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => copySwipeText(tmpl.id, tmpl.body)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedSwipeId === tmpl.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Email Swipe</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Subject: <span className="font-normal">{tmpl.subject}</span>
                      </p>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {tmpl.body}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Logo & Banner Assets Download */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Official Brand Assets & Promotional Banners
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="h-24 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
                    AKSchool 1200x630
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Social OpenGraph Card</p>
                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="h-24 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                    AKSchool Dark Logo Pack
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Vector SVG & Logos</p>
                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="h-24 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                    Certified Builder Badge
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Transparent Profile Badge</p>
                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PAYOUT PREFERENCES & ACCOUNT SETTINGS                      */}
        {/* ================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payout Settings & Payment Rails
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure where your monthly affiliate earnings are deposited.
              </p>
            </div>

            <form onSubmit={handleSavePayoutSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("paypal")}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      payoutMethod === "paypal"
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>PayPal Instant Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod("bank_wire")}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      payoutMethod === "bank_wire"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>Direct Bank Wire (IBAN/SWIFT)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {payoutMethod === "paypal" ? "PayPal Email Address" : "Bank Wire Account / IBAN"}
                </label>
                <input
                  type="text"
                  value={payoutEmail}
                  onChange={(e) => setPayoutEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingSettings ? <span>Saving Changes...</span> : <span>Save Payout Preferences</span>}
                </button>
                {saveToast && (
                  <p className="text-center text-xs text-emerald-600 font-bold mt-2">
                    ✓ Payout preferences updated successfully!
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Nova AI Copilot Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
