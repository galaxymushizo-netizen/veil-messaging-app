"use client";

import React, { useState } from "react";
import { Shield, Sparkles, Lock, ArrowRight, EyeOff, Cpu, RefreshCw, Key, CheckCircle } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  onExploreDemo: () => void;
  onOpenHowItWorks: () => void;
  userName: string;
  setUserName: (name: string) => void;
  fingerprint: string;
}

export function WelcomeScreen({
  onStart,
  onExploreDemo,
  onOpenHowItWorks,
  userName,
  setUserName,
  fingerprint,
}: WelcomeScreenProps) {
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-sky-700 bg-clip-text text-transparent">
              VEIL
            </span>
            <span className="ml-2 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200/60">
              P2P Protocol
            </span>
          </div>
        </div>

        <button
          onClick={onOpenHowItWorks}
          className="glass-panel-subtle px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 hover:text-sky-700 hover:border-sky-300 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Architecture & Transparency</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-8 text-center flex flex-col items-center">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sky-200 shadow-sm mb-6 text-xs text-sky-800 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
          Zero Cloud Storage &bull; Ephemeral Memory Only
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Your conversations. <br />
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your privacy.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          VEIL connects devices directly via WebRTC DataChannels. Messages live only in volatile RAM and vanish forever when closed. No central chat database exists.
        </p>

        {/* Identity Glass Card */}
        <div className="w-full mt-8 p-5 glass-panel rounded-3xl shadow-xl border border-white/80 text-left">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Your Ephemeral Identity
            </label>
            <span className="text-[11px] text-sky-600 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
              Fingerprint: {fingerprint}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={20}
                placeholder="Choose ephemeral display name"
                className="w-full px-3.5 py-2 glass-input rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Name is shared only with peers you authorize</span>
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3 h-3" /> Identity Ready
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStart}
            className="flex-1 py-3.5 px-6 rounded-2xl btn-electric text-white text-sm font-semibold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Private Messaging</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={onExploreDemo}
            className="py-3.5 px-5 rounded-2xl glass-panel text-slate-700 hover:text-sky-700 text-sm font-semibold border border-white/80 hover:border-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Try Interactive Sandbox</span>
          </button>
        </div>

        {/* Feature Pills */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md">
          <div className="p-3 rounded-2xl glass-panel-subtle text-center">
            <Cpu className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="text-xs font-semibold text-slate-800">Direct P2P</div>
            <div className="text-[10px] text-slate-500">No chat servers</div>
          </div>
          <div className="p-3 rounded-2xl glass-panel-subtle text-center">
            <Lock className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="text-xs font-semibold text-slate-800">DTLS/SCTP</div>
            <div className="text-[10px] text-slate-500">Encrypted wire</div>
          </div>
          <div className="p-3 rounded-2xl glass-panel-subtle text-center">
            <EyeOff className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="text-xs font-semibold text-slate-800">Zero Logs</div>
            <div className="text-[10px] text-slate-500">Volatile RAM</div>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 max-w-xl mx-auto w-full text-center text-xs text-slate-400 py-3">
        VEIL does not store messages or chat history. Real-time signaling facilitates the initial WebRTC handshake only.
      </footer>
    </div>
  );
}
