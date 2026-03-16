import { NextResponse } from "next/server";
import { upgradeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.redirect(
			new URL("/login?error=missing_token", request.url),
		);
	}

	const magicLink = await prisma.magicLink.findUnique({
		where: { token },
	});

	if (!magicLink || magicLink.used || magicLink.expiresAt < new Date()) {
		return NextResponse.redirect(
			new URL("/login?error=invalid_or_expired", request.url),
		);
	}

	await prisma.magicLink.update({
		where: { id: magicLink.id },
		data: { used: true },
	});

	await upgradeSession(magicLink.sessionId, magicLink.email);

	return NextResponse.redirect(new URL("/", request.url));
}
