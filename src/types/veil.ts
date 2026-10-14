/**
 * VEIL Types and Cryptographic Helpers
 */

export interface PeerProfile {
  id: string;
  displayName: string;
  avatarSeed: string;
  fingerprint: string;
  safetyNumber: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  expiresInSeconds?: number; // 0 = never, 30 = 30s, 300 = 5m, 3600 = 1h
  expiresAt?: number; // calculated ephemeral destruction timestamp
  isSelf: boolean;
  status: "sending" | "delivered" | "read";
  isDemo?: boolean;
}

export type ConnectionStatus = "disconnected" | "connecting" | "waiting_for_peer" | "connected" | "failed" | "closed";

export interface Conversation {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatarSeed: string;
  peerFingerprint: string;
  peerSafetyNumber: string;
  connectionStatus: ConnectionStatus;
  connectionType: "direct-p2p" | "demo-simulation";
  messages: ChatMessage[];
  unreadCount: number;
  lastActivity: number;
  disappearingTimerSeconds: number; // 0, 30, 300, 3600
  iceTransportState?: string;
  rttMs?: number;
  packetsLost?: number;
  bytesSent?: number;
  bytesReceived?: number;
}

export interface SignalingOfferPayload {
  type: "offer";
  sdp: string;
  creatorProfile: PeerProfile;
}

export interface SignalingAnswerPayload {
  type: "answer";
  sdp: string;
  peerProfile: PeerProfile;
}
