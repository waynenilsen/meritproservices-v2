import { createId } from "@paralleldrive/cuid2";
import crypto from "node:crypto";
import { z } from "zod/v4";
import { sendMagicLinkEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const authRouter = createTRPCRouter({
	// Get current session
	me: publicProcedure.query(async ({ ctx }) => {
		return ctx.session;
	}),

	// Send magic link email
	sendMagicLink: publicProcedure
		.input(z.object({ email: z.email() }))
		.mutation(async ({ ctx, input }) => {
			const session = ctx.session;
			const token = crypto.randomBytes(32).toString("hex");

			await prisma.magicLink.create({
				data: {
					id: createId(),
					email: input.email,
					token,
					sessionId: session.id,
					expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
				},
			});

			const baseUrl =
				process.env.NODE_ENV === "production"
					? `https://${process.env.APP_HOST ?? "localhost"}`
					: `http://localhost:${process.env.PORT ?? 3000}`;

			const url = `${baseUrl}/api/auth/verify?token=${token}`;
			await sendMagicLinkEmail(input.email, url);

			return { success: true };
		}),
});
