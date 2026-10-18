"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, Info } from "lucide-react";

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
  const [showIdentityHelp, setShowIdentityHelp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-10">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Lock className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">VEIL</span>
        </div>

        <button
          onClick={onOpenHowItWorks}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" />
          How it works
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-lg mx-auto w-full my-auto py-10 text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
          Messages that never touch a server.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          VEIL opens a direct connection between two browsers. What you send lives in memory and
          disappears when the tab closes — there is no chat database sitting behind it.
        </p>

        {/* Identity */}
        <div className="mt-8 p-5 glass-panel rounded-2xl text-left">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Display name
            </label>
            <button
              onClick={() => setShowIdentityHelp((v) => !v)}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-800 transition-colors"
            >
              {fingerprint}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              placeholder="Choose a name"
              className="w-full px-3.5 py-2 glass-input rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            {showIdentityHelp
              ? "Derived from this session's keys, so it changes each time you return. Read it aloud to your peer to confirm you're talking to the right person."
              : "Shared only with the peer you pair with."}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStart}
            className="flex-1 py-3.5 px-6 rounded-2xl btn-electric text-white text-sm font-semibold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Private Messaging</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={onExploreDemo}
            className="py-3.5 px-5 rounded-2xl glass-panel text-slate-700 hover:text-slate-900 text-sm font-semibold border border-white/80 hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            Try Interactive Sandbox
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-3xl mx-auto w-full text-center text-xs text-slate-400 py-3">
        Signaling is used to set up the connection only. Message content is never sent to it.
      </footer>
    </div>
  );
}
