"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Settings,
  CreditCard,
  AlertCircle,
  X,
  Play,
  Video,
} from "lucide-react";
import {
  EmailBroadcast,
  BroadcastTemplate,
  AffiliatePartner,
  ReferralConversion,
  AffiliateProgramConfig,
  BroadcastAudience,
} from "@/lib/types";
import {
  MOCK_BROADCASTS,
  MOCK_BROADCAST_TEMPLATES,
  MOCK_AFFILIATES,
  MOCK_CONVERSIONS,
  MOCK_AFFILIATE_CONFIG,
} from "@/lib/school-mock";

export function GrowthAdminStudio() {
  const [activeSubTab, setActiveSubTab] = useState<"broadcasts" | "affiliates">("broadcasts");

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<EmailBroadcast[]>(MOCK_BROADCASTS);
  const [templates] = useState<BroadcastTemplate[]>(MOCK_BROADCAST_TEMPLATES);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all_members");
  const [isSending, setIsSending] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // Affiliate Admin state
  const [affiliates, setAffiliates] = useState<AffiliatePartner[]>(MOCK_AFFILIATES);
  const [conversions, setConversions] = useState<ReferralConversion[]>(MOCK_CONVERSIONS);
  const [config, setConfig] = useState<AffiliateProgramConfig>(MOCK_AFFILIATE_CONFIG);
  const [affiliateMessage, setAffiliateMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch broadcasts
    fetch("/api/v1/admin/broadcasts")
      .then((res) => res.json())
      .then((data) => {
        if (data.broadcasts) setBroadcasts(data.broadcasts);
      })
      .catch((err) => console.warn("Using offline broadcasts mock:", err));

    // Fetch affiliates
    fetch("/api/v1/admin/affiliates")
      .then((res) => res.json())
      .then((data) => {
        if (data.affiliates) setAffiliates(data.affiliates);
        if (data.recent_conversions) setConversions(data.recent_conversions);
        if (data.config) setConfig(data.config);
      })
      .catch((err) => console.warn("Using offline affiliates mock:", err));
  }, []);

  // Handle template selection
  const handleSelectTemplate = (tmpl: BroadcastTemplate) => {
    setSubject(tmpl.subject_template.replace("{{course_title}}", "Autonomous Agent Systems").replace("{{member_name}}", "Builder"));
    setContentHtml(tmpl.content_template.replace(/{{member_name}}/g, "Builder").replace(/{{course_title}}/g, "Autonomous Agent Systems"));
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !contentHtml) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/v1/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          preview_text: previewText,
          content_html: contentHtml,
          audience,
          status: "sent",
        }),
      });
      const data = await res.json();
      if (data.broadcast) {
        setBroadcasts((prev) => [data.broadcast, ...prev]);
        setBroadcastMessage(data.message);
        setTimeout(() => setBroadcastMessage(null), 4000);
        setSubject("");
        setPreviewText("");
        setContentHtml("");
      }
    } catch (err) {
      console.error("Failed to send broadcast:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Save Affiliate Config
  const handleSaveAffiliateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          config,
        }),
      });
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setAffiliateMessage("Affiliate program rules saved successfully! ✓");
        setTimeout(() => setAffiliateMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update affiliate config:", err);
    }
  };

  // Record Payout
  const handleRecordPayout = async (affiliateId: string, amount: number) => {
    try {
      const res = await fetch("/api/v1/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payout",
          affiliate_id: affiliateId,
          payout_amount: amount,
        }),
      });
      const data = await res.json();
      if (data.affiliate) {
        setAffiliates((prev) => prev.map((a) => (a.id === affiliateId ? data.affiliate : a)));
        setAffiliateMessage(data.message);
        setTimeout(() => setAffiliateMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to record payout:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-2xs">
        <button
          onClick={() => setActiveSubTab("broadcasts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "broadcasts"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Newsletters & Email Broadcasts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-white">
            {broadcasts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("affiliates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "affiliates"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Affiliate & Referral Management</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-white">
            {affiliates.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. Broadcasts & Newsletters Tab */}
      {/* ========================================================================= */}
      {activeSubTab === "broadcasts" && (
        <div className="space-y-6">
          {broadcastMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{broadcastMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Broadcast Composer */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Compose Community Broadcast</h3>
                  <p className="text-xs text-slate-500">Send direct newsletter broadcasts, weekly digests, or course announcements.</p>
                </div>
              </div>

              {/* Quick Template Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  1-Click Starter Templates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/40"
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{tmpl.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject Line *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 🔥 AKSchool Digest: Top discussions & this week's live coaching"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="all_members">All Members (1,248)</option>
                      <option value="pro_only">Pro Members Only (380)</option>
                      <option value="vip_only">VIP Executive Only (85)</option>
                      <option value="free_only">Free Members (783)</option>
                      <option value="course_students">Course Enrolled (420)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview Text</label>
                  <input
                    type="text"
                    placeholder="Short snippet displayed in email clients..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email HTML Content *</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="<p>Hey {{member_name}},</p><p>Welcome to this week's update...</p>"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? "Dispatching..." : "Send Broadcast Now"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Past Delivery Performance Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Email Health & Benchmarks</h3>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Average Open Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">56.5%</p>
                <p className="text-[11px] text-slate-500">Industry benchmark: 22.4%</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Average Click Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">30.1%</p>
                <p className="text-[11px] text-slate-500">Industry benchmark: 4.8%</p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Automated milestone triggers are active for signups and course graduations.</p>
                <p>• Dedicated email IP warming via Resend / AWS SES.</p>
              </div>
            </div>
          </div>

          {/* Past Broadcasts Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Broadcast Delivery History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4 text-center">Recipients</th>
                    <th className="py-3 px-4 text-center">Open Rate</th>
                    <th className="py-3 px-4 text-center">Click Rate</th>
                    <th className="py-3 px-4 text-right">Sent Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {broadcasts.map((bc) => (
                    <tr key={bc.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {bc.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {bc.audience.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {bc.recipient_count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                        {bc.open_rate_pct !== undefined ? `${bc.open_rate_pct}%` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {bc.click_rate_pct !== undefined ? `${bc.click_rate_pct}%` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                        {bc.sent_at ? new Date(bc.sent_at).toLocaleDateString() : "Draft"}
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
      {/* 2. Affiliate & Referral Management Tab */}
      {/* ========================================================================= */}
      {activeSubTab === "affiliates" && (
        <div className="space-y-6">
          {affiliateMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{affiliateMessage}</span>
            </div>
          )}

          {/* Program Settings Card */}
          <form onSubmit={handleSaveAffiliateConfig} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Affiliate Program Settings</h3>
                <p className="text-xs text-slate-500">Configure global commission rates and cookie attribution lifetimes.</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs shrink-0"
              >
                Save Program Rules
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400">Program Status</label>
                <select
                  value={config.is_enabled ? "enabled" : "disabled"}
                  onChange={(e) => setConfig({ ...config, is_enabled: e.target.value === "enabled" })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="enabled">Active (Open to Members)</option>
                  <option value="disabled">Paused</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400">Default Commission %</label>
                <input
                  type="number"
                  min="5"
                  max="70"
                  value={config.default_commission_pct}
                  onChange={(e) => setConfig({ ...config, default_commission_pct: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400">Cookie Lifetime (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.cookie_duration_days}
                  onChange={(e) => setConfig({ ...config, cookie_duration_days: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400">Min Payout Threshold ($)</label>
                <input
                  type="number"
                  min="10"
                  value={config.minimum_payout_amount}
                  onChange={(e) => setConfig({ ...config, minimum_payout_amount: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </form>

          {/* Affiliates Partner Roster */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Referral Partners</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Referral Code</th>
                    <th className="py-3 px-4">Clicks</th>
                    <th className="py-3 px-4">Referrals</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Unpaid Commission</th>
                    <th className="py-3 px-4">Payout Destination</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {aff.referral_code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {aff.total_clicks}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        {aff.total_referrals}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        ${aff.total_revenue_generated.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-600">
                        ${aff.unpaid_commission}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="font-semibold text-slate-900 dark:text-white">{aff.payout_email}</span> ({aff.payout_method})
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {aff.unpaid_commission > 0 ? (
                          <button
                            onClick={() => handleRecordPayout(aff.id, aff.unpaid_commission)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                          >
                            Pay ${aff.unpaid_commission}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">All Settled ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
