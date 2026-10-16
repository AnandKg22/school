"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CommunityHeader } from "@/components/CommunityHeader";
import { AiCopilotModal } from "@/components/AiCopilotModal";
import { ProfileModal } from "@/components/ProfileModal";
import {
  MessageCircle,
  Search,
  Send,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
  Code2,
  Users,
  User,
  Shield,
  Flame,
  Award,
  ExternalLink,
  ChevronRight,
  Info,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";
import { MOCK_CONVERSATIONS, MOCK_MEMBERS } from "@/lib/school-mock";
import { Conversation, DirectMessage, Member } from "@/lib/types";
import { getActiveMember, subscribeToMemberUpdates } from "@/lib/member-storage";

export default function MessagesHubPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberIntel, setShowMemberIntel] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [memberPickerSearch, setMemberPickerSearch] = useState("");
  const [selectedProfileMember, setSelectedProfileMember] = useState<Member | null>(null);

  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const active = getActiveMember();
    setCurrentMember(active || MOCK_MEMBERS[0]);
    const unsubscribe = subscribeToMemberUpdates((updated) => {
      setCurrentMember(updated || MOCK_MEMBERS[0]);
    });
    return () => unsubscribe();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, activeConversation?.messages]);

  // Mark active conversation messages as read
  useEffect(() => {
    if (activeConvId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, unread_count: 0 } : c))
      );
    }
  }, [activeConvId]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      sender_id: currentMember?.id || "usr_admin_001",
      receiver_id: activeConversation.participant.id,
      content: messageText.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            last_message: newMsg,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageText("");
  };

  // Start new chat with member
  const handleStartChatWithMember = (member: Member) => {
    const existing = conversations.find((c) => c.participant.id === member.id);
    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        participant: member,
        last_message: {
          id: `dm_init_${Date.now()}`,
          sender_id: currentMember?.id || "usr_admin_001",
          receiver_id: member.id,
          content: "👋 Started a new direct conversation",
          created_at: new Date().toISOString(),
          is_read: true,
        },
        unread_count: 0,
        messages: [],
      };
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
    }
    setShowNewChatModal(false);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.participant.full_name.toLowerCase().includes(q) ||
      (c.participant.handle && c.participant.handle.toLowerCase().includes(q)) ||
      c.last_message.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-slate-100 flex flex-col h-screen overflow-hidden">
      <CommunityHeader
        onOpenAiCopilot={() => setIsAiOpen(true)}
      />

      {/* Main Split-Pane Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-4 overflow-hidden">
        {/* ================================================================= */}
        {/* LEFT COLUMN: CONVERSATIONS LIST & SEARCH                          */}
        {/* ================================================================= */}
        <div className="w-full sm:w-80 md:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shrink-0 shadow-xs overflow-hidden">
          {/* Top Search & New Message Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Direct Messages</span>
              </h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Start New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const formattedTime = new Date(conv.last_message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.participant.avatar_url}
                        alt={conv.participant.full_name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.participant.full_name}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formattedTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.last_message.content}
                      </p>
                    </div>

                    {/* Unread Pill */}
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER COLUMN: ACTIVE CHAT CANVAS & COMPOSER                      */}
        {/* ================================================================= */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div
                  onClick={() => setSelectedProfileMember(activeConversation.participant)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={activeConversation.participant.avatar_url}
                      alt={activeConversation.participant.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {activeConversation.participant.full_name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Lvl {activeConversation.participant.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {activeConversation.participant.role} • Active in Community
                    </p>
                  </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProfileMember(activeConversation.participant)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold hidden sm:flex items-center gap-1.5"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => setShowMemberIntel(!showMemberIntel)}
                    className={`p-2 rounded-xl border transition-colors ${
                      showMemberIntel
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                    }`}
                    title="Toggle Member Dossier Panel"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConversation.messages.map((msg) => {
                  const isMine = msg.sender_id === (currentMember?.id || "usr_admin_001");
                  const time = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      {!isMine && (
                        <img
                          src={activeConversation.participant.avatar_url}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover mb-1 shrink-0"
                        />
                      )}

                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1 ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] ${
                            isMine ? "text-blue-200" : "text-slate-400"
                          }`}
                        >
                          <span>{time}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <textarea
                      rows={2}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Message ${activeConversation.participant.full_name}... (Press Enter to send)`}
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none p-1"
                    />

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Attach Code Blueprint"
                          onClick={() => setMessageText((prev) => prev + " ```ts\n// Code snippet\n```")}
                        >
                          <Code2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Attach Attachment"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageCircle className="w-12 h-12 mb-3 opacity-40 text-blue-500" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                Select a conversation to start chatting
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Exchange code snippets, collaborate on lessons, and chat with community members.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: COLLAPSIBLE MEMBER DOSSIER / INTEL                  */}
        {/* ================================================================= */}
        {showMemberIntel && activeConversation && (
          <div className="hidden lg:flex w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex-col justify-between shrink-0 shadow-xs overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Avatar & Headline */}
              <div className="text-center space-y-2">
                <img
                  src={activeConversation.participant.avatar_url}
                  alt={activeConversation.participant.full_name}
                  className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-blue-500/20 shadow-md"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activeConversation.participant.full_name}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    @{activeConversation.participant.handle}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  {activeConversation.participant.bio || "Active community engineer building autonomous AI agents."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Level</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{activeConversation.participant.level}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
                  <p className="text-sm font-black text-rose-500 flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>9d</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Points</span>
                  <p className="text-sm font-black text-amber-500">{activeConversation.participant.points}</p>
                </div>
              </div>

              {/* Quick Profile Links */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </span>
                <button
                  onClick={() => setSelectedProfileMember(activeConversation.participant)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>View Full Trophy Room</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <Link
                  href="/classroom"
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Study Masterclass With Peer</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Shield Verified Footer */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Verified AKSchool Member</span>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* START NEW CHAT MEMBER PICKER MODAL                                */}
      {/* ================================================================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Start a New Direct Message
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by member name or handle..."
                value={memberPickerSearch}
                onChange={(e) => setMemberPickerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
              {MOCK_MEMBERS.filter((m) =>
                m.full_name.toLowerCase().includes(memberPickerSearch.toLowerCase())
              ).map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleStartChatWithMember(member)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors"
                >
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {member.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {member.role} • Level {member.level}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedProfileMember && (
        <ProfileModal
          isOpen={true}
          onClose={() => setSelectedProfileMember(null)}
          member={selectedProfileMember}
          onSave={() => {}}
        />
      )}

      {/* Nova AI Copilot Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
