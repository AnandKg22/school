"use client";

import Link from "next/link";
import { Sparkles, Users, BookOpen, Layers, ArrowRight, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>CommunityOS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                by AKStack
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              AI-Native Community & Learning Platform
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/#features" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            Features
          </Link>
          <Link href="/community" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Community Feed</span>
          </Link>
          <Link href="/classroom" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Classroom</span>
          </Link>
          <Link href="/members" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            Members
          </Link>
          <Link href="/#pricing" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Open Community</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
