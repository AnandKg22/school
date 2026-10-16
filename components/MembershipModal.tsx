"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Sparkles,
  X,
  Zap,
  CreditCard,
  Download,
  Receipt,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Member, Course, PlanTier, Invoice, PaymentGatewayConfig } from "@/lib/types";
import { MOCK_GATEWAY_CONFIG, MOCK_INVOICES } from "@/lib/school-mock";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  onUpdateTier: (newTier: "free" | "pro" | "vip") => void;
  courseToUnlock?: Course | null;
}

export function MembershipModal({
  isOpen,
  onClose,
  currentMember,
  onUpdateTier,
  courseToUnlock,
}: MembershipModalProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "invoices">("plans");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [selectedProvider, setSelectedProvider] = useState<"stripe" | "paypal">("stripe");
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>(MOCK_GATEWAY_CONFIG);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  // Checkout Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{
    invoiceNumber: string;
    description: string;
    amount: number;
    provider: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/gateways")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setGatewayConfig(data.config);
          if (data.config.active_gateways === "paypal" && !data.config.stripe_enabled) {
            setSelectedProvider("paypal");
          } else {
            setSelectedProvider("stripe");
          }
        }
      })
      .catch((err) => console.warn("Could not load gateway config:", err));
  }, []);

  if (!isOpen) return null;

  const handleCheckout = async (tier: "pro" | "vip", courseId?: string, isOneTimeCourse?: boolean) => {
    setIsProcessing(true);
    setCheckoutSuccess(null);

    try {
      const payload: any = {
        provider: selectedProvider,
        member_id: currentMember.id,
      };

      if (courseId && isOneTimeCourse) {
        payload.type = "course";
        payload.course_id = courseId;
        payload.interval = "one_time";
      } else {
        payload.type = "subscription";
        payload.tier = tier;
        payload.interval = billingInterval;
      }

      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setCheckoutSuccess({
          invoiceNumber: data.invoice_number || data.data?.invoiceNumber || "INV-2026-LIVE",
          description: data.description || (tier === "vip" ? "VIP Membership" : "Pro Membership"),
          amount: data.amount || (tier === "vip" ? 99 : 29),
          provider: selectedProvider,
        });

        // Optimistically upgrade member tier
        onUpdateTier(tier);

        // Append to invoice list
        const newInvoice: Invoice = {
          id: `inv_${Date.now()}`,
          invoice_number: data.invoice_number || `INV-${Date.now().toString().slice(-5)}`,
          member_id: currentMember.id,
          item_description: data.description || "Membership Subscription",
          amount: data.amount,
          currency: "USD",
          status: "paid",
          provider: selectedProvider,
          receipt_url: `https://school.akstack.com/invoices/${(data.invoice_number || "receipt").toLowerCase()}.pdf`,
          created_at: new Date().toISOString(),
        };
        setInvoices((prev) => [newInvoice, ...prev]);
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout submission error:", err);
      alert("Network error processing checkout session.");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free Builder",
      tagline: "Essential access to community discussions & foundation courses",
      priceMonth: "$0",
      priceYear: "$0",
      color: "border-[#E2E8F0] dark:border-slate-800",
      badge: "Community",
      features: [
        "Full access to General & Announcements spaces",
        "Agentic AI Foundations Masterclass (Free)",
        "Member directory profile & leveling badges",
        "10 Nova AI Study Buddy queries / day",
        "Community polls & calendar RSVP",
      ],
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro Creator",
      tagline: "For serious builders launching commercial AI agents & applications",
      priceMonth: "$29",
      priceYear: "$290",
      color: "border-blue-600 shadow-blue-500/10 shadow-xl relative ring-2 ring-blue-600",
      badge: "Most Popular",
      features: [
        "Everything in Free, plus:",
        "Full-Stack AI Application Engineering Masterclass",
        "Unlimited Nova AI Study Buddy queries",
        "Downloadable production Docker blueprints & prompts",
        "Private VIP Project Showcase & review channels",
        "Priority direct office hours support",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "vip",
      name: "VIP Lifetime",
      tagline: "All-access pass with 1-on-1 architecture teardowns",
      priceMonth: "$99",
      priceYear: "$990",
      color: "border-emerald-500/50 shadow-emerald-500/10 shadow-lg",
      badge: "Enterprise",
      features: [
        "Everything in Pro, plus:",
        "Executive Autonomous Systems Masterclass",
        "Lifetime access to all future masterclasses & labs",
        "Monthly 1-on-1 agent architecture teardowns with Akaash",
        "Custom domain white-labeling consulting",
        "Direct private Slack/Discord channel with Akaash",
      ],
      cta: "Claim VIP Access",
    },
  ];

  const showBothGateways = gatewayConfig.active_gateways === "both" && gatewayConfig.stripe_enabled && gatewayConfig.paypal_enabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                AKSchool Monetization & Access Engine
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Current Tier:{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                  {currentMember.plan_tier}
                </span>{" "}
                • Multi-Gateway Payments (Stripe & PayPal)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "plans"
                    ? "bg-white dark:bg-slate-700 text-[#0F172A] dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Plans & Courses
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "invoices"
                    ? "bg-white dark:bg-slate-700 text-[#0F172A] dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Invoices ({invoices.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Modal Notification */}
        {checkoutSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Payment Verified & Entitlement Activated!
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Receipt #{checkoutSuccess.invoiceNumber} • Paid ${checkoutSuccess.amount} via{" "}
                  {checkoutSuccess.provider.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutSuccess(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Plans & Course Checkout */}
        {activeTab === "plans" && (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Course-Specific Unlock Hero (If opened for a locked course) */}
            {courseToUnlock && (
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={courseToUnlock.cover_url}
                    alt={courseToUnlock.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-blue-300 dark:border-blue-700"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Unlocking Course
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {courseToUnlock.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Required Tier: <strong className="uppercase">{courseToUnlock.required_tier}</strong> • Or purchase standalone license
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheckout("pro", courseToUnlock.id, true)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    <span>
                      Buy Course Standalone (${courseToUnlock.pricing?.one_time_price || 149})
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Controls Bar: Monthly/Yearly Interval + Gateway Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/50 border border-[#E2E8F0] dark:border-slate-800">
              
              {/* Billing Frequency Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Billing:</span>
                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
                  <button
                    onClick={() => setBillingInterval("month")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      billingInterval === "month"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval("year")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      billingInterval === "year"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>Yearly</span>
                    <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      2 Mo. Free
                    </span>
                  </button>
                </div>
              </div>

              {/* Gateway Choice (SuperAdmin allows Stripe, PayPal, or Both) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Payment Gateway:</span>
                
                {gatewayConfig.stripe_enabled && (
                  <button
                    onClick={() => setSelectedProvider("stripe")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedProvider === "stripe"
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Stripe (Card / Apple Pay)</span>
                  </button>
                )}

                {gatewayConfig.paypal_enabled && (
                  <button
                    onClick={() => setSelectedProvider("paypal")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedProvider === "paypal"
                        ? "bg-amber-50 dark:bg-amber-950/60 border-amber-600 text-amber-700 dark:text-amber-300 ring-2 ring-amber-600/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black text-amber-600">PP</span>
                    <span>PayPal</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = currentMember.plan_tier === plan.id;
                const price = billingInterval === "year" ? plan.priceYear : plan.priceMonth;
                const period = billingInterval === "year" ? "per year" : "per month";

                return (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-2xl border bg-white dark:bg-slate-900/60 flex flex-col justify-between ${plan.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {plan.badge}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-4">
                        {plan.tagline}
                      </p>

                      <div className="mb-4">
                        <span className="text-3xl font-black text-[#0F172A] dark:text-white">
                          {price}
                        </span>
                        <span className="text-xs text-slate-500 ml-1.5">
                          /{plan.id === "free" ? "forever" : period}
                        </span>
                      </div>

                      <ul className="space-y-2 mb-6 text-xs text-[#475569] dark:text-slate-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleCheckout(plan.id as "pro" | "vip")}
                      disabled={isCurrent || isProcessing}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                          : plan.id === "pro"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                          : "bg-[#0F172A] hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : (
                        <>
                          <span>{plan.cta} via {selectedProvider.toUpperCase()}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Invoices & Receipts History */}
        {activeTab === "invoices" && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Payment History & Downloadable Receipts
                </h3>
                <p className="text-xs text-slate-500">
                  Export verified PDF invoices for expense reporting and corporate tax deduction.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Total Invoices: <strong className="text-slate-900 dark:text-white">{invoices.length}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600">
                          {inv.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {inv.provider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{inv.item_description}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ${inv.amount.toFixed(2)}
                    </span>
                    <a
                      href={inv.receipt_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-900/40 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit TLS encrypted transaction • Stripe & PayPal PCI-DSS Level 1 Compliant</span>
          </div>
          <span>14-day zero-risk money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}
