import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Temporary signaling sessions table for WebRTC handshake and invitation pairing.
 * Note: VEIL adheres strictly to the privacy guarantee:
 * NO chat messages or message histories are ever stored here or anywhere on the server.
 * Only ephemeral signaling envelopes (offer, answer, ICE candidates) with short-lived TTLs.
 */
export const signalingSessions = pgTable("signaling_sessions", {
  id: text("id").primaryKey(), // e.g., veil-xyz-123
  inviteCode: text("invite_code").notNull().unique(), // short 6-8 char pairing code
  creatorFingerprint: text("creator_fingerprint").notNull(),
  creatorSafetyNumber: text("creator_safety_number").notNull(),
  status: text("status").notNull().default("waiting"), // waiting | paired | closed | expired
  offerSdp: text("offer_sdp"), // WebRTC SDP offer json
  answerSdp: text("answer_sdp"), // WebRTC SDP answer json
  creatorIceCandidates: text("creator_ice_candidates").default("[]"), // JSON array
  peerIceCandidates: text("peer_ice_candidates").default("[]"), // JSON array
  peerFingerprint: text("peer_fingerprint"),
  peerSafetyNumber: text("peer_safety_number"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SignalingSession = typeof signalingSessions.$inferSelect;
