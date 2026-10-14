"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Shield,
  Clock,
  Sparkles,
  Settings,
  Lock,
  ChevronRight,
  Wifi,
  WifiOff,
  UserCheck,
  CheckCheck,
  Info,
} from "lucide-react";
import { Conversation } from "@/types/veil";

interface InboxScreenProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  userName: string;
  fingerprint: string;
  onOpenHowItWorks: () => void;
}

export function InboxScreen({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onOpenSettings,
  userName,
  fingerprint,
  onOpenHowItWorks,
}: InboxScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.peerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6">
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 mb-4 shadow-lg border border-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 leading-none">{userName}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ephemeral Client Active" />
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">ID: {fingerprint.slice(0, 9)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHowItWorks}
              className="p-2.5 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-sky-600 border border-sky-100 transition-all shadow-sm"
              title="Architecture and Transparency"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-sky-600 border border-sky-100 transition-all shadow-sm"
              title="Security & Privacy Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onNewChat}
              className="btn-electric px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Private Chat</span>
            </button>
          </div>
        </div>

        {/* Ephemeral Memory Alert Banner */}
        <div className="mt-4 pt-3 border-t border-sky-100/70 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Zero database storage. Chats exist only while this session is open.</span>
          </div>
          <span className="text-sky-700 font-medium">Memory: Active</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search peer conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-panel-subtle rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 border border-white/90 shadow-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredConversations.length === 0 ? (
          <div className="h-64 glass-panel rounded-3xl flex flex-col items-center justify-center p-6 text-center border border-white/80">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No active conversations</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Generate an invite code or scan a peer&apos;s QR to initiate a zero-trace direct connection.
            </p>
            <button
              onClick={onNewChat}
              className="mt-4 px-4 py-2 rounded-xl btn-electric text-xs font-medium text-white shadow-sm"
            >
              Start Direct Connection
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            const isConnected = conv.connectionStatus === "connected";
            const isConnecting = conv.connectionStatus === "connecting" || conv.connectionStatus === "waiting_for_peer";

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`glass-panel glass-card-interactive p-4 rounded-3xl cursor-pointer border flex items-center justify-between gap-3 ${
                  activeConversationId === conv.id ? "border-sky-400 ring-2 ring-sky-400/30 bg-white/90" : "border-white/90"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {conv.peerName.slice(0, 1).toUpperCase()}
                    </div>
                    {/* Status Dot */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isConnected
                          ? "bg-emerald-500"
                          : isConnecting
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-400"
                      }`}
                      title={`Status: ${conv.connectionStatus}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{conv.peerName}</h4>
                      {conv.connectionType === "demo-simulation" && (
                        <span className="text-[9px] uppercase tracking-wider font-semibold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
                          Sandbox
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMessage ? (
                        <span>
                          {lastMessage.isSelf ? "You: " : ""}
                          {lastMessage.text}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Direct channel open. Say hello...</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {lastMessage
                      ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Active"}
                  </span>
                  <div className="flex items-center gap-1">
                    {conv.disappearingTimerSeconds > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-100">
                        <Clock className="w-2.5 h-2.5" />
                        {conv.disappearingTimerSeconds < 60
                          ? `${conv.disappearingTimerSeconds}s`
                          : conv.disappearingTimerSeconds < 3600
                          ? `${conv.disappearingTimerSeconds / 60}m`
                          : "1h"}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
