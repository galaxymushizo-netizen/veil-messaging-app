# Changelog

All notable changes to this project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
