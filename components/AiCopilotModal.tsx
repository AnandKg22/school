"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot, User, RefreshCw } from "lucide-react";
import { MarkdownViewer } from "./MarkdownViewer";

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  reasoning?: string;
  timestamp: string;
}

export function AiCopilotModal({ isOpen, onClose }: AiCopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_welcome",
      sender: "ai",
      text: "👋 Hi! I am **Nova**, your **AKSchool AI Study Buddy** 🤖✨.\n\nI can answer questions about community discussions, classroom masterclasses, autonomous agent loops, or code blueprints. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "What courses are available in the Classroom?",
    "How does the Agentic Loop (Sense, Plan, Act, Observe) work?",
    "What are the AKSchool community guidelines?",
    "How do I structure resilient tool calling pipelines?",
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.answer || "I could not retrieve an answer at this moment.",
        reasoning: data.reasoning,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: "ai",
          text: "⚠️ Network connectivity issue. Please try again or explore the Classroom tabs.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[650px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E2E8F0] dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span>Nova AI • AKSchool Study Buddy</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready to Help</span>
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Trained on AKSchool masterclasses, discussions, and code architectures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#2563EB] text-white rounded-br-none shadow-md shadow-blue-600/20 font-medium"
                    : "bg-white dark:bg-slate-800 text-[#0F172A] dark:text-slate-100 rounded-bl-none border border-[#E2E8F0] dark:border-slate-700 shadow-sm"
                }`}
              >
                {m.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <MarkdownViewer content={m.text} />
                )}

                {m.reasoning && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    💡 Reasoning: {m.reasoning.slice(0, 160)}...
                  </div>
                )}
                <div
                  className={`text-[9px] mt-2 text-right ${
                    m.sender === "user" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-500 border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Nova is researching community knowledge...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[#E2E8F0] dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none bg-[#F8FAFC] dark:bg-slate-950/40">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-full px-3 py-1 whitespace-nowrap hover:border-blue-400 transition-colors shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nova about lessons, agent architecture, or blueprints..."
              className="flex-1 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-4 py-2.5 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
