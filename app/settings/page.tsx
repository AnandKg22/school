"use client";

import { useState } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import {
  User,
  CreditCard,
  FileText,
  Bell,
  Shield,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
  Laptop,
  Smartphone,
  Save,
  CheckCircle2,
  X,
  Printer,
  ChevronRight,
  Zap,
  Globe,
  Trash2,
} from "lucide-react";
import { MOCK_MEMBERS, MOCK_INVOICES, MOCK_SUBSCRIPTIONS } from "@/lib/school-mock";
import { Member, Invoice, PlanTier } from "@/lib/types";

export default function MemberSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "account" | "billing" | "invoices" | "notifications" | "security"
  >("account");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Active member state
  const [member, setMember] = useState<Member>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("school_active_member");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return MOCK_MEMBERS[1]; // Sarah Chen
  });

  // Account Form State
  const [fullName, setFullName] = useState(member.full_name);
  const [handle, setHandle] = useState(member.handle);
  const [bio, setBio] = useState(member.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url);
  const [githubUrl, setGithubUrl] = useState("https://github.com/sarahchen-ai");
  const [websiteUrl, setWebsiteUrl] = useState("https://sarahchen.dev");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Billing & Subscription State
  const [currentTier, setCurrentTier] = useState<PlanTier>(member.plan_tier || "pro");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [tierChangeSuccess, setTierChangeSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Invoices & Tax State
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [taxId, setTaxId] = useState("US-EIN-948210492");
  const [companyName, setCompanyName] = useState("Chen AI Labs Inc.");

  // Notification State
  const [notifications, setNotifications] = useState({
    weeklyDigest: true,
    eventReminders: true,
    directMessages: true,
    courseUpdates: true,
    marketingEmails: false,
    soundAlerts: true,
    browserPush: false,
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "Windows 11 PC • Chrome 129",
      location: "Bangalore, IN",
      ip: "103.41.12.89",
      lastActive: "Active Now (Current Session)",
      isCurrent: true,
      icon: Laptop,
    },
    {
      id: "sess_2",
      device: "Apple iPhone 15 Pro • Safari Mobile",
      location: "Bangalore, IN",
      ip: "103.41.12.92",
      lastActive: "4 hours ago",
      isCurrent: false,
      icon: Smartphone,
    },
    {
      id: "sess_3",
      device: "MacBook Pro • Arc Browser",
      location: "Singapore",
      ip: "157.245.198.4",
      lastActive: "3 days ago",
      isCurrent: false,
      icon: Laptop,
    },
  ]);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Member = {
      ...member,
      full_name: fullName,
      handle,
      bio,
      avatar_url: avatarUrl,
    };
    setMember(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("school_active_member", JSON.stringify(updated));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTierSwitch = (newTier: PlanTier) => {
    setIsUpgrading(true);
    setTimeout(() => {
      setCurrentTier(newTier);
      const updated: Member = { ...member, plan_tier: newTier };
      setMember(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("school_active_member", JSON.stringify(updated));
      }
      setIsUpgrading(false);
      setTierChangeSuccess(true);
      setTimeout(() => setTierChangeSuccess(false), 3000);
    }, 800);
  };

  const revokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const navItems = [
    { id: "account", label: "Account Profile", icon: User },
    { id: "billing", label: "Membership & Billing", icon: CreditCard },
    { id: "invoices", label: "Invoices & Receipts", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Sessions", icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      <CommunityHeader onOpenAiCopilot={() => setIsCopilotOpen(true)} />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Account Settings & Invoicing
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your profile identity, subscription billing, tax receipts, and notification preferences.
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors w-fit"
            >
              <span>View Public Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (3 cols): Tab Navigation Menu */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1 sticky top-20">
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Column (9 cols): Active Tab Content Panel */}
          <main className="lg:col-span-9">

            {/* TAB 1: ACCOUNT PROFILE */}
            {activeTab === "account" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Profile & Public Identity</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    This information appears across community posts, leaderboards, and your Trophy Room.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Profile settings updated and synchronized across AKSchool!</span>
                  </div>
                )}

                <form onSubmit={handleSaveAccount} className="space-y-6">
                  {/* Avatar Upload / URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-600/20 shadow-sm"
                      />
                      <div className="flex-1">
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Paste any direct image URL. Recommended 400x400 square.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name and Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Community Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-slate-400">@</span>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          required
                          className="w-full pl-7 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email (Read Only with Verified Badge) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={member.email}
                        disabled
                        className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold whitespace-nowrap flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Headline & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your technical interests, focus areas, or projects you are building..."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {bio.length} / 250 characters. Markdown formatting supported.
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourusername"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Website / Portfolio
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourdomain.com"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: BILLING & MEMBERSHIP */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                {/* Current Active Plan Card */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                        Active Membership
                      </span>
                      <h2 className="text-2xl font-extrabold capitalize">
                        {currentTier} Level Membership
                      </h2>
                      <p className="text-xs text-slate-300 mt-1">
                        Renews on November 15, 2026 • Billed {billingInterval}ly ($
                        {currentTier === "vip" ? "39" : currentTier === "pro" ? "19" : "0"}/mo)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="https://billing.stripe.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow transition-all flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Stripe Customer Portal</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Default Card: Visa ending in •••• 4242 (Expires 12/28)</span>
                    </div>
                    <div>
                      {isCancelled ? (
                        <span className="text-amber-400 font-semibold">
                          Membership will cancel at period end
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="text-slate-400 hover:text-red-400 underline transition-colors"
                        >
                          Cancel subscription
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {tierChangeSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Your membership plan has been updated to {currentTier.toUpperCase()}!</span>
                  </div>
                )}

                {/* Tier Switcher Cards */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Available Membership Tiers</h3>
                      <p className="text-xs text-slate-500">
                        Upgrade or switch tiers seamlessly. Prorated refunds applied automatically.
                      </p>
                    </div>

                    {/* Interval Toggle */}
                    <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBillingInterval("month")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          billingInterval === "month"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingInterval("year")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          billingInterval === "year"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>Annual</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Tier */}
                    <div
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                        currentTier === "free"
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                          Community
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">Free Explorer</h4>
                        <div className="mt-2 mb-4">
                          <span className="text-3xl font-extrabold text-slate-900">$0</span>
                          <span className="text-xs text-slate-400"> / forever</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 mb-6">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Community discussion spaces</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Foundations Masterclass</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Public Trophy Room profile</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={currentTier === "free" || isUpgrading}
                        onClick={() => handleTierSwitch("free")}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentTier === "free"
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                      >
                        {currentTier === "free" ? "Current Plan" : "Downgrade to Free"}
                      </button>
                    </div>

                    {/* Pro Tier */}
                    <div
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all relative ${
                        currentTier === "pro"
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        POPULAR
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                          Pro Creator
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">Pro Builder</h4>
                        <div className="mt-2 mb-4">
                          <span className="text-3xl font-extrabold text-slate-900">
                            ${billingInterval === "year" ? "190" : "19"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {billingInterval === "year" ? " / year" : " / month"}
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 mb-6">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Full-Stack AI Masterclass</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Weekly Live Coaching Calls</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Unlimited Nova AI queries</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GitHub starter repos & Docker</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={currentTier === "pro" || isUpgrading}
                        onClick={() => handleTierSwitch("pro")}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentTier === "pro"
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                      >
                        {currentTier === "pro" ? "Current Plan" : "Select Pro Plan"}
                      </button>
                    </div>

                    {/* VIP Tier */}
                    <div
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                        currentTier === "vip"
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-700">
                          Executive VIP
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">VIP Accelerator</h4>
                        <div className="mt-2 mb-4">
                          <span className="text-3xl font-extrabold text-slate-900">
                            ${billingInterval === "year" ? "390" : "39"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {billingInterval === "year" ? " / year" : " / month"}
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 mb-6">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Everything in Pro, plus:</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Executive Autonomous Systems</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Private 1-on-1 Architecture Audit</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Exclusive VIP Leaderboard Badge</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={currentTier === "vip" || isUpgrading}
                        onClick={() => handleTierSwitch("vip")}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentTier === "vip"
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        }`}
                      >
                        {currentTier === "vip" ? "Current Plan" : "Upgrade to VIP"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INVOICES & TAX RECEIPTS */}
            {activeTab === "invoices" && (
              <div className="space-y-6">
                {/* Tax / VAT Details Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Corporate Billing & Tax Info</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Include your company legal entity and VAT/GST registration numbers on every PDF receipt for easy employee expense reimbursements.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Company Name on Invoice
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tax / VAT Registration ID
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoices Ledger Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Billing History & Invoices</h3>
                      <p className="text-xs text-slate-500">
                        All payments processed securely via Stripe and PayPal.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                      {invoices.length} Invoices
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-6">Invoice #</th>
                          <th className="py-3.5 px-6">Description</th>
                          <th className="py-3.5 px-6">Date</th>
                          <th className="py-3.5 px-6">Amount</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                              {inv.invoice_number}
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-900">
                              {inv.item_description}
                            </td>
                            <td className="py-4 px-6 text-slate-500">
                              {new Date(inv.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-900">
                              ${inv.amount} {inv.currency}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>View PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Control how AKSchool alerts you on live coaching events, direct messages, and course updates.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "weeklyDigest",
                      title: "Weekly AI Engineering Digest",
                      desc: "Summary of top technical discussion posts, benchmarks, and project showcases shipped by members.",
                    },
                    {
                      id: "eventReminders",
                      title: "Live Coaching & Workshop Reminders",
                      desc: "Receive calendar reminders 1 hour before scheduled weekly coaching calls with Akaash.",
                    },
                    {
                      id: "directMessages",
                      title: "Direct Message & Mention Alerts",
                      desc: "Immediate email notification when a peer sends you a DM or mentions you in comments.",
                    },
                    {
                      id: "courseUpdates",
                      title: "New Lesson & Curriculum Drops",
                      desc: "Notifies you when new lectures, quizzes, or production blueprints are added to your enrolled courses.",
                    },
                    {
                      id: "marketingEmails",
                      title: "Special Promotions & Partner Perks",
                      desc: "Occasional discounts on partner tooling (vLLM, Supabase, Dokploy credits).",
                    },
                  ].map((item) => {
                    const key = item.id as keyof typeof notifications;
                    const isChecked = notifications[key];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                            isChecked ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                              isChecked ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & SESSIONS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Change Account Password</h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Ensure your account is protected with a secure password containing 8+ characters.
                  </p>

                  {passwordSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Password changed successfully!</span>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPasswordSuccess(true);
                      setTimeout(() => setPasswordSuccess(false), 3000);
                    }}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        defaultValue="••••••••••••"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="At least 8 characters..."
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Two-Factor Authentication (2FA)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Protect your account and crypto certificates with Google Authenticator or 1Password.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        twoFactorEnabled
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {twoFactorEnabled ? "✓ 2FA Enabled" : "Enable 2FA"}
                    </button>
                  </div>
                </div>

                {/* Active Sessions List */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Active Login Sessions</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        These devices currently have access to your AKSchool account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSessions((prev) => prev.filter((s) => s.isCurrent))}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Revoke All Others
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {sessions.map((sess) => {
                      const Icon = sess.icon;
                      return (
                        <div
                          key={sess.id}
                          className="py-3.5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{sess.device}</p>
                              <p className="text-[11px] text-slate-400">
                                {sess.location} • IP {sess.ip} •{" "}
                                <span className={sess.isCurrent ? "text-emerald-600 font-bold" : ""}>
                                  {sess.lastActive}
                                </span>
                              </p>
                            </div>
                          </div>

                          {!sess.isCurrent && (
                            <button
                              type="button"
                              onClick={() => revokeSession(sess.id)}
                              className="text-xs text-slate-400 hover:text-red-500 font-medium"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 bg-red-50/50 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-sm font-bold text-red-900 mb-1">Danger Zone</h4>
                  <p className="text-xs text-red-700 mb-4">
                    Permanently delete your account, course completion records, and cryptographic certificates. This action cannot be reversed.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you certain you wish to request account deletion?")) {
                        alert("Account deletion request initiated.");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Printable Invoice PDF Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  AK
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">AKSchool Official Invoice</h3>
                  <p className="text-[11px] text-slate-400">akstack.com • support@akstack.com</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="py-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Billed To:
                  </p>
                  <p className="font-bold text-slate-900">{companyName}</p>
                  <p className="text-slate-600">{member.full_name}</p>
                  <p className="text-slate-500">{member.email}</p>
                  <p className="text-slate-400">VAT/Tax ID: {taxId}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Invoice Details:
                  </p>
                  <p className="font-mono font-bold text-slate-900">{selectedInvoice.invoice_number}</p>
                  <p className="text-slate-500">
                    Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500 capitalize">Gateway: {selectedInvoice.provider}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    PAID IN FULL
                  </span>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium text-slate-900">
                        {selectedInvoice.item_description}
                      </td>
                      <td className="p-3 text-right text-slate-500">1</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ${selectedInvoice.amount} {selectedInvoice.currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2 px-1 text-sm font-bold">
                <span className="text-slate-600">Total Paid:</span>
                <span className="text-blue-700 text-base">
                  ${selectedInvoice.amount} {selectedInvoice.currency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Membership?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              You will continue to have access to Pro courses and live coaching calls until the end of your billing cycle on November 15, 2026. After that, your tier will revert to Free Explorer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Keep Membership
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCancelled(true);
                  setShowCancelModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
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
