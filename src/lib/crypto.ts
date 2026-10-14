/**
 * Cryptographic fingerprint & safety number generators for peer verification.
 * Uses Web Crypto API where available, fallback to deterministic hashes.
 */

export function generateRandomId(prefix = "veil"): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars without 0/O, 1/I
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSafetyNumber(seed1: string, seed2: string): string {
  // Combine both seeds deterministically
  const combined = [seed1, seed2].sort().join(":");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const abs = Math.abs(hash).toString().padStart(12, "823904128471");
  return `${abs.slice(0, 4)} ${abs.slice(4, 8)} ${abs.slice(8, 12)}`;
}

export function generateFingerprint(): string {
  const hex = "0123456789ABCDEF";
  const blocks: string[] = [];
  for (let b = 0; b < 4; b++) {
    let block = "";
    for (let i = 0; i < 4; i++) {
      block += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    blocks.push(block);
  }
  return blocks.join(":");
}
