"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Download,
  Filter,
  Search,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Award,
  Zap,
  Globe,
  RefreshCw,
  Sliders,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";
import {
  AnalyticsSummary,
  GTMInteractionLog,
  ManagerPermission,
  GTMLifecycleStage,
  GTMEventType,
  ManagerRoleTitle,
} from "@/lib/types";
import {
  MOCK_ANALYTICS_SUMMARY,
  MOCK_GTM_LOGS,
  MOCK_MANAGERS,
} from "@/lib/school-mock";

interface CreatorAnalyticsStudioProps {
  currentMemberRole?: string;
}

export function CreatorAnalyticsStudio({ currentMemberRole = "superadmin" }: CreatorAnalyticsStudioProps) {
  const [subTab, setSubTab] = useState<"overview" | "revenue" | "funnels" | "gtm" | "managers">("overview");
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(MOCK_ANALYTICS_SUMMARY);
  const [gtmLogs, setGtmLogs] = useState<GTMInteractionLog[]>(MOCK_GTM_LOGS);
  const [managers, setManagers] = useState<ManagerPermission[]>(MOCK_MANAGERS);
  const [isLoading, setIsLoading] = useState(false);

  // GTM Filter State
  const [gtmSearch, setGtmSearch] = useState("");
  const [gtmStageFilter, setGtmStageFilter] = useState<string>("all");
  const [gtmEventFilter, setGtmEventFilter] = useState<string>("all");
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Manager Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerRole, setNewManagerRole] = useState<ManagerRoleTitle>("growth_lead");
  const [newManagerCustomTitle, setNewManagerCustomTitle] = useState("");
  const [newManagerPerms, setNewManagerPerms] = useState({
    can_view_revenue: true,
    can_view_gtm_logs: true,
    can_view_lms_analytics: false,
    can_view_community_metrics: true,
    can_export_reports: true,
    can_manage_curriculum: false,
    can_moderate_content: false,
  });
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Load analytics & data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, logsRes, managersRes] = await Promise.all([
        fetch("/api/v1/analytics/overview").then((r) => r.json()),
        fetch("/api/v1/analytics/gtm/logs").then((r) => r.json()),
        fetch("/api/v1/admin/managers").then((r) => r.json()),
      ]);

      if (analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
      if (logsRes.logs) setGtmLogs(logsRes.logs);
      if (managersRes.managers) setManagers(managersRes.managers);
    } catch (err) {
      console.warn("Using offline mock fallback for analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter GTM logs
  const filteredGtmLogs = gtmLogs.filter((log) => {
    const matchesSearch =
      !gtmSearch ||
      (log.member_name && log.member_name.toLowerCase().includes(gtmSearch.toLowerCase())) ||
      (log.member_email && log.member_email.toLowerCase().includes(gtmSearch.toLowerCase())) ||
      (log.target_name && log.target_name.toLowerCase().includes(gtmSearch.toLowerCase())) ||
      (log.metadata.utm_source && log.metadata.utm_source.toLowerCase().includes(gtmSearch.toLowerCase())) ||
      (log.metadata.utm_campaign && log.metadata.utm_campaign.toLowerCase().includes(gtmSearch.toLowerCase()));

    const matchesStage = gtmStageFilter === "all" || log.lifecycle_stage === gtmStageFilter;
    const matchesEvent = gtmEventFilter === "all" || log.event_type === gtmEventFilter;

    return matchesSearch && matchesStage && matchesEvent;
  });

  // Export CSV
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const url = `/api/v1/analytics/gtm/logs?format=csv${gtmStageFilter !== "all" ? `&lifecycle_stage=${gtmStageFilter}` : ""}${gtmEventFilter !== "all" ? `&event_type=${gtmEventFilter}` : ""}${gtmSearch ? `&search=${encodeURIComponent(gtmSearch)}` : ""}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `gtm_logs_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Invite Manager
  const handleInviteManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerEmail) return;

    try {
      const res = await fetch("/api/v1/admin/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_email: newManagerEmail,
          member_name: newManagerName || newManagerEmail.split("@")[0],
          role_title: newManagerRole,
          custom_title: newManagerCustomTitle,
          ...newManagerPerms,
        }),
      });
      const data = await res.json();
      if (data.manager) {
        setManagers((prev) => [data.manager, ...prev.filter((m) => m.id !== data.manager.id)]);
        setActionSuccessMessage(`Invited ${data.manager.member_name} as ${data.manager.custom_title || data.manager.role_title}!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        setIsInviteModalOpen(false);
        setNewManagerEmail("");
        setNewManagerName("");
        setNewManagerCustomTitle("");
      }
    } catch (err) {
      console.error("Error inviting manager:", err);
    }
  };

  // Toggle manager permission
  const handleTogglePermission = async (managerId: string, permKey: string, currentVal: boolean) => {
    const mgr = managers.find((m) => m.id === managerId);
    if (!mgr) return;

    const updated = {
      ...mgr,
      [permKey]: !currentVal,
    };

    setManagers((prev) => prev.map((m) => (m.id === managerId ? updated : m)));

    try {
      await fetch("/api/v1/admin/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn("Could not sync permission toggle:", err);
    }
  };

  // Revoke Manager
  const handleRevokeManager = async (managerId: string) => {
    if (!confirm("Are you sure you want to revoke this manager's access?")) return;

    setManagers((prev) => prev.filter((m) => m.id !== managerId));
    try {
      await fetch(`/api/v1/admin/managers?id=${managerId}`, { method: "DELETE" });
      setActionSuccessMessage("Manager access revoked.");
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err) {
      console.warn("Could not sync revoke:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert Banner */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Navigation Bar */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Executive Overview", icon: BarChart3 },
            { id: "revenue", label: "MRR & Churn Breakdown", icon: DollarSign },
            { id: "funnels", label: "Course Completion Funnels", icon: BookOpen },
            { id: "gtm", label: "GTM Customer Journey Logs", icon: Radio, count: gtmLogs.length },
            { id: "managers", label: "Manager View Delegation", icon: Shield, count: managers.length },
          ].map((item) => {
            const Icon = item.icon;
            const active = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          {subTab === "managers" && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Executive Overview Tab */}
      {/* ========================================================================= */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ${analytics.revenue.mrr.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[11px] font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{analytics.revenue.growth_rate_pct}% MoM</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Annual Run Rate (ARR)</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ${analytics.revenue.arr.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                ARPU: <strong className="text-slate-700 dark:text-slate-200">${analytics.revenue.arpu}</strong> | LTV: <strong className="text-slate-700 dark:text-slate-200">${analytics.revenue.ltv}</strong>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Gross Churn Rate</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.churn.churn_rate_pct}%
              </p>
              <div className="flex items-center gap-1 mt-1 text-slate-400 text-[11px] font-medium">
                <span>Retention: <strong className="text-emerald-600">{analytics.churn.retention_rate_pct}%</strong></span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Community Stickiness</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.engagement.stickiness_ratio}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                DAU: <strong className="text-slate-700 dark:text-slate-200">{analytics.engagement.dau}</strong> / MAU: <strong className="text-slate-700 dark:text-slate-200">{analytics.engagement.mau}</strong>
              </p>
            </div>
          </div>

          {/* Quick Dual Panels: Gateway Revenue & Top Course Funnels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue by Gateway */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between mb-4">
                <span>Multi-Gateway Revenue Distribution</span>
                <span className="text-xs font-normal text-slate-400">Past 30 Days</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Stripe Checkout</span>
                    </span>
                    <span>${analytics.revenue.by_gateway.stripe.toLocaleString()} (66%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "66%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>PayPal Express</span>
                    </span>
                    <span>${analytics.revenue.by_gateway.paypal.toLocaleString()} (34%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "34%" }}></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 mt-4 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>VIP Plan Subscriptions:</span>
                    <span>${analytics.revenue.by_tier.vip.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Pro Plan Subscriptions:</span>
                    <span>${analytics.revenue.by_tier.pro.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Standalone Course Purchases:</span>
                    <span>${analytics.revenue.by_tier.standalone_courses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Course Completion Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between mb-4">
                <span>Course Completion Rates</span>
                <span className="text-xs font-normal text-slate-400">{analytics.courses.length} Active Courses</span>
              </h3>

              <div className="space-y-4">
                {analytics.courses.map((course) => (
                  <div key={course.course_id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="truncate max-w-[240px] text-slate-900 dark:text-white font-black">{course.course_title}</span>
                      <span className="text-emerald-600">{course.completion_rate_pct}% completed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${course.completion_rate_pct}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{course.enrolled_count} Enrolled &rarr; {course.completed_count} Finished</span>
                      <span>Quiz Pass: <strong>{course.quiz_pass_rate_pct}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Detailed Revenue & Churn Tab */}
      {/* ========================================================================= */}
      {subTab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Gross Revenue (30 Days)</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-white">${analytics.revenue.net_revenue_30d.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Combined recurring subscriptions and standalone course checkouts.</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Stripe Volume:</span>
                  <strong className="text-slate-900 dark:text-white">${analytics.revenue.by_gateway.stripe.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Volume:</span>
                  <strong className="text-slate-900 dark:text-white">${analytics.revenue.by_gateway.paypal.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Growth:</span>
                  <strong className="text-emerald-600">+{analytics.revenue.growth_rate_pct}%</strong>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Voluntary vs Delinquent Churn</h3>
              <p className="text-3xl font-black text-amber-500">{analytics.churn.churn_rate_pct}%</p>
              <p className="text-xs text-slate-500 mt-2">Net MRR Churn: ${analytics.churn.net_mrr_churn}/mo</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">User Voluntary Cancellations:</span>
                  <strong className="text-slate-900 dark:text-white">{analytics.churn.voluntary_cancellations_30d} accounts</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Failed Invoices / Delinquent:</span>
                  <strong className="text-rose-500">{analytics.churn.payment_failures_30d} accounts</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">At-Risk Inactive Members:</span>
                  <strong className="text-amber-600">{analytics.churn.at_risk_members_count} flagged</strong>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Unit Economics & LTV</h3>
              <p className="text-3xl font-black text-blue-600">${analytics.revenue.ltv}</p>
              <p className="text-xs text-slate-500 mt-2">Estimated Customer Lifetime Value based on 1.8% monthly churn.</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Revenue Per User:</span>
                  <strong className="text-slate-900 dark:text-white">${analytics.revenue.arpu}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Membership Lifetime:</span>
                  <strong className="text-slate-900 dark:text-white">16.0 Months</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual Run Rate (ARR):</span>
                  <strong className="text-slate-900 dark:text-white">${analytics.revenue.arr.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Course Funnels Tab */}
      {/* ========================================================================= */}
      {subTab === "funnels" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {analytics.courses.map((course) => (
              <div key={course.course_id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{course.course_title}</h3>
                    <p className="text-xs text-slate-500">
                      Avg completion time: <strong>{course.average_days_to_finish} days</strong> | Quiz Pass Rate: <strong>{course.quiz_pass_rate_pct}%</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      {course.completion_rate_pct}% Overall Completion
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {course.certificates_issued_count} Certificates Issued
                    </span>
                  </div>
                </div>

                {/* Funnel Progress Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center mb-6">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1: Enrolled</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{course.enrolled_count}</p>
                    <span className="text-[10px] font-semibold text-slate-500">100% of cohort</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2: Started L1</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{course.started_count}</p>
                    <span className="text-[10px] font-semibold text-blue-600">
                      {Math.round((course.started_count / course.enrolled_count) * 100)}% activation
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3: Halfway Mark</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{course.halfway_count}</p>
                    <span className="text-[10px] font-semibold text-amber-600">
                      {Math.round((course.halfway_count / course.enrolled_count) * 100)}% retention
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4: Certified</p>
                    <p className="text-lg font-black text-emerald-600 mt-1">{course.completed_count}</p>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      {course.completion_rate_pct}% graduates
                    </span>
                  </div>
                </div>

                {/* Drop-Off Warning Alert */}
                {course.top_dropoff_lesson && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>
                        Highest Drop-Off Friction Point: <strong>{course.top_dropoff_lesson.lesson_title}</strong> (
                        {course.top_dropoff_lesson.dropoff_pct}% student drop-off).
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600">Review lesson clarity</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GTM Customer Journey Logs Tab */}
      {/* ========================================================================= */}
      {subTab === "gtm" && (
        <div className="space-y-6">
          {/* Filter Bar & Export Actions */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, UTM, or campaign..."
                  value={gtmSearch}
                  onChange={(e) => setGtmSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Stage Filter */}
              <select
                value={gtmStageFilter}
                onChange={(e) => setGtmStageFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">All Lifecycle Stages</option>
                <option value="visitor">Visitor</option>
                <option value="lead">Lead</option>
                <option value="activated">Activated</option>
                <option value="paying_customer">Paying Customer</option>
                <option value="vip">VIP Executive</option>
              </select>

              {/* Event Filter */}
              <select
                value={gtmEventFilter}
                onChange={(e) => setGtmEventFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">All Event Types</option>
                <option value="user_registered">User Registered</option>
                <option value="paywall_hit">Paywall Hit</option>
                <option value="checkout_completed">Checkout Completed</option>
                <option value="tier_upgraded">Tier Upgraded</option>
                <option value="certificate_claimed">Certificate Claimed</option>
                <option value="event_rsvped">Event RSVPed</option>
                <option value="poll_voted">Poll Voted</option>
                <option value="dm_sent">DM Sent</option>
              </select>
            </div>

            <button
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingCsv ? "Exporting..." : "Export CSV for CRM"}</span>
            </button>
          </div>

          {/* GTM Logs Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User / Lead</th>
                    <th className="py-3 px-4">Lifecycle Stage</th>
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Target Detail</th>
                    <th className="py-3 px-4">UTM Attribution</th>
                    <th className="py-3 px-4">Device & Geo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredGtmLogs.map((log) => {
                    const stageColor =
                      log.lifecycle_stage === "vip"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200"
                        : log.lifecycle_stage === "paying_customer"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200"
                        : log.lifecycle_stage === "lead"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{log.member_name || "Visitor"}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{log.member_email || "Anonymous"}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${stageColor}`}>
                            {log.lifecycle_stage.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {log.event_type.replace(/_/g, " ")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={log.target_name}>
                          {log.target_name || log.target_id || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {log.metadata.utm_source ? (
                            <div className="text-[11px]">
                              <p className="font-bold text-slate-700 dark:text-slate-300">{log.metadata.utm_source}</p>
                              <p className="text-slate-400 truncate max-w-[140px]">{log.metadata.utm_campaign || "organic"}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Direct / In-App</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          <p className="truncate max-w-[140px]">{log.metadata.device || "Browser"}</p>
                          <p className="text-slate-400">{log.metadata.country || "Global"}</p>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGtmLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No customer interactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Manager View Delegation & RBAC Tab */}
      {/* ========================================================================= */}
      {subTab === "managers" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Authorized Managers & View Scopes</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SuperAdmin can grant specific dashboard views (MRR, GTM logs, LMS funnels, community metrics) to team managers.
                </p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Invite New Manager</span>
              </button>
            </div>

            {/* Managers Table with Toggle Switches */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Manager Profile</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4 text-center">Revenue View</th>
                    <th className="py-3 px-4 text-center">GTM Logs</th>
                    <th className="py-3 px-4 text-center">LMS Funnels</th>
                    <th className="py-3 px-4 text-center">Community</th>
                    <th className="py-3 px-4 text-center">Exports</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {managers.map((mgr) => (
                    <tr key={mgr.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{mgr.member_name}</p>
                        <p className="text-[11px] text-slate-400">{mgr.member_email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[11px]">
                          {mgr.custom_title || mgr.role_title.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={mgr.can_view_revenue}
                          onChange={() => handleTogglePermission(mgr.id, "can_view_revenue", mgr.can_view_revenue)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={mgr.can_view_gtm_logs}
                          onChange={() => handleTogglePermission(mgr.id, "can_view_gtm_logs", mgr.can_view_gtm_logs)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={mgr.can_view_lms_analytics}
                          onChange={() => handleTogglePermission(mgr.id, "can_view_lms_analytics", mgr.can_view_lms_analytics)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={mgr.can_view_community_metrics}
                          onChange={() => handleTogglePermission(mgr.id, "can_view_community_metrics", mgr.can_view_community_metrics)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={mgr.can_export_reports}
                          onChange={() => handleTogglePermission(mgr.id, "can_export_reports", mgr.can_export_reports)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRevokeManager(mgr.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Revoke Manager Access"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* Invite Manager Modal */}
      {/* ========================================================================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Invite Manager & Delegate Views</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteManager} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Manager Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. growth.manager@company.com"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Functional Role</label>
                  <select
                    value={newManagerRole}
                    onChange={(e) => setNewManagerRole(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="growth_lead">Growth Lead</option>
                    <option value="course_director">Course Director</option>
                    <option value="community_manager">Community Manager</option>
                    <option value="operations_manager">Operations Manager</option>
                    <option value="support_lead">Support Lead</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Title</label>
                  <input
                    type="text"
                    placeholder="e.g. VP of Growth"
                    value={newManagerCustomTitle}
                    onChange={(e) => setNewManagerCustomTitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Granted View Permissions</label>
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newManagerPerms.can_view_revenue}
                      onChange={(e) => setNewManagerPerms({ ...newManagerPerms, can_view_revenue: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>View Revenue, MRR, ARR & Churn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newManagerPerms.can_view_gtm_logs}
                      onChange={(e) => setNewManagerPerms({ ...newManagerPerms, can_view_gtm_logs: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>View GTM Customer Journey Logs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newManagerPerms.can_view_lms_analytics}
                      onChange={(e) => setNewManagerPerms({ ...newManagerPerms, can_view_lms_analytics: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>View LMS Course Completion Funnels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newManagerPerms.can_view_community_metrics}
                      onChange={(e) => setNewManagerPerms({ ...newManagerPerms, can_view_community_metrics: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>View Community DAU & Engagement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newManagerPerms.can_export_reports}
                      onChange={(e) => setNewManagerPerms({ ...newManagerPerms, can_export_reports: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Export CSV Data for CRM</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
