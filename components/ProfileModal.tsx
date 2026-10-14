"use client";

import { useState, useRef } from "react";
import { User, Check, X, Camera, Eye, Lock, Flame, Calendar, Award, Globe, Users } from "lucide-react";
import { Member } from "@/lib/types";
import { ImageCropperModal } from "./ImageCropperModal";

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
  const [activeTab, setActiveTab] = useState<"card" | "edit">("card");
  const [fullName, setFullName] = useState(member.full_name);
  const [handle, setHandle] = useState(member.handle);
  const [bio, setBio] = useState(member.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url);
  const [isPublic, setIsPublic] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Image upload & crop state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawImageSrc(reader.result);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
  };

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

  // Generate simulated activity heatmap matrix (12 months x 4 weeks x 7 days)
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const days = ["Mon", "Wed", "Fri", "Sun"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("card")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "card"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              Public Profile & Heatmap
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              Edit Details
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "card" ? (
            <div className="space-y-6">
              {/* Profile Card View (Exact match to Skool Screenshot 3) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left/Middle Column: Heatmap & Memberships */}
                <div className="md:col-span-7 space-y-5">
                  {/* Activity Heatmap Card */}
                  <div className="p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0F172A] dark:text-white">Activity</span>
                    </div>

                    {/* Months header */}
                    <div className="flex justify-between text-[10px] text-slate-400 px-7 mb-1.5">
                      {months.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex gap-1.5">
                      <div className="flex flex-col justify-between text-[9px] text-slate-400 py-0.5">
                        {days.map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                      <div className="grid grid-flow-col grid-rows-4 gap-1 flex-1">
                        {Array.from({ length: 48 }).map((_, i) => {
                          const isActive = i === 14 || i === 22 || i === 31 || i === 47 || i === 46;
                          return (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-[2px] ${
                                isActive
                                  ? "bg-emerald-500 shadow-2xs"
                                  : "bg-slate-200/80 dark:bg-slate-700/60"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="hover:underline cursor-pointer">What is this?</span>
                      <div className="flex items-center gap-1">
                        <span>Less</span>
                        <div className="w-2 h-2 rounded-[1px] bg-slate-200 dark:bg-slate-700" />
                        <div className="w-2 h-2 rounded-[1px] bg-emerald-200 dark:bg-emerald-900" />
                        <div className="w-2 h-2 rounded-[1px] bg-emerald-400" />
                        <div className="w-2 h-2 rounded-[1px] bg-emerald-600" />
                        <span>More</span>
                      </div>
                    </div>
                  </div>

                  {/* Memberships Section */}
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white mb-2">Memberships</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center gap-2.5 shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          AK
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">AKSchool Builders</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">1,248 • {member.plan_tier.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center gap-2.5 shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          AI
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">AI Engineering Lab</div>
                          <div className="text-[10px] text-slate-400">470k • Free</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Member Identity Box */}
                <div className="md:col-span-5 p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-600/30 shadow-md"
                    />
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {member.level}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white">
                    {member.full_name}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    @{member.handle}
                  </p>

                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-3 leading-relaxed text-left">
                    {member.bio || "Member of AKSchool AI Builders Club."}
                  </p>

                  <div className="w-full mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 text-left space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Active 21m ago</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Joined Mar 10, 2024</span>
                    </div>
                  </div>

                  {/* 3 Stats Row */}
                  <div className="w-full mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-3 text-center">
                    <div>
                      <div className="text-sm font-extrabold text-[#0F172A] dark:text-white">11</div>
                      <div className="text-[10px] text-slate-400">Contributions</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[#0F172A] dark:text-white">0</div>
                      <div className="text-[10px] text-slate-400">Followers</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[#0F172A] dark:text-white">2</div>
                      <div className="text-[10px] text-slate-400">Following</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-800">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer shrink-0"
                    title="Click to upload and crop a new photo"
                  >
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-600/30 group-hover:ring-blue-600 transition-all shadow-md"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Crop Photo</span>
                    </div>
                    <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                      <Camera className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload & Crop Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAvatarUrl(
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Reset Default
                      </button>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      Click the avatar or button to upload from your device. You can crop, zoom, and rotate before saving.
                    </p>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                    Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400">@</span>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 mb-1">
                  Bio / Expertise
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you building? e.g. Autonomous AI agents, full-stack systems..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                      Directory Visibility
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Visible in AKSchool Members Directory
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Public
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Back to Profile
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
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
          )}
        </div>
      </div>

      {/* Interactive Avatar Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
