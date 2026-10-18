"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Invite",
    body: "You make a six-character code or QR. It carries a WebRTC offer — no messages, no address book, no history.",
  },
  {
    title: "Handshake",
    body: "The server relays the offer, answer and ICE candidates so the two browsers can find each other. It never receives message content.",
  },
  {
    title: "Direct",
    body: "The browsers connect over DTLS/SCTP and the signaling record is deleted. Everything sent after that skips the server entirely.",
  },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">How it works</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Where your messages travel — and where they don&apos;t.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5 overflow-y-auto pr-1 text-xs text-slate-600 leading-relaxed">
          {/* The three steps, as a sequence rather than repeated cards */}
          <ol className="relative border-l border-sky-200 ml-1.5 space-y-5 pl-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[30.5px] top-0 w-5 h-5 rounded-full bg-white border border-sky-200 text-[10px] font-bold text-sky-700 flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="text-sm font-bold text-slate-800">{step.title}</div>
                <p className="mt-1">{step.body}</p>
              </li>
            ))}
          </ol>

          {/* Safety numbers */}
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold text-slate-800">Safety numbers.</span> Every session
              shows a twelve-digit number derived from your keys. Read it to each other over the
              phone or in person — that is what proves nobody is sitting in the middle.
            </p>
          </div>

          {/* Limitations — stated plainly, without labelling itself as a disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-950 space-y-2">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Where this falls short
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
              <li>
                A signaling service and STUN servers are required to set up the connection, so this
                is not &quot;zero servers&quot;.
              </li>
              <li>
                There is no TURN relay. On networks that block direct connections, pairing will
                fail rather than fall back to a third-party relay.
              </li>
              <li>
                Nothing is stored or forwarded — the other person needs their tab open to receive
                anything.
              </li>
              <li>
                Deleting a message clears memory on both devices, but it cannot erase a photo of
                the screen.
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
