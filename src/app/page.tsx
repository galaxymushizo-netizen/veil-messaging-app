"use client";

import React, { useState, useEffect, useRef } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { InboxScreen } from "@/components/InboxScreen";
import { PrivateChat } from "@/components/PrivateChat";
import { ConnectScreen } from "@/components/ConnectScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { DiagnosticsModal } from "@/components/DiagnosticsModal";
import { SafetyNumberModal } from "@/components/SafetyNumberModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { Conversation, ChatMessage, PeerProfile } from "@/types/veil";
import { generateFingerprint, generateSafetyNumber } from "@/lib/crypto";

export default function VeilApp() {
  // Navigation: "welcome" | "inbox" | "chat" | "connect" | "settings"
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "inbox" | "chat" | "connect" | "settings">("welcome");

  // User Profile
  const [userName, setUserName] = useState("Anonymous Peer");
  const [userFingerprint, setUserFingerprint] = useState("");
  const [userSafetySeed, setUserSafetySeed] = useState("");

  // Conversations in Memory
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Settings
  const [defaultTimer, setDefaultTimer] = useState<number>(0); // 0 = off, 30, 300, 3600
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Modals
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showSafetyNumber, setShowSafetyNumber] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [verifiedPeers, setVerifiedPeers] = useState<Record<string, boolean>>({});

  // Active WebRTC references (held in memory ref)
  const activeDataChannels = useRef<Record<string, RTCDataChannel>>({});
  const activePeerConnections = useRef<Record<string, RTCPeerConnection>>({});

  // Initialize identity on mount
  useEffect(() => {
    const fp = generateFingerprint();
    const seed = Math.random().toString(36).substring(2, 10);
    setUserFingerprint(fp);
    setUserSafetySeed(seed);
  }, []);

  // Disappearing messages cleanup ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      setConversations((prev) =>
        prev.map((conv) => {
          const validMessages = conv.messages.filter((msg) => {
            if (!msg.expiresAt) return true;
            return msg.expiresAt > now;
          });
          if (validMessages.length !== conv.messages.length) {
            return { ...conv, messages: validMessages };
          }
          return conv;
        })
      );
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  // Pre-populate with a simulated sandbox peer so user can test the UI immediately
  const setupDemoSandbox = () => {
    const demoConvId = "conv-demo-elena";
    const demoPeerName = "Elena (Simulated Peer)";
    const demoPeerFp = "E402:A911:7704:8129";
    const demoSafety = generateSafetyNumber(userSafetySeed, "elena-seed");

    const sampleMessages: ChatMessage[] = [
      {
        id: "msg-1",
        senderId: "elena",
        senderName: "Elena",
        text: "Hi! This is a zero-trace sandbox peer session. All messages are stored only in volatile RAM.",
        timestamp: Date.now() - 60000,
        isSelf: false,
        status: "read",
        isDemo: true,
      },
      {
        id: "msg-2",
        senderId: "self",
        senderName: userName,
        text: "Understood. The blue-and-white glass aesthetic is crisp and minimal.",
        timestamp: Date.now() - 30000,
        isSelf: true,
        status: "delivered",
        isDemo: true,
      },
      {
        id: "msg-3",
        senderId: "elena",
        senderName: "Elena",
        text: "Try turning on disappearing messages or testing identity verification with safety numbers!",
        timestamp: Date.now() - 5000,
        isSelf: false,
        status: "read",
        isDemo: true,
      },
    ];

    const demoConversation: Conversation = {
      id: demoConvId,
      peerId: "demo-elena",
      peerName: demoPeerName,
      peerAvatarSeed: "elena",
      peerFingerprint: demoPeerFp,
      peerSafetyNumber: demoSafety,
      connectionStatus: "connected",
      connectionType: "demo-simulation",
      messages: sampleMessages,
      unreadCount: 0,
      lastActivity: Date.now(),
      disappearingTimerSeconds: 0,
      iceTransportState: "connected (loopback-sim)",
      rttMs: 14,
      packetsLost: 0,
      bytesSent: 3420,
      bytesReceived: 3890,
    };

    setConversations((prev) => {
      if (prev.some((c) => c.id === demoConvId)) return prev;
      return [demoConversation, ...prev];
    });

    setActiveConversationId(demoConvId);
  };

  // Start button handler
  const handleStartMessaging = () => {
    if (conversations.length === 0) {
      setupDemoSandbox();
    }
    setCurrentScreen("inbox");
  };

  // Direct sandbox button handler
  const handleTrySandbox = () => {
    setupDemoSandbox();
    setCurrentScreen("chat");
  };

  // Send message
  const handleSendMessage = (text: string, expiresInSeconds: number) => {
    if (!activeConversationId) return;

    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv) return;

    const now = Date.now();
    const expiresAt = expiresInSeconds > 0 ? now + expiresInSeconds * 1000 : undefined;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: "self",
      senderName: userName,
      text,
      timestamp: now,
      expiresInSeconds: expiresInSeconds > 0 ? expiresInSeconds : undefined,
      expiresAt,
      isSelf: true,
      status: "delivered",
    };

    // If active WebRTC dataChannel exists, transmit across the wire
    const dc = activeDataChannels.current[activeConversationId];
    if (dc && dc.readyState === "open") {
      try {
        dc.send(
          JSON.stringify({
            type: "chat_message",
            payload: newMsg,
          })
        );
      } catch (err) {
        console.error("DataChannel send error:", err);
      }
    }

    // Append to local RAM state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastActivity: now,
            bytesSent: (c.bytesSent || 0) + text.length + 64,
          };
        }
        return c;
      })
    );

    // If sandbox demo mode, simulate peer reply after 1.5 seconds
    if (conv.connectionType === "demo-simulation") {
      setTimeout(() => {
        simulatePeerReply(activeConversationId, text, expiresInSeconds);
      }, 1500);
    }
  };

  // Sandbox automatic reply simulation
  const simulatePeerReply = (convId: string, userText: string, expiresInSeconds: number) => {
    const replies = [
      "I received your message over this peer-to-peer session. Notice how no data is sent to a central server!",
      "Encryption and zero persistence verified. Our shared ephemeral safety numbers ensure mutual authentication.",
      "Acknowledged! Volatile memory will purge this message according to your disappearing policy.",
      `Got it: "${userText.slice(0, 24)}${userText.length > 24 ? "..." : ""}". WebRTC DataChannel ping is nominal.`,
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const now = Date.now();
    const expiresAt = expiresInSeconds > 0 ? now + expiresInSeconds * 1000 : undefined;

    const replyMsg: ChatMessage = {
      id: `reply-${Date.now()}`,
      senderId: "peer",
      senderName: "Peer",
      text: randomReply,
      timestamp: now,
      expiresInSeconds: expiresInSeconds > 0 ? expiresInSeconds : undefined,
      expiresAt,
      isSelf: false,
      status: "read",
      isDemo: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, replyMsg],
            lastActivity: now,
            bytesReceived: (c.bytesReceived || 0) + randomReply.length + 64,
          };
        }
        return c;
      })
    );
  };

  // Change disappearing timer
  const handleChangeTimer = (seconds: number) => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, disappearingTimerSeconds: seconds } : c))
    );
  };

  // Clear chat
  const handleClearChat = () => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, messages: [] } : c))
    );
  };

  // Wipe all memory
  const handleClearAllMemory = () => {
    setConversations([]);
    setActiveConversationId(null);
    setCurrentScreen("welcome");
  };

  // Handle session established from ConnectScreen
  const handleSessionEstablished = (peerSession: {
    peerName: string;
    peerFingerprint: string;
    peerSafetyNumber: string;
    connectionType: "direct-p2p" | "demo-simulation";
    dataChannel?: RTCDataChannel;
    peerConnection?: RTCPeerConnection;
  }) => {
    const newConvId = `conv-${Date.now()}`;

    // Store WebRTC DataChannel handler
    if (peerSession.dataChannel) {
      activeDataChannels.current[newConvId] = peerSession.dataChannel;

      peerSession.dataChannel.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "chat_message") {
            const incoming: ChatMessage = {
              ...parsed.payload,
              isSelf: false,
              status: "read",
            };
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === newConvId) {
                  return {
                    ...c,
                    messages: [...c.messages, incoming],
                    lastActivity: Date.now(),
                    bytesReceived: (c.bytesReceived || 0) + incoming.text.length + 64,
                  };
                }
                return c;
              })
            );
          }
        } catch (e) {
          console.error("Failed to parse incoming DC message:", e);
        }
      };

      peerSession.dataChannel.onclose = () => {
        setConversations((prev) =>
          prev.map((c) => (c.id === newConvId ? { ...c, connectionStatus: "closed" } : c))
        );
      };
    }

    if (peerSession.peerConnection) {
      activePeerConnections.current[newConvId] = peerSession.peerConnection;
    }

    const newConversation: Conversation = {
      id: newConvId,
      peerId: `peer-${Date.now()}`,
      peerName: peerSession.peerName,
      peerAvatarSeed: peerSession.peerName,
      peerFingerprint: peerSession.peerFingerprint,
      peerSafetyNumber: peerSession.peerSafetyNumber,
      connectionStatus: "connected",
      connectionType: peerSession.connectionType,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          senderId: "system",
          senderName: "VEIL Protocol",
          text: `Direct peer session established with ${peerSession.peerName}. Transport is encrypted via WebRTC DTLS/SCTP.`,
          timestamp: Date.now(),
          isSelf: false,
          status: "read",
        },
      ],
      unreadCount: 0,
      lastActivity: Date.now(),
      disappearingTimerSeconds: defaultTimer,
      iceTransportState: "connected",
      rttMs: 22,
      packetsLost: 0,
      bytesSent: 1240,
      bytesReceived: 1450,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
    setCurrentScreen("chat");
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-blue-50 text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Dynamic Screen View */}
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onStart={handleStartMessaging}
          onExploreDemo={handleTrySandbox}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
          userName={userName}
          setUserName={setUserName}
          fingerprint={userFingerprint || "6F8A:9012:3C4D:EE12"}
        />
      )}

      {currentScreen === "inbox" && (
        <InboxScreen
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setCurrentScreen("chat");
          }}
          onNewChat={() => setCurrentScreen("connect")}
          onOpenSettings={() => setCurrentScreen("settings")}
          userName={userName}
          fingerprint={userFingerprint || "6F8A:9012:3C4D:EE12"}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
        />
      )}

      {currentScreen === "chat" && activeConv && (
        <PrivateChat
          conversation={activeConv}
          onBack={() => setCurrentScreen("inbox")}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          onChangeTimer={handleChangeTimer}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
          onOpenSafetyNumber={() => setShowSafetyNumber(true)}
          isPeerSafetyVerified={!!verifiedPeers[activeConv.id]}
        />
      )}

      {currentScreen === "connect" && (
        <ConnectScreen
          onBack={() => setCurrentScreen("inbox")}
          myProfile={{
            id: "self",
            displayName: userName,
            avatarSeed: userName,
            fingerprint: userFingerprint || "6F8A:9012:3C4D:EE12",
            safetyNumber: generateSafetyNumber(userSafetySeed, "peer-seed"),
          }}
          onSessionEstablished={handleSessionEstablished}
        />
      )}

      {currentScreen === "settings" && (
        <SettingsScreen
          onBack={() => setCurrentScreen("inbox")}
          onClearAllMemory={handleClearAllMemory}
          defaultTimer={defaultTimer}
          setDefaultTimer={setDefaultTimer}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          fingerprint={userFingerprint || "6F8A:9012:3C4D:EE12"}
          safetyNumber={generateSafetyNumber(userSafetySeed, "default")}
        />
      )}

      {/* Diagnostics Modal */}
      {activeConv && (
        <DiagnosticsModal
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
          connectionType={activeConv.connectionType}
          connectionStatus={activeConv.connectionStatus}
          myFingerprint={userFingerprint}
          peerFingerprint={activeConv.peerFingerprint}
          safetyNumber={activeConv.peerSafetyNumber}
          iceTransportState={activeConv.iceTransportState}
          rttMs={activeConv.rttMs}
          packetsLost={activeConv.packetsLost}
          bytesSent={activeConv.bytesSent}
          bytesReceived={activeConv.bytesReceived}
        />
      )}

      {/* Safety Number Modal */}
      {activeConv && (
        <SafetyNumberModal
          isOpen={showSafetyNumber}
          onClose={() => setShowSafetyNumber(false)}
          peerName={activeConv.peerName}
          safetyNumber={activeConv.peerSafetyNumber}
          myFingerprint={userFingerprint}
          peerFingerprint={activeConv.peerFingerprint}
          isVerified={!!verifiedPeers[activeConv.id]}
          onMarkVerified={() => {
            setVerifiedPeers((prev) => ({ ...prev, [activeConv.id]: true }));
          }}
        />
      )}

      {/* Architecture Transparency Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  );
}
