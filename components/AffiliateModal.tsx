"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Copy,
  Check,
  TrendingUp,
  Users,
  Award,
  CreditCard,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { AffiliatePartner, ReferralConversion, AffiliateProgramConfig } from "@/lib/types";
import { MOCK_AFFILIATES, MOCK_CONVERSIONS, MOCK_AFFILIATE_CONFIG } from "@/lib/school-mock";

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
}

export function AffiliateModal({ isOpen, onClose, memberId = "usr_admin_001" }: AffiliateModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliatePartner>(MOCK_AFFILIATES[0]);
  const [conversions, setConversions] = useState<ReferralConversion[]>(MOCK_CONVERSIONS);
  const [config, setConfig] = useState<AffiliateProgramConfig>(MOCK_AFFILIATE_CONFIG);
  const [payoutEmail, setPayoutEmail] = useState(MOCK_AFFILIATES[0].payout_email);
  const [payoutMethod, setPayoutMethod] = useState(MOCK_AFFILIATES[0].payout_method);
  const [customCode, setCustomCode] = useState(MOCK_AFFILIATES[0].referral_code);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/v1/affiliates/me?member_id=${memberId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.affiliate) {
            setAffiliate(data.affiliate);
            setPayoutEmail(data.affiliate.payout_email || "");
            setPayoutMethod(data.affiliate.payout_method || "paypal");
            setCustomCode(data.affiliate.referral_code);
          }
          if (data.conversions) setConversions(data.conversions);
          if (data.program_config) setConfig(data.program_config);
        })
        .catch((err) => console.warn("Using offline mock fallback for affiliate:", err));
    }
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(affiliate.referral_url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/affiliates/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          payout_email: payoutEmail,
          payout_method: payoutMethod,
          custom_code: customCode,
        }),
      });
      const data = await res.json();
      if (data.affiliate) {
        setAffiliate(data.affiliate);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update payout profile:", err);
    }
  };

  const handleRequestPayout = () => {
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      setPayoutRequested(true);
      setTimeout(() => setPayoutRequested(false), 4000);
    }, 1000);
  };

  const conversionRate =
    affiliate.total_clicks > 0
      ? ((affiliate.total_referrals / affiliate.total_clicks) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Affiliate & Referral Partner
                </span>
                <span className="text-xs text-slate-400">
                  Earn <strong>{affiliate.commission_rate_pct}%</strong> Lifetime Commission
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Share AKSchool, Earn Real Income
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unique Referral Link Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Your Personal Referral Link:</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{config.cookie_duration_days}-Day Tracking Cookie</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={affiliate.referral_url}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white select-all"
            />
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Clicks</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{affiliate.total_clicks}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Referrals</span>
            <p className="text-xl font-black text-blue-600 mt-0.5">{affiliate.total_referrals}</p>
            <span className="text-[10px] text-slate-400">{conversionRate}% conversion</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unpaid Payout</span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">${affiliate.unpaid_commission}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lifetime Paid</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">${affiliate.paid_commission}</p>
          </div>
        </div>

        {/* Payout Trigger Action */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Available Balance: <strong className="text-emerald-600">${affiliate.unpaid_commission} USD</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Minimum payout threshold: ${config.minimum_payout_amount}. Dispatched automatically via {affiliate.payout_method.toUpperCase()}.
            </p>
          </div>

          <button
            onClick={handleRequestPayout}
            disabled={affiliate.unpaid_commission < config.minimum_payout_amount || isRequestingPayout || payoutRequested}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
              affiliate.unpaid_commission >= config.minimum_payout_amount
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {payoutRequested ? "Payout Requested! ✓" : isRequestingPayout ? "Processing..." : "Request Payout"}
          </button>
        </div>

        {/* Recent Referral Conversions Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Converted Referrals</h3>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Item Purchased</th>
                  <th className="py-2.5 px-3">Sale Total</th>
                  <th className="py-2.5 px-3 text-right">Commission</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {conversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {conv.buyer_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                      {conv.item_title}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                      ${conv.order_amount}
                    </td>
                    <td className="py-2.5 px-3 font-black text-emerald-600 text-right">
                      +${conv.commission_amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 border border-emerald-200">
                        {conv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Settings Form */}
        <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payout Details</h3>
            {saveSuccess && <span className="text-xs font-bold text-emerald-600">Saved successfully! ✓</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400">Payment Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe Connect</option>
                <option value="bank_transfer">Wire / Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400">Payout Email / Account</label>
              <input
                type="text"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400">Custom Code Slug</label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              Save Payout Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
