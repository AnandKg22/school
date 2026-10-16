"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  MessageCircle,
  Search,
  ArrowLeft,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
  Sparkles,
  User,
  Shield
} from "lucide-react";
import { Conversation, DirectMessage, Member } from "@/lib/types";
import { MOCK_CONVERSATIONS } from "@/lib/school-mock";

interface DirectMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember?: Member | null;
  initialParticipantId?: string;
}

export const DirectMessagesDrawer: React.FC<DirectMessagesDrawerProps> = ({
  isOpen,
  onClose,
  currentMember,
  initialParticipantId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialParticipantId) {
      const target = conversations.find(
        (c) => c.participant.id === initialParticipantId || c.id === initialParticipantId
      );
      if (target) {
        setActiveConvId(target.id);
      }
    }
  }, [initialParticipantId, conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    if (activeConvId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConvId, activeConversation?.messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      sender_id: currentMember?.id || "usr_admin_001",
      receiver_id: activeConversation?.participant.id || "usr_sarah_002",
      content: messageText.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
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

  const filteredConversations = conversations.filter((c) =>
    c.participant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-950/60">
          {activeConversation ? (
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveConvId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Back to conversation list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative shrink-0">
                <img
                  src={activeConversation.participant.avatar_url}
                  alt={activeConversation.participant.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white truncate flex items-center gap-1.5">
                  <span>{activeConversation.participant.full_name}</span>
                  {activeConversation.participant.role === "admin" && (
                    <Shield className="w-3.5 h-3.5 text-blue-600 fill-current" />
                  )}
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  Active now
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A] dark:text-white">
                  Direct Messages
                </h3>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                  Private 1-on-1 chats with fellow builders
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {activeConversation ? (
          /* Active Chat Thread */
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
            {/* Messages History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]/50 dark:bg-slate-950/20">
              {activeConversation.messages.map((msg) => {
                const isMe =
                  msg.sender_id === currentMember?.id ||
                  msg.sender_id === "usr_admin_001" ||
                  msg.sender_id === "444c72a0-a67c-4508-aa9e-999aace40835";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-100 rounded-bl-xs"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {msg.is_read ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${activeConversation.participant.full_name}...`}
                className="flex-1 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-600/20 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Conversation List */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Box */}
            <div className="p-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No conversations match your search.
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3 group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participant.avatar_url}
                        alt={conv.participant.full_name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-blue-500/40 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] dark:text-white group-hover:text-blue-600 transition-colors truncate">
                          {conv.participant.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 truncate mt-0.5">
                        {conv.last_message.content}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
