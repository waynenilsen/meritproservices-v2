import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionById, isSessionValid, SESSION_COOKIE } from "@/lib/session";
import { appRouter } from "@/server/routers/_app";
import type { TRPCContext } from "@/server/trpc";

async function createContext(): Promise<TRPCContext> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
	if (!sessionId) return { userId: null };

	const session = await getSessionById(prisma, sessionId);
	if (!session || !isSessionValid(session)) return { userId: null };

	return { userId: session.userId };
}

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext,
	});

export { handler as GET, handler as POST };
