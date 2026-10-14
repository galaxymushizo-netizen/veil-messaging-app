import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { signalingSessions } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

// 10 minutes session TTL
const SESSION_TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, inviteCode, sessionId, profile, offerSdp, answerSdp, candidate, role } = body;

    const now = new Date();

    // Clean up expired sessions periodically
    try {
      await db.delete(signalingSessions).where(lt(signalingSessions.expiresAt, now));
    } catch {
      // ignore cleanup error if table is preparing
    }

    // 1. CREATE SESSION: Initiator creates an invite and WebRTC offer
    if (action === "create") {
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      const generatedCode = inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase();
      const newSessionId = `veil-sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const newSession = {
        id: newSessionId,
        inviteCode: generatedCode,
        creatorFingerprint: profile?.fingerprint || "0000:0000:0000:0000",
        creatorSafetyNumber: profile?.safetyNumber || "1234 5678 9012",
        status: "waiting",
        offerSdp: offerSdp ? JSON.stringify(offerSdp) : null,
        answerSdp: null,
        creatorIceCandidates: "[]",
        peerIceCandidates: "[]",
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(signalingSessions).values(newSession);

      return NextResponse.json({
        success: true,
        sessionId: newSessionId,
        inviteCode: generatedCode,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // 2. JOIN SESSION: Recipient uses invite code to find offer and submits WebRTC answer
    if (action === "join") {
      if (!inviteCode) {
        return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
      }

      const cleanCode = inviteCode.trim().toUpperCase();
      const sessions = await db
        .select()
        .from(signalingSessions)
        .where(eq(signalingSessions.inviteCode, cleanCode));

      if (sessions.length === 0) {
        return NextResponse.json({ error: "Invalid or expired invitation code." }, { status: 404 });
      }

      const session = sessions[0];
      if (new Date(session.expiresAt) < now) {
        return NextResponse.json({ error: "This invitation code has expired (10m TTL)." }, { status: 410 });
      }

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        inviteCode: session.inviteCode,
        status: session.status,
        offerSdp: session.offerSdp ? JSON.parse(session.offerSdp) : null,
        creatorFingerprint: session.creatorFingerprint,
        creatorSafetyNumber: session.creatorSafetyNumber,
      });
    }

    // 3. SUBMIT ANSWER: Recipient submits WebRTC answer SDP
    if (action === "submit_answer") {
      if (!sessionId || !answerSdp) {
        return NextResponse.json({ error: "Session ID and answer SDP required" }, { status: 400 });
      }

      await db
        .update(signalingSessions)
        .set({
          answerSdp: JSON.stringify(answerSdp),
          peerFingerprint: profile?.fingerprint || "PEER-FINGERPRINT",
          peerSafetyNumber: profile?.safetyNumber || "PEER-SAFETY",
          status: "paired",
          updatedAt: now,
        })
        .where(eq(signalingSessions.id, sessionId));

      return NextResponse.json({ success: true, message: "Answer SDP registered" });
    }

    // 4. ADD ICE CANDIDATE
    if (action === "ice_candidate") {
      if (!sessionId || !candidate) {
        return NextResponse.json({ error: "Session ID and ICE candidate required" }, { status: 400 });
      }

      const sessions = await db.select().from(signalingSessions).where(eq(signalingSessions.id, sessionId));
      if (sessions.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const session = sessions[0];
      const isCreator = role === "creator";
      const targetColumn = isCreator ? "creatorIceCandidates" : "peerIceCandidates";
      const currentList: unknown[] = JSON.parse(
        (isCreator ? session.creatorIceCandidates : session.peerIceCandidates) || "[]"
      );

      currentList.push(candidate);

      await db
        .update(signalingSessions)
        .set({
          [targetColumn]: JSON.stringify(currentList),
          updatedAt: now,
        })
        .where(eq(signalingSessions.id, sessionId));

      return NextResponse.json({ success: true });
    }

    // 5. POLL STATE: Check for answer SDP and remote ICE candidates
    if (action === "poll") {
      if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
      }

      const sessions = await db.select().from(signalingSessions).where(eq(signalingSessions.id, sessionId));
      if (sessions.length === 0) {
        return NextResponse.json({ error: "Session ended or not found" }, { status: 404 });
      }

      const session = sessions[0];
      const isCreator = role === "creator";

      return NextResponse.json({
        success: true,
        status: session.status,
        answerSdp: session.answerSdp ? JSON.parse(session.answerSdp) : null,
        remoteCandidates: JSON.parse(
          (isCreator ? session.peerIceCandidates : session.creatorIceCandidates) || "[]"
        ),
        peerFingerprint: session.peerFingerprint,
        peerSafetyNumber: session.peerSafetyNumber,
      });
    }

    // 6. CLOSE SESSION: Destroy temporary signaling envelope when DataChannel opens
    if (action === "close") {
      if (sessionId) {
        await db.delete(signalingSessions).where(eq(signalingSessions.id, sessionId));
      }
      return NextResponse.json({ success: true, message: "Signaling envelope deleted." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Signaling API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal signaling error" },
      { status: 500 }
    );
  }
}
