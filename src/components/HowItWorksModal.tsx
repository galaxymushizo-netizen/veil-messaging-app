"use client";

import React from "react";
import {
  ShieldCheck,
  Server,
  Lock,
  Cpu,
  Wifi,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">How VEIL Works</h3>
              <p className="text-xs text-slate-500">Peer-to-Peer Privacy Architecture & Transparency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 overflow-y-auto pr-1 text-xs text-slate-600 leading-relaxed">
          {/* Section 1: The Core Principle */}
          <div className="p-4 rounded-2xl bg-white/70 border border-sky-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-sky-600" />
              1. Zero Server-Side Chat Storage
            </h4>
            <p>
              Traditional chat apps (WhatsApp, Telegram, Messenger) rely on central cloud databases that hold your
              message backups, contact graphs, and metadata.
            </p>
            <p className="font-medium text-slate-800">
              VEIL has no central chat database. Messages are not saved in PostgreSQL, MySQL, or local IndexedDB by
              default. They exist strictly in RAM while the browser tab is open.
            </p>
          </div>

          {/* Section 2: Connection Lifecycle */}
          <div className="p-4 rounded-2xl bg-white/70 border border-sky-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              2. WebRTC DataChannel Handshake
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
              <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                <span className="font-bold text-sky-950 block mb-1">Step 1: Invite</span>
                <span>Peer A generates a temporary 6-digit code or QR code containing an ephemeral offer SDP.</span>
              </div>
              <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                <span className="font-bold text-sky-950 block mb-1">Step 2: Signaling</span>
                <span>The signaling API exchanges ICE network candidates and SDP answers without seeing messages.</span>
              </div>
              <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                <span className="font-bold text-sky-950 block mb-1">Step 3: Direct P2P</span>
                <span>Browsers link directly via DTLS/SCTP. The temporary signaling record is deleted.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Safety Numbers */}
          <div className="p-4 rounded-2xl bg-white/70 border border-sky-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              3. Safety Number Verification
            </h4>
            <p>
              Transport encryption (DTLS) secures data in transit, but to protect against an active adversary
              impersonating a peer, VEIL derives a deterministic 12-digit Safety Number. Compare this number with your
              friend in person or via telephone.
            </p>
          </div>

          {/* Section 4: Honest Security Disclaimers */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-950 space-y-2">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Honest Engineering Disclaimers
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>
                <strong>Server presence:</strong> We never claim there are &quot;zero servers&quot;. A lightweight
                signaling service and STUN servers are required to discover external IP addresses.
              </li>
              <li>
                <strong>Offline limits:</strong> Because there is no store-and-forward server holding your messages,
                the recipient must have their browser open to receive messages.
              </li>
              <li>
                <strong>Screenshots:</strong> Deleting a message or using a disappearing timer wipes volatile memory on
                both peers, but cannot wipe a photo or external screen capture.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-sky-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl btn-electric text-white text-xs font-semibold shadow-md"
          >
            I Understand &bull; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
