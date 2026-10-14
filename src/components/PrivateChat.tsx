"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Clock,
  Trash2,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  Activity,
  Smile,
  AlertCircle,
  Check,
  CheckCheck,
  Flame,
} from "lucide-react";
import { Conversation, ChatMessage } from "@/types/veil";

interface PrivateChatProps {
  conversation: Conversation;
  onBack: () => void;
  onSendMessage: (text: string, expiresInSeconds: number) => void;
  onClearChat: () => void;
  onChangeTimer: (seconds: number) => void;
  onOpenDiagnostics: () => void;
  onOpenSafetyNumber: () => void;
  isPeerSafetyVerified: boolean;
}

const TIMER_OPTIONS = [
  { label: "Off", seconds: 0 },
  { label: "30s", seconds: 30 },
  { label: "5m", seconds: 300 },
  { label: "1h", seconds: 3600 },
];

const QUICK_EMOJIS = ["🔒", "✨", "👋", "🛡️", "🔥", "🤝", "🚀", "⚡"];

export function PrivateChat({
  conversation,
  onBack,
  onSendMessage,
  onClearChat,
  onChangeTimer,
  onOpenDiagnostics,
  onOpenSafetyNumber,
  isPeerSafetyVerified,
}: PrivateChatProps) {
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), conversation.disappearingTimerSeconds);
    setInputText("");
  };

  const isConnected = conversation.connectionStatus === "connected";

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-2 sm:p-4 md:p-6">
      {/* Top Chat Bar */}
      <div className="glass-panel rounded-3xl p-3.5 sm:p-4 mb-3 shadow-lg border border-white/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-sky-100 transition-colors shadow-sm"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {conversation.peerName.slice(0, 1).toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-800 truncate">{conversation.peerName}</h3>
              {conversation.connectionType === "demo-simulation" && (
                <span className="text-[9px] uppercase tracking-wider font-semibold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
                  Demo Peer
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                {isConnected ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <Wifi className="w-3 h-3" /> P2P Active
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center gap-0.5">
                    <Activity className="w-3 h-3 animate-spin" /> Handshaking...
                  </span>
                )}
              </span>
              <span>&bull;</span>
              <button
                onClick={onOpenSafetyNumber}
                className="hover:text-sky-700 font-mono text-[10px] flex items-center gap-1 underline underline-offset-2 decoration-sky-300"
              >
                {isPeerSafetyVerified ? (
                  <span className="text-emerald-600 font-sans font-medium flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Verified
                  </span>
                ) : (
                  <span>Verify Identity</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Disappearing timer selector */}
          <div className="relative">
            <button
              onClick={() => setShowTimerMenu(!showTimerMenu)}
              className={`p-2 rounded-2xl border transition-all text-xs flex items-center gap-1 shadow-sm ${
                conversation.disappearingTimerSeconds > 0
                  ? "bg-sky-50 border-sky-300 text-sky-700 font-semibold"
                  : "bg-white/70 border-sky-100 text-slate-600 hover:bg-white"
              }`}
              title="Disappearing messages timer"
            >
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="text-[11px] hidden sm:inline">
                {conversation.disappearingTimerSeconds === 0
                  ? "Timer"
                  : conversation.disappearingTimerSeconds < 60
                  ? `${conversation.disappearingTimerSeconds}s`
                  : conversation.disappearingTimerSeconds < 3600
                  ? `${conversation.disappearingTimerSeconds / 60}m`
                  : "1h"}
              </span>
            </button>

            {showTimerMenu && (
              <div className="absolute right-0 mt-2 w-44 glass-panel rounded-2xl p-2 shadow-xl border border-white/90 z-30">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Disappearing Messages</div>
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.seconds}
                    onClick={() => {
                      onChangeTimer(opt.seconds);
                      setShowTimerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      conversation.disappearingTimerSeconds === opt.seconds
                        ? "bg-sky-100/70 text-sky-800"
                        : "text-slate-700 hover:bg-white/80"
                    }`}
                  >
                    <span>{opt.label === "Off" ? "Off (Manual Clear)" : `Disappear after ${opt.label}`}</span>
                    {conversation.disappearingTimerSeconds === opt.seconds && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="p-2 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-sky-600 border border-sky-100 transition-colors shadow-sm"
            title="Inspect P2P WebRTC & Encryption Diagnostics"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Clear chat button */}
          <button
            onClick={onClearChat}
            className="p-2 rounded-2xl bg-white/70 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-sky-100 transition-colors shadow-sm"
            title="Wipe volatile chat memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Disappearing Timer Banner (if enabled) */}
      {conversation.disappearingTimerSeconds > 0 && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-sky-50/80 border border-sky-200/50 flex items-center justify-between text-xs text-sky-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-sky-600" />
            <span>
              Disappearing mode active: Messages self-destruct {conversation.disappearingTimerSeconds}s after receipt.
            </span>
          </div>
          <span className="text-[10px] text-sky-600/80 font-mono">RAM purged</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-4 sm:p-6 mb-3 shadow-inner border border-white/80 space-y-3.5">
        {/* Security Watermark Banner */}
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-white/60 border border-sky-100 text-center text-xs text-slate-500 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>End-to-End Transport Security (DTLS/SCTP)</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Direct peer-to-peer connection. Messages never touch central chat databases. Note: Message deletion cannot
            wipe screenshots or copies already captured by the recipient.
          </p>
        </div>

        {conversation.messages.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
            <Sparkles className="w-6 h-6 text-sky-400 mb-2 opacity-60" />
            <p>No messages yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Send a message to initiate direct P2P exchange.</p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"} animate-in fade-in-50 duration-200`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed relative ${
                    msg.isSelf
                      ? "btn-electric text-white rounded-br-xs"
                      : "bg-white/85 text-slate-800 border border-sky-100/90 rounded-bl-xs shadow-sky-900/5"
                  }`}
                >
                  <p className="break-words select-text">{msg.text}</p>

                  <div
                    className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] font-mono ${
                      msg.isSelf ? "text-sky-100/80" : "text-slate-400"
                    }`}
                  >
                    {msg.expiresInSeconds ? (
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-amber-300" />
                        {msg.expiresInSeconds}s
                      </span>
                    ) : null}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.isSelf && <CheckCheck className="w-3 h-3 text-sky-200" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Shelf */}
      {showEmojiPicker && (
        <div className="mb-2 p-2 glass-panel rounded-2xl border border-white/90 flex items-center gap-2 overflow-x-auto">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg p-1.5 hover:bg-white/80 rounded-xl transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="glass-panel rounded-3xl p-2 sm:p-2.5 shadow-lg border border-white/90 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-2xl text-slate-400 hover:text-sky-600 hover:bg-white/80 transition-colors"
          title="Insert Privacy Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${conversation.peerName} securely...`}
          className="flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-electric p-2.5 rounded-2xl text-white shadow-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
