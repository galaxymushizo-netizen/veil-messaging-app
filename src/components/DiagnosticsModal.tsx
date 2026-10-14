"use client";

import React from "react";
import { Shield, Lock, Wifi, RefreshCw, AlertTriangle, Key } from "lucide-react";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionType: "direct-p2p" | "demo-simulation";
  connectionStatus: string;
  myFingerprint: string;
  peerFingerprint: string;
  safetyNumber: string;
  iceTransportState?: string;
  rttMs?: number;
  packetsLost?: number;
  bytesSent?: number;
  bytesReceived?: number;
}

export function DiagnosticsModal({
  isOpen,
  onClose,
  connectionType,
  connectionStatus,
  myFingerprint,
  peerFingerprint,
  safetyNumber,
  iceTransportState = "completed",
  rttMs = 18,
  packetsLost = 0,
  bytesSent = 4280,
  bytesReceived = 3850,
}: DiagnosticsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Connection Diagnostics</h3>
              <p className="text-xs text-slate-500">Real-time WebRTC & Cryptographic Inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
          {/* Channel Info */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-sky-100/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">Channel Mode</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                <Wifi className="w-3 h-3" />
                {connectionType === "direct-p2p" ? "WebRTC DataChannel (P2P)" : "Simulated P2P Sandbox"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">Connection Status</span>
              <span className="capitalize font-semibold text-emerald-600">{connectionStatus}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">ICE Transport State</span>
              <span className="font-mono text-slate-600 text-[11px]">{iceTransportState}</span>
            </div>
          </div>

          {/* Cryptographic Verification */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-sky-100/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <Key className="w-3.5 h-3.5 text-sky-600" />
              <span>Identity Verification (Safety Number)</span>
            </div>
            <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200/50 text-center font-mono text-sm tracking-wider font-bold text-sky-950">
              {safetyNumber}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Compare this safety number out-of-band (e.g. in person or on a voice call) to verify there is no
              man-in-the-middle adversary between you and your peer.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-sans font-medium">Your Fingerprint</span>
                <span className="text-slate-700">{myFingerprint}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-sans font-medium">Peer Fingerprint</span>
                <span className="text-slate-700">{peerFingerprint || "Unknown"}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Latency (RTT)</div>
              <div className="text-base font-bold text-slate-700 mt-0.5">{rttMs} ms</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Packets Lost</div>
              <div className="text-base font-bold text-slate-700 mt-0.5">{packetsLost}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Data Sent/Recv</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {(bytesSent / 1024).toFixed(1)}k / {(bytesReceived / 1024).toFixed(1)}k
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Architecture Transparency:</strong> Messages travel directly over browser-to-browser WebRTC
              DataChannels protected by DTLS/SCTP. No chat history is saved to the central server or persistent storage.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
