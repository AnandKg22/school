"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Lock, ArrowRight, UserCheck, Layers, Eye, EyeOff } from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/school-mock";

export default function LoginPage() {
  const router = useRouter();
  const [selectedPersonaId, setSelectedPersonaId] = useState(MOCK_MEMBERS[0].id);
  const [password, setPassword] = useState("#Akaash22#");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMember = MOCK_MEMBERS.find((m) => m.id === selectedPersonaId) || MOCK_MEMBERS[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save active member to localStorage
    localStorage.setItem("school_active_member_id", selectedMember.id);
    localStorage.setItem("school_active_member_role", selectedMember.role);

    setTimeout(() => {
      router.push("/community");
    }, 400);
  };

  const handleSelectAccount = (memberId: string) => {
    setSelectedPersonaId(memberId);
    if (memberId === MOCK_MEMBERS[0].id) {
      setPassword("#Akaash22#");
    } else {
      setPassword("demo_builder_2026");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Sign In to CommunityOS
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access your discussions, classroom masterclasses & community network
              </p>
            </div>

            {/* Quick Demo Persona Switcher */}
            <div className="mb-6 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>Select Demo Account:</span>
                <span className="text-amber-500 font-semibold">1-Click Fast Auth</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MOCK_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectAccount(m.id)}
                    className={`p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2 ${
                      selectedPersonaId === m.id
                        ? "bg-amber-500 text-white font-bold shadow-sm"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <img
                      src={m.avatar_url}
                      alt={m.full_name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="truncate text-[11px]">{m.full_name.split(" ")[0]}</div>
                      <div className={`text-[9px] capitalize ${selectedPersonaId === m.id ? "text-amber-100" : "text-slate-400"}`}>
                        {m.role === "owner" ? "Super Admin" : m.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active Member Persona
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={selectedMember.avatar_url}
                    alt={selectedMember.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30"
                  />
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedMember.full_name}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold capitalize flex items-center gap-1">
                      <span>{selectedMember.role === "owner" ? "Master Super Admin" : selectedMember.role}</span>
                      <span className="text-slate-400">• Level {selectedMember.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Community Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                ← Return to Public Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
