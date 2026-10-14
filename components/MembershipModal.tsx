"use client";

import { useState } from "react";
import { Check, Sparkles, X, Shield, Zap, Star } from "lucide-react";
import { Member } from "@/lib/types";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  onUpdateTier: (newTier: "free" | "pro" | "vip") => void;
}

export function MembershipModal({
  isOpen,
  onClose,
  currentMember,
  onUpdateTier,
}: MembershipModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      id: "free",
      name: "Free Builder",
      tagline: "Essential access to community discussions & foundation courses",
      price: "₹0",
      period: "forever",
      color: "border-slate-200 dark:border-slate-800",
      badge: "Community",
      features: [
        "Full access to General & Announcements spaces",
        "Agentic AI Foundations Masterclass (Free)",
        "Member directory profile & leveling badges",
        "10 Xiaomi MiMo AI Copilot queries / day",
        "Public discussion participation",
      ],
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro Creator",
      tagline: "For serious builders launching commercial AI agents & SaaS",
      price: "₹999",
      period: "per month",
      color: "border-amber-500 shadow-amber-500/10 shadow-xl relative ring-2 ring-amber-500",
      badge: "Most Popular",
      features: [
        "Everything in Free, plus:",
        "Full-Stack SaaS Platform Engineering Masterclass",
        "Unlimited Xiaomi MiMo AI Copilot queries",
        "Downloadable Dokploy Docker blueprints & prompts",
        "Private VIP Project Showcase & review channels",
        "Priority direct office hours support",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "vip",
      name: "VIP Lifetime",
      tagline: "All-access lifetime pass with 1-on-1 architecture reviews",
      price: "₹9,999",
      period: "one-time",
      color: "border-purple-500/50 shadow-purple-500/10 shadow-lg",
      badge: "Enterprise",
      features: [
        "Everything in Pro, plus:",
        "Lifetime access to all future courses & modules",
        "Monthly 1-on-1 agent architecture reviews",
        "Custom domain white-labeling consulting",
        "Direct Slack/Discord private channel with Akaash",
        "Verified VIP badge on member profile",
      ],
      cta: "Claim VIP Access",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Community Membership & Access Tiers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Tier:{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">
                  {currentMember.plan_tier}
                </span>{" "}
                • Select a tier to upgrade your entitlements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 3 Tier Cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentMember.plan_tier === plan.id;
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
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    {plan.tagline}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5">
                      /{plan.period}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    onUpdateTier(plan.id as "free" | "pro" | "vip");
                    onClose();
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                      : plan.id === "pro"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Instant activation • 100% money-back guarantee within 14 days • Simulated payment via internal entitlement ledger
        </div>
      </div>
    </div>
  );
}
