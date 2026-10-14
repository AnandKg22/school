"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot, User, CheckCircle, RefreshCw, Cpu, ExternalLink } from "lucide-react";

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
      text: "👋 Hi! I am the **AKStack CommunityOS AI Copilot**, powered by **Xiaomi MiMo AI** (`mimo-v2.6-flash`).\n\nI can answer questions about community discussions, classroom courses, autonomous agent architectures, or platform setup. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState("mimo-v2.6-flash");

  if (!isOpen) return null;

  const quickPrompts = [
    "What courses are available in the Classroom?",
    "How does the Agentic Loop (Sense, Plan, Act) work?",
    "What are the community guidelines?",
    "Explain Dokploy VPS & Supabase RLS isolation",
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
        body: JSON.stringify({
          question: q,
          customModel: selectedModel,
        }),
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
      <div className="w-full max-w-2xl h-[650px] max-h-[90vh] glass-panel bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>MiMo Knowledge Copilot</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Singapore Gateway Live</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Trained on Community discussions, masterclasses, and code blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Model Settings"
            >
              <Cpu className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Bar */}
        {showSettings && (
          <div className="px-5 py-3 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-mono"
              >
                <option value="mimo-v2.6-flash">mimo-v2.6-flash (Fast Reasoning)</option>
                <option value="mimo-v2.6-pro">mimo-v2.6-pro (Deep Thought)</option>
                <option value="mimo-v2.6-pro-ultraspeed">mimo-v2.6-pro-ultraspeed</option>
              </select>
            </div>
            <a
              href="https://platform.xiaomimimo.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Xiaomi MiMo Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-amber-500 text-white rounded-br-none shadow-md shadow-amber-500/20 font-medium"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.reasoning && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    💡 Reasoning: {m.reasoning.slice(0, 160)}...
                  </div>
                )}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === "user" ? "text-amber-100" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>MiMo AI is reasoning with grounded context...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none bg-slate-50/30 dark:bg-slate-950/20">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-1 whitespace-nowrap hover:border-amber-400 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
              placeholder="Ask anything about courses, agent architecture, or community rules..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
