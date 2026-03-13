import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_id";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: number) {
	const id = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

	await prisma.session.create({
		data: { id, userId, expiresAt },
	});

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});

	return id;
}

export async function getSession() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
	if (!sessionId) return null;

	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		include: { user: true },
	});

	if (!session || session.expiresAt < new Date()) {
		if (session) {
			await prisma.session.delete({ where: { id: sessionId } });
		}
		cookieStore.delete(SESSION_COOKIE);
		return null;
	}

	return session;
}

export async function deleteSession() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
	if (sessionId) {
		await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
		cookieStore.delete(SESSION_COOKIE);
	}
}

// WebAuthn relying party config
export function getRP() {
	const rpID =
		process.env.NODE_ENV === "production"
			? (process.env.RP_ID ?? "localhost")
			: "localhost";
	const rpName = "MeritProServices";
	const origin =
		process.env.NODE_ENV === "production"
			? `https://${rpID}`
			: `http://localhost:${process.env.PORT ?? 3000}`;
	return { rpID, rpName, origin };
}
