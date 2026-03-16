import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_id";
const SESSION_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

/**
 * Get or create an anonymous session. Every visitor gets one.
 */
export async function getOrCreateSession() {
	const cookieStore = await cookies();
	const existingId = cookieStore.get(SESSION_COOKIE)?.value;

	if (existingId) {
		const session = await prisma.session.findUnique({
			where: { id: existingId },
		});
		if (session && session.expiresAt > new Date()) {
			return session;
		}
		// Expired or missing — clean up and create new
		if (session) {
			await prisma.session
				.delete({ where: { id: existingId } })
				.catch(() => {});
		}
	}

	const id = createId();
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

	const session = await prisma.session.create({
		data: { id, expiresAt },
	});

	cookieStore.set(SESSION_COOKIE, id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});

	return session;
}

/**
 * Upgrade an anonymous session with an email address.
 */
export async function upgradeSession(sessionId: string, email: string) {
	return prisma.session.update({
		where: { id: sessionId },
		data: { email },
	});
}
