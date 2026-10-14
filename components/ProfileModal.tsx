"use client";

import { useState } from "react";
import { User, Mail, Shield, Check, X, Camera, Eye, Lock } from "lucide-react";
import { Member } from "@/lib/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onSave: (updated: Partial<Member>) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  member,
  onSave,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(member.full_name);
  const [handle, setHandle] = useState(member.handle);
  const [bio, setBio] = useState(member.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url);
  const [isPublic, setIsPublic] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      full_name: fullName.trim(),
      handle: handle.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Member Profile Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your public bio, avatar, and visibility settings
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Full Name & Handle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400">@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bio / Expertise
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you building? e.g. Autonomous AI agents, SaaS on Supabase..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Profile Visibility toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {isPublic ? (
                <Eye className="w-4 h-4 text-emerald-500" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Directory Visibility
                </p>
                <p className="text-[11px] text-slate-500">
                  {isPublic
                    ? "Visible in Community Members Directory"
                    : "Private (Hidden from non-admins)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                isPublic
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </button>
          </div>

          {/* Role & Level Pill */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              Role:{" "}
              <strong className="text-slate-900 dark:text-white capitalize">
                {member.role === "owner" ? "Super Admin" : member.role}
              </strong>
            </span>
            <span>
              Level: <strong className="text-amber-500">Lvl {member.level}</strong> ({member.points} pts)
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
