import { createId } from "@paralleldrive/cuid2";
import type { PrismaClient } from "@/app/generated/prisma/client";

export const SESSION_COOKIE = "session_id";
const SESSION_MAX_AGE_DAYS = 365;

export function sessionExpiresAt(): Date {
	const d = new Date();
	d.setDate(d.getDate() + SESSION_MAX_AGE_DAYS);
	return d;
}

export async function createAnonSession(prisma: PrismaClient) {
	const userId = createId();
	const sessionId = createId();
	const expiresAt = sessionExpiresAt();

	const user = await prisma.user.create({
		data: { id: userId },
	});

	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId: user.id,
			expiresAt,
		},
	});

	return { user, session };
}

export async function getSessionById(prisma: PrismaClient, id: string) {
	return prisma.session.findUnique({
		where: { id },
		include: { user: true },
	});
}

export function isSessionValid(session: { expiresAt: Date }): boolean {
	return session.expiresAt > new Date();
}
