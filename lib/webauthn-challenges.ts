// In-memory challenge store (per-process). Fine for single-server deployments.
// Challenges are short-lived and cleaned up after use or expiry.

const challenges = new Map<string, { challenge: string; expiresAt: number }>();

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function storeChallenge(key: string, challenge: string) {
	challenges.set(key, {
		challenge,
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
	});
}

export function consumeChallenge(key: string): string | null {
	const entry = challenges.get(key);
	challenges.delete(key);
	if (!entry || entry.expiresAt < Date.now()) return null;
	return entry.challenge;
}
