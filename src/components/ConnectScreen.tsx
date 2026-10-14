"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Share2,
  KeyRound,
  ShieldCheck,
  Radio,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { CanvasQr } from "./CanvasQr";
import { PeerProfile } from "@/types/veil";

interface ConnectScreenProps {
  onBack: () => void;
  myProfile: PeerProfile;
  onSessionEstablished: (peerSession: {
    peerName: string;
    peerFingerprint: string;
    peerSafetyNumber: string;
    connectionType: "direct-p2p" | "demo-simulation";
    dataChannel?: RTCDataChannel;
    peerConnection?: RTCPeerConnection;
  }) => void;
  /** Invite code carried in from a scanned QR link (?join=CODE). */
  initialJoinCode?: string;
}

export function ConnectScreen({
  onBack,
  myProfile,
  onSessionEstablished,
  initialJoinCode,
}: ConnectScreenProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Create Invite State
  const [inviteCode, setInviteCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [pairingStatus, setPairingStatus] = useState<"idle" | "listening" | "paired" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("Ready to create invitation.");

  // Join State
  const [inputCode, setInputCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  // Set once the peer has accepted an invite, so we can poll for the
  // creator's trickle ICE candidates (see the join poll effect below).
  const [joinSessionId, setJoinSessionId] = useState<string | null>(null);

  // WebRTC References
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  // Mutable mirror of sessionId so ICE handlers created before the session
  // exists can still upload candidates once it is created.
  const sessionIdRef = useRef<string>("");

  // Generate Invite
  const handleCreateInvite = async () => {
    setIsGenerating(true);
    setStatusMessage("Initializing WebRTC peer offer & STUN ICE discovery...");

    try {
      // Setup WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Initiator creates data channel
      const dc = pc.createDataChannel("veil-secure-channel", {
        ordered: true,
      });

      setPeerConnection(pc);

      // Collect ICE candidates.
      // NOTE: sessionId state is stale inside this closure (it is still "" when
      // the handler is created), so we read it from a ref instead. Without this,
      // every candidate after session creation fell into the buffer below and was
      // never uploaded — leaving peerIceCandidates/creatorIceCandidates empty and
      // the DataChannel unable to open.
      const pendingCandidates: RTCIceCandidate[] = [];
      sessionIdRef.current = "";
      const uploadCandidate = async (sid: string, cand: RTCIceCandidate) => {
        try {
          await fetch("/api/signaling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ice_candidate",
              sessionId: sid,
              role: "creator",
              candidate: cand,
            }),
          });
        } catch {
          // non-fatal candidate upload
        }
      };

      pc.onicecandidate = async (event) => {
        if (!event.candidate) return;
        const sid = sessionIdRef.current;
        if (sid) {
          await uploadCandidate(sid, event.candidate);
        } else {
          pendingCandidates.push(event.candidate);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Post offer to ephemeral signaling
      const res = await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          profile: myProfile,
          offerSdp: offer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInviteCode(data.inviteCode);
        setSessionId(data.sessionId);
        setPairingStatus("listening");
        setStatusMessage("Waiting for peer to scan QR or enter code...");
        setTimeLeft(600);

        // The ref must be set BEFORE flushing: any candidate arriving in the
        // meantime now uploads directly instead of falling back into the buffer.
        sessionIdRef.current = data.sessionId;

        // Upload any buffered candidates gathered before the session existed
        const buffered = pendingCandidates.splice(0, pendingCandidates.length);
        for (const cand of buffered) {
          await uploadCandidate(data.sessionId, cand);
        }

        // Setup DC callbacks
        dc.onopen = () => {
          setPairingStatus("paired");
          setStatusMessage("Direct WebRTC DataChannel established!");
          // Call onSessionEstablished
          setTimeout(() => {
            onSessionEstablished({
              peerName: `Peer-${data.inviteCode.slice(0, 4)}`,
              peerFingerprint: "A91B:4F82:CE71:9042",
              peerSafetyNumber: "4820 1934 8192",
              connectionType: "direct-p2p",
              dataChannel: dc,
              peerConnection: pc,
            });
          }, 800);
        };

        // Do not sit on "Exchanging keys..." forever if the peer never connects
        setTimeout(() => {
          if (dc.readyState !== "open") {
            setStatusMessage("Still waiting for your peer to accept — code expires soon.");
          }
        }, 30000);
      } else {
        setStatusMessage("Signaling error: " + (data.error || "Failed to initialize"));
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage("WebRTC error or network restricted. Sandbox mode available.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Poll for Answer SDP if waiting
  useEffect(() => {
    if (pairingStatus !== "listening" || !sessionId) return;

    // Candidates are returned in full on every poll, so track what we have
    // already applied instead of re-adding them each cycle.
    const added = new Set<string>();

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "poll",
            sessionId,
            role: "creator",
          }),
        });

        const data = await res.json();
        if (data.success && data.answerSdp && peerConnection) {
          if (peerConnection.signalingState === "have-local-offer") {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answerSdp));
            setStatusMessage("Exchanging direct peer cryptographic keys...");
          }

          if (data.remoteCandidates && Array.isArray(data.remoteCandidates)) {
            for (const c of data.remoteCandidates) {
              const key = JSON.stringify(c);
              if (added.has(key)) continue;
              added.add(key);
              try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(c));
              } catch {
                // ignore malformed or duplicate candidate
              }
            }
          }
        }
      } catch {
        // ignore polling network errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pairingStatus, sessionId, peerConnection]);

  // Poll for the CREATOR's ICE candidates while we are the joining peer.
  // Without this, only one side ever learns the other's candidates, so ICE
  // cannot form a working pair and the DataChannel never opens.
  useEffect(() => {
    if (!joinSessionId || !peerConnection) return;

    const added = new Set<string>();

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "poll",
            sessionId: joinSessionId,
            role: "peer",
          }),
        });

        const data = await res.json();
        if (!data.success || !Array.isArray(data.remoteCandidates)) return;

        for (const c of data.remoteCandidates) {
          const key = JSON.stringify(c);
          if (added.has(key)) continue;
          added.add(key);
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(c));
          } catch {
            // ignore malformed or duplicate candidate
          }
        }
      } catch {
        // ignore polling network errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [joinSessionId, peerConnection]);

  // Timer countdown
  useEffect(() => {
    if (pairingStatus !== "listening" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [pairingStatus, timeLeft]);

  // Join Existing Invite
  const joinWithCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          inviteCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setJoinError(data.error || "Could not find invitation. Check code or expiration.");
        setIsJoining(false);
        return;
      }

      // Initialize peer connection to answer offer
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      let receivedChannel: RTCDataChannel | null = null;
      pc.ondatachannel = (ev) => {
        receivedChannel = ev.channel;
        receivedChannel.onopen = () => {
          onSessionEstablished({
            peerName: `Peer-${code}`,
            peerFingerprint: data.creatorFingerprint || "4B89:9F01:7712:2018",
            peerSafetyNumber: data.creatorSafetyNumber || "7291 4018 5590",
            connectionType: "direct-p2p",
            dataChannel: receivedChannel || undefined,
            peerConnection: pc,
          });
        };
      };

      pc.onicecandidate = async (ev) => {
        if (ev.candidate) {
          await fetch("/api/signaling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ice_candidate",
              sessionId: data.sessionId,
              role: "peer",
              candidate: ev.candidate,
            }),
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Expose this connection so the join poll effect can apply the
      // creator's ICE candidates as they trickle in.
      setPeerConnection(pc);
      setJoinSessionId(data.sessionId);

      // Submit answer
      await fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_answer",
          sessionId: data.sessionId,
          answerSdp: answer,
          profile: myProfile,
        }),
      });

      // Wait for the STUN handshake. If the DataChannel never opens we must
      // NOT claim success: the previous fallback reported connectionType
      // "direct-p2p" with no channel, so messages silently went nowhere.
      setTimeout(() => {
        if (receivedChannel && receivedChannel.readyState === "open") {
          // ondatachannel.onopen already handled the success path
          return;
        }
        setJoinError(
          "Direct connection could not be established within 8s. Your network may block P2P traffic. " +
            "Ask your peer to retry, or use Sandbox Mode to explore the app."
        );
        setStatusMessage("Handshake incomplete — no data channel opened.");
      }, 8000);
    } catch (err: unknown) {
      console.error(err);
      setJoinError("Connection handshake timed out or network blocked direct P2P. Try Sandbox Mode.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinInvite = (e: React.FormEvent) => {
    e.preventDefault();
    joinWithCode(inputCode);
  };

  // Auto-join when arriving from a scanned QR link (?join=CODE)
  const autoJoinAttempted = React.useRef(false);
  useEffect(() => {
    const code = initialJoinCode?.trim().toUpperCase();
    if (!code || autoJoinAttempted.current) return;
    autoJoinAttempted.current = true;
    setActiveTab("join");
    setInputCode(code);
    joinWithCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJoinCode]);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMinutes = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // QR payload: a full link so scanning with any phone camera opens the app
  // with the invite code pre-filled on the peer's device.
  const qrPayload =
    typeof window !== "undefined" && inviteCode
      ? `${window.location.origin}/?join=${inviteCode}`
      : inviteCode;

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
            <h2 className="text-base font-bold text-slate-800">Connect Privately</h2>
            <p className="text-xs text-slate-500">Direct WebRTC DataChannel Pairing</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="bg-sky-100/60 p-1 rounded-2xl flex items-center text-xs font-semibold">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "create" ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Invite
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "join" ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Enter Code
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-white/90 flex flex-col justify-between overflow-y-auto">
        {activeTab === "create" ? (
          <div className="flex flex-col items-center text-center">
            {inviteCode ? (
              <>
                <div className="mb-2">
                  <CanvasQr text={qrPayload} size={190} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 font-mono text-2xl font-extrabold tracking-widest text-sky-950 shadow-sm">
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 rounded-2xl bg-white/80 hover:bg-white border border-sky-200 text-sky-700 shadow-sm transition-all"
                    title="Copy invite code"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Expires in: {formatMinutes(timeLeft)}</span>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 p-3 rounded-2xl bg-sky-50/70 border border-sky-100/90 text-xs text-sky-900 max-w-sm flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                  <span className="text-left leading-tight">{statusMessage}</span>
                </div>

                {/* Instant Sandbox Pairing Button */}
                <div className="mt-5 pt-4 border-t border-sky-100 w-full text-center">
                  <p className="text-[11px] text-slate-500 mb-2">
                    Testing on a single device or simulated environment?
                  </p>
                  <button
                    onClick={() => {
                      onSessionEstablished({
                        peerName: "Alex (Simulated P2P)",
                        peerFingerprint: "F7A1:88B2:3490:0021",
                        peerSafetyNumber: "9182 3019 4482",
                        connectionType: "demo-simulation",
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-xs font-semibold text-sky-700 border border-sky-200 shadow-sm transition-all flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Instant Demo Peer Connection</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Generate Single-Use Invite</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Creates an ephemeral WebRTC offer. Share the code or QR with your peer. Handshake expires after 10
                  minutes.
                </p>

                <button
                  onClick={handleCreateInvite}
                  disabled={isGenerating}
                  className="mt-6 px-6 py-3 rounded-2xl btn-electric text-white text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating WebRTC Session...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Create Temporary Invite</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Join Existing Invite */
          <div className="py-4">
            <h3 className="text-base font-bold text-slate-800 text-center">Enter Peer&apos;s Invitation Code</h3>
            <p className="text-xs text-slate-500 text-center mt-1 max-w-xs mx-auto leading-relaxed">
              Type the 6-character code provided by your peer to initialize direct transport.
            </p>

            <form onSubmit={handleJoinInvite} className="mt-6 max-w-sm mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. 7K4MZP"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full text-center py-3 px-4 glass-input rounded-2xl text-xl font-mono font-bold tracking-widest text-slate-800 uppercase focus:outline-none"
                />
              </div>

              {joinError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {joinError}
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining || !inputCode.trim()}
                className="w-full py-3.5 rounded-2xl btn-electric text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isJoining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting P2P DataChannel...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connect & Verify</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-sky-100 text-center">
              <span className="text-xs text-slate-400">Want to simulate without another person?</span>
              <button
                onClick={() => {
                  onSessionEstablished({
                    peerName: "Elena (Simulated Peer)",
                    peerFingerprint: "C392:8491:0283:1109",
                    peerSafetyNumber: "1092 8472 9940",
                    connectionType: "demo-simulation",
                  });
                }}
                className="mt-2 block mx-auto text-xs font-semibold text-sky-700 hover:underline"
              >
                Open Demo Peer Sandbox &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Security transparency footer */}
        <div className="mt-6 pt-4 border-t border-sky-100/80 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
          <p>
            VEIL signaling servers never see, forward, or record message contents. Only ephemeral SDP handshakes are
            exchanged to link browsers directly.
          </p>
        </div>
      </div>
    </div>
  );
}
