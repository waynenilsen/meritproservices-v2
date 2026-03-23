import { createId } from "@paralleldrive/cuid2";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
	SESSION_COOKIE,
	createAnonSession,
	getSessionById,
	isSessionValid,
} from "@/lib/session";

export async function proxy(request: NextRequest) {
	const requestId = createId();
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-request-id", requestId);

	const sessionId = request.cookies.get(SESSION_COOKIE)?.value;

	if (sessionId) {
		const session = await getSessionById(prisma, sessionId);
		if (session && isSessionValid(session)) {
			const response = NextResponse.next({
				request: { headers: requestHeaders },
			});
			response.headers.set("x-request-id", requestId);
			return response;
		}
	}

	const { session } = await createAnonSession(prisma);
	const response = NextResponse.next({
		request: { headers: requestHeaders },
	});
	response.headers.set("x-request-id", requestId);
	response.cookies.set(SESSION_COOKIE, session.id, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 365 * 24 * 60 * 60,
	});
	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
