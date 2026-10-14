"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Trash2,
  Lock,
  EyeOff,
  Bell,
  BellOff,
  Server,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";

interface SettingsScreenProps {
  onBack: () => void;
  onClearAllMemory: () => void;
  defaultTimer: number;
  setDefaultTimer: (s: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  fingerprint: string;
  safetyNumber: string;
}

export function SettingsScreen({
  onBack,
  onClearAllMemory,
  defaultTimer,
  setDefaultTimer,
  notificationsEnabled,
  setNotificationsEnabled,
  fingerprint,
  safetyNumber,
}: SettingsScreenProps) {
  const [clearedConfirm, setClearedConfirm] = useState(false);

  const handleClear = () => {
    onClearAllMemory();
    setClearedConfirm(true);
    setTimeout(() => setClearedConfirm(false), 2500);
  };

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto w-full p-4 sm:p-6">
      {/* Top Header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 mb-4 shadow-lg border border-white/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-sky-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-800">Settings & Privacy</h2>
            <p className="text-xs text-slate-500">Security Architecture & Ephemeral Controls</p>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Identity & Keys */}
        <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>Cryptographic Keys & Identity</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-white/70 rounded-2xl border border-sky-100">
              <span className="text-[10px] text-slate-400 font-medium block">Local Ephemeral Fingerprint</span>
              <span className="font-mono text-slate-800 font-semibold">{fingerprint}</span>
            </div>

            <div className="p-3 bg-white/70 rounded-2xl border border-sky-100">
              <span className="text-[10px] text-slate-400 font-medium block">Default Safety Verification Number</span>
              <span className="font-mono text-slate-800 font-semibold tracking-wider">{safetyNumber}</span>
            </div>
          </div>
        </div>

        {/* Default Disappearing Message Preference */}
        <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Default Disappearing Message Timer</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose how quickly new messages are destroyed from browser memory after being read:
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Off", val: 0 },
              { label: "30s", val: 30 },
              { label: "5m", val: 300 },
              { label: "1h", val: 3600 },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setDefaultTimer(item.val)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  defaultTimer === item.val
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-white/70 text-slate-700 border-sky-100 hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              {notificationsEnabled ? <Bell className="w-4 h-4 text-sky-600" /> : <BellOff className="w-4 h-4 text-slate-400" />}
              <span>In-App Sounds & Alerts</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Audio feedback when new P2P messages arrive</p>
          </div>

          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              notificationsEnabled ? "bg-sky-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                notificationsEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Honest Privacy Architecture Transparency */}
        <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Server className="w-4 h-4 text-sky-600" />
            <span>Honest Privacy Disclosures</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-white/60 p-3.5 rounded-2xl border border-sky-100/80">
            <p>
              &bull; <strong>No Central Message Database:</strong> Message contents are sent browser-to-browser via
              WebRTC DataChannels. VEIL servers never see, relay, or store plaintext or encrypted chat texts.
            </p>
            <p>
              &bull; <strong>Signaling & NAT Traversal:</strong> A lightweight signaling server and STUN/TURN servers
              are used exclusively to negotiate peer IP addresses. IP addresses may be visible to STUN/TURN relays.
            </p>
            <p>
              &bull; <strong>Offline Delivery:</strong> Because VEIL is strictly peer-to-peer with zero retention,
              messages cannot be delivered if the recipient is offline or closes their tab.
            </p>
            <p>
              &bull; <strong>Screenshot Reality:</strong> Disappearing messages delete memory from the browser, but
              cannot prevent external capture (e.g. taking a photo or screenshotting).
            </p>
          </div>
        </div>

        {/* Clear Volatile Memory */}
        <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Panic Wipe (Local RAM Purge)</span>
          </div>
          <p className="text-xs text-slate-500">
            Instantly wipe all active conversations, message queues, and peer handshake keys from volatile memory.
          </p>

          <button
            onClick={handleClear}
            className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {clearedConfirm ? (
              <>
                <Check className="w-4 h-4 text-rose-600" />
                <span>Volatile Memory Wiped Clean!</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Wipe All Active Chat Memory Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
