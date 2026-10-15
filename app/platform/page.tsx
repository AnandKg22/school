"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ShieldAlert,
  Server,
  Users,
  Activity,
  Layers,
  DollarSign,
  Cpu,
  Lock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Database
} from "lucide-react";

export default function PlatformDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Authentication required to access the Platform Control Center.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/v1/platform/metrics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Access Denied: Platform Super Admin privileges required.");
        } else {
          setError(`Error loading platform metrics: HTTP ${res.status}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err?.message || "Failed to contact platform telemetry service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Top Control Center Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  Level 3 • Super Admin
                </span>
                <span className="text-xs text-slate-400 font-mono">Dokploy Cluster Node</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                AKSchool Platform Control Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
            >
              Owner Console
            </Link>
          </div>
        </div>

        {error ? (
          <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-200">Access Restricted</h3>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all inline-block"
                >
                  Sign in with Super Admin Account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Tenants</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  {metrics?.totalTenants ?? "..."}
                </p>
                <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
                  Isolated RLS Prefix
                </span>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Platform Users</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  {metrics?.totalMembers ?? "..."}
                </p>
                <span className="text-[11px] font-semibold text-blue-400 mt-1 block">
                  {metrics?.subscribers?.pro ?? 0} Pro • {metrics?.subscribers?.vip ?? 0} VIP
                </span>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Platform MRR</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-3xl font-black text-emerald-400 mt-2">
                  {metrics?.estimatedMRR ?? "..."}
                </p>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                  Active Recurring Revenue
                </span>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>AI Subsystem</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </span>
                <p className="text-2xl font-black text-purple-400 mt-2">mimo-v2.6</p>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 block truncate">
                  Singapore Cluster Gateway
                </span>
              </div>
            </div>

            {/* Architecture Ledger */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>Multi-Tenant SaaS Boundary Status</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Database Isolation
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1">Strict RLS & Namespacing</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    All tables enforce <code className="text-indigo-300">app_school_*</code> prefixes and
                    evaluated against JWT <code className="text-indigo-300">auth.uid()</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Hosting Infrastructure
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1">Dokploy Traefik Edge</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Automated SSL on <code className="text-indigo-300">school.akstack.com</code> routed directly to
                    standalone container replica.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    AI Context Isolation
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1">Bearer-Scoped Grounding</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nova AI queries PostgreSQL strictly with caller session headers; no cross-tenant leakage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
