"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Lock, ArrowRight, Layers, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveActiveMember } from "@/lib/member-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@akstack.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Authenticate with real Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setErrorMessage(authError.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (!authData?.user) {
        setErrorMessage("Authentication failed. No user record returned.");
        setIsLoading(false);
        return;
      }

      // 2. Fetch authenticated member profile from database
      const { data: memberData, error: memberError } = await supabase
        .from("app_school_members")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (memberData) {
        saveActiveMember(memberData);
        localStorage.setItem("school_active_member_id", memberData.id);
        localStorage.setItem("school_active_member_role", memberData.role);
      } else {
        // Fallback profile if member row isn't synced yet
        const defaultProfile = {
          id: `mem_${authData.user.id.slice(0, 8)}`,
          community_id: "comm_akstack_001",
          user_id: authData.user.id,
          email: authData.user.email || email,
          full_name: authData.user.user_metadata?.full_name || "Builder Member",
          handle: authData.user.email?.split("@")[0] || "builder",
          avatar_url: authData.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: (authData.user.user_metadata?.role as any) || "member",
          level: 1,
          points: 100,
          plan_tier: "free" as const,
          created_at: new Date().toISOString()
        };
        saveActiveMember(defaultProfile);
        localStorage.setItem("school_active_member_id", defaultProfile.id);
        localStorage.setItem("school_active_member_role", defaultProfile.role);
      }

      router.push("/community");
    } catch (err: any) {
      console.error("Login exception:", err);
      setErrorMessage(err?.message || "An unexpected error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-[#E2E8F0] dark:border-slate-700">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">
                Sign In to AKSchool
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Access your discussions, classroom masterclasses & builder network
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Production Auth Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating with Supabase...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by Server-Verified Supabase Auth & RLS</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
