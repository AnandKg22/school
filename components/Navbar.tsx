"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, BookOpen, Layers, ArrowRight, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";
import { Member } from "@/lib/types";

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  useEffect(() => {
    // Check initial Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (authed) {
        setCurrentMember(getActiveMember());
      } else {
        setCurrentMember(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (authed) {
        setCurrentMember(getActiveMember());
      } else {
        setCurrentMember(null);
      }
    });

    const unsubMember = subscribeToMemberUpdates((member) => {
      setCurrentMember(member);
      if (member) setIsAuthenticated(true);
    });

    return () => {
      subscription.unsubscribe();
      unsubMember();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <span>AKSchool</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AI Academy
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium hidden sm:block">
              Community, Learning & Memberships
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#475569] dark:text-slate-300">
          <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Features
          </Link>
          <Link href="/community" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Community</span>
          </Link>
          <Link href="/classroom" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Classroom</span>
          </Link>
          <Link href="/members" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Members
          </Link>
          <Link href="/#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/community"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#475569] dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition-colors"
              >
                {currentMember?.avatar_url ? (
                  <img
                    src={currentMember.avatar_url}
                    alt={currentMember.full_name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500"
                  />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                <span className="hidden sm:inline font-bold">
                  {currentMember?.full_name?.split(" ")[0] || "Dashboard"}
                </span>
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Open Community</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold text-[#475569] dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?redirect=/community"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Open Community</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
