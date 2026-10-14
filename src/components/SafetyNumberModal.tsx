"use client";

import React, { useState } from "react";
import { ShieldCheck, Copy, Check, Users, QrCode, Sparkles } from "lucide-react";

interface SafetyNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  safetyNumber: string;
  myFingerprint: string;
  peerFingerprint: string;
  onMarkVerified?: () => void;
  isVerified?: boolean;
}

export function SafetyNumberModal({
  isOpen,
  onClose,
  peerName,
  safetyNumber,
  myFingerprint,
  peerFingerprint,
  onMarkVerified,
  isVerified = false,
}: SafetyNumberModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Verify Safety Number</h3>
              <p className="text-xs text-slate-500">End-to-End Peer Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            To confirm that your direct peer-to-peer session with <span className="font-semibold text-slate-900">{peerName}</span> is not intercepted, compare this numeric code with their screen:
          </p>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200/70 text-center relative group">
            <div className="text-2xl font-mono font-bold tracking-widest text-sky-950 py-1">
              {safetyNumber}
            </div>
            <button
              onClick={handleCopy}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-sky-700 bg-white/80 hover:bg-white rounded-lg border border-sky-200/80 transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white/60 p-3 rounded-xl border border-sky-100">
            <div>
              <span className="block text-[10px] text-slate-400 font-sans">Your Key Fingerprint</span>
              <span className="text-slate-800 font-medium">{myFingerprint}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-sans">{peerName}&apos;s Fingerprint</span>
              <span className="text-slate-800 font-medium">{peerFingerprint || "Ephemeral"}</span>
            </div>
          </div>

          <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-100 text-[11px] text-slate-600 space-y-1">
            <div className="font-medium text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              How it works
            </div>
            <p>
              If the safety numbers match on both devices, your encryption keys are mathematically identical and no intermediary can tamper with your messages.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              if (onMarkVerified) onMarkVerified();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric text-white shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            {isVerified ? "Verified" : "Mark as Verified"}
          </button>
        </div>
      </div>
    </div>
  );
}
