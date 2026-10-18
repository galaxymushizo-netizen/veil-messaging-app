# Changelog

All notable changes to this project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-18

### Changed

Visual de-cluttering of the entry screen and the explainer. The goal was to
remove decorative filler that made the interface read as generated rather than
designed, while keeping every functional control.

**Welcome screen**

- Removed the three ambient blurred background orbs.
- Removed the animated "Zero Cloud Storage &bull; Ephemeral Memory Only" ping
  badge; the same information now lives in the footer as a plain sentence.
- Removed the three-stop gradient on the headline and replaced the copy with a
  concrete claim — *"Messages that never touch a server."*
- Removed the decorative gradient tile behind the logo and the "P2P Protocol"
  pill next to it.
- Removed the three feature cards (`Direct P2P` / `DTLS/SCTP` / `Zero Logs`),
  which duplicated the paragraph above them.
- Removed the "Identity Ready" micro-status pill.
- Replaced the `Sparkles` icon on the explainer trigger with `Info`, relabelled
  "Architecture & Transparency" to **How it works**, and dropped its pill
  styling for a plain text button.
- The fingerprint in the identity card is now a button that explains what a
  safety number is and why it changes, instead of being inert text.
- Dropped unused state (`isEditingName`) and unused icon imports.

**How it works modal**

- Replaced four identically-styled stacked cards with a numbered vertical
  sequence for the three connection steps, plus two single-purpose sections.
- Removed the self-referential "Honest Engineering Disclaimers" heading — the
  same caveats now sit under **Where this falls short**, stated directly.
- Removed the numbered section headings ("1. Zero Server-Side Chat Storage",
  "2. WebRTC DataChannel Handshake", "3. Safety Number Verification").
- Replaced the condescending **I Understand &bull; Continue** button with
  **Close**, and the `✕` text glyph with a proper icon plus an `aria-label`.
- Tightened copy throughout and added the missing caveat that there is no TURN
  relay, so restrictive networks fail to pair rather than falling back.

## [1.1.0] - 2026-10-14

### Fixed

- **Peer never fetched the creator's ICE candidates.** Only a `role: "creator"`
  poll existed, so the joining side learned the initiator's network addresses
  never. ICE could only ever negotiate in one direction, which prevented the
  DataChannel from opening on real networks. Added a `role: "peer"` polling
  loop in `ConnectScreen`.
- **Creator's ICE candidates were silently dropped.** The `onicecandidate`
  handler read `sessionId` from a stale React closure, so it was still `""`
  when the handler ran. Every candidate fell into a buffer that was flushed
  only once and never read again. Replaced with a mutable `sessionIdRef` and a
  correct buffer-flush ordering.
- **UI reported a successful connection when none existed.** A 3.5s fallback
  labelled the session `direct-p2p` without an open `DataChannel`, so outgoing
  messages were written locally and never delivered. The fallback is removed;
  an honest error is now surfaced after 8s with guidance to retry or use
  Sandbox Mode.
- **ICE candidates were re-added on every poll cycle.** Polling returns the
  full candidate array each time. Both the creator and peer loops now
  de-duplicate against a `Set` before calling `addIceCandidate`.
- Creator no longer sits indefinitely on "Exchanging keys…" — a status update
  fires after 30s if the peer has not yet connected.

### Changed

- QR codes are now generated with `qrcode.react` and encode the full deep link
  (`https://<host>/?join=<CODE>`), so scanning a code on a phone joins the
  session automatically.
- Database connection is created lazily, so the production build succeeds in
  environments where `DATABASE_URL` is not present at build time.
- Package metadata: renamed from the template default to `veil-messaging-app`,
  added description, license, repository, engines and keywords.

### Added

- `README.md`, `LICENSE` (MIT), `.env.example` and this changelog.

## [1.0.0] - 2026-10-14

### Added

- Initial release.
- WebRTC DataChannel peer-to-peer transport with ephemeral signaling over
  PostgreSQL (10-minute session TTL, deleted on close and on expiry).
- Six-character invitation codes with QR encoding and `?join=` deep linking.
- Ephemeral safety numbers and key fingerprints per session.
- Sandbox Mode: simulated conversation so the interface can be explored
  without a second participant.
- Settings and Diagnostics screens.
- Health endpoint at `/api/health`.
