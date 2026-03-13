import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { z } from "zod/v4";
import { createSession, deleteSession, getRP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumeChallenge, storeChallenge } from "@/lib/webauthn-challenges";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/trpc/init";

export const authRouter = createTRPCRouter({
	// Get current user
	me: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.user) return null;
		return { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name };
	}),

	// Step 1 of registration: generate options
	registerOptions: publicProcedure
		.input(z.object({ email: z.email() }))
		.mutation(async ({ input }) => {
			const { rpID, rpName } = getRP();

			// Find or create user
			let user = await prisma.user.findUnique({
				where: { email: input.email },
				include: { passkeys: true },
			});

			if (!user) {
				user = await prisma.user.create({
					data: { email: input.email },
					include: { passkeys: true },
				});
			}

			const options = await generateRegistrationOptions({
				rpName,
				rpID,
				userName: input.email,
				userID: new TextEncoder().encode(String(user.id)),
				attestationType: "none",
				excludeCredentials: user.passkeys.map((pk) => ({
					id: pk.credentialId,
					transports: pk.transports ? JSON.parse(pk.transports) : undefined,
				})),
				authenticatorSelection: {
					residentKey: "preferred",
					userVerification: "preferred",
				},
			});

			storeChallenge(`reg:${user.id}`, options.challenge);

			return { options, userId: user.id };
		}),

	// Step 2 of registration: verify response
	registerVerify: publicProcedure
		.input(
			z.object({
				userId: z.number(),
				response: z.any(),
			}),
		)
		.mutation(async ({ input }) => {
			const { rpID, origin } = getRP();
			const expectedChallenge = consumeChallenge(`reg:${input.userId}`);
			if (!expectedChallenge) {
				throw new Error("Challenge expired or not found. Please try again.");
			}

			const verification = await verifyRegistrationResponse({
				response: input.response,
				expectedChallenge,
				expectedOrigin: origin,
				expectedRPID: rpID,
			});

			if (!verification.verified || !verification.registrationInfo) {
				throw new Error("Registration verification failed.");
			}

			const { credential } = verification.registrationInfo;

			await prisma.passkey.create({
				data: {
					credentialId: credential.id,
					publicKey: Buffer.from(credential.publicKey),
					counter: credential.counter,
					transports: credential.transports
						? JSON.stringify(credential.transports)
						: null,
					userId: input.userId,
				},
			});

			await createSession(input.userId);

			return { success: true };
		}),

	// Step 1 of login: generate options
	loginOptions: publicProcedure
		.input(z.object({ email: z.email() }))
		.mutation(async ({ input }) => {
			const { rpID } = getRP();

			const user = await prisma.user.findUnique({
				where: { email: input.email },
				include: { passkeys: true },
			});

			if (!user || user.passkeys.length === 0) {
				throw new Error(
					"No passkey found for this email. Please register first.",
				);
			}

			const options = await generateAuthenticationOptions({
				rpID,
				allowCredentials: user.passkeys.map((pk) => ({
					id: pk.credentialId,
					transports: pk.transports ? JSON.parse(pk.transports) : undefined,
				})),
				userVerification: "preferred",
			});

			storeChallenge(`auth:${user.id}`, options.challenge);

			return { options, userId: user.id };
		}),

	// Step 2 of login: verify response
	loginVerify: publicProcedure
		.input(
			z.object({
				userId: z.number(),
				response: z.any(),
			}),
		)
		.mutation(async ({ input }) => {
			const { rpID, origin } = getRP();
			const expectedChallenge = consumeChallenge(`auth:${input.userId}`);
			if (!expectedChallenge) {
				throw new Error("Challenge expired or not found. Please try again.");
			}

			const user = await prisma.user.findUnique({
				where: { id: input.userId },
				include: { passkeys: true },
			});

			if (!user) throw new Error("User not found.");

			const passkey = user.passkeys.find(
				(pk) => pk.credentialId === input.response.id,
			);
			if (!passkey) throw new Error("Passkey not recognized.");

			const verification = await verifyAuthenticationResponse({
				response: input.response,
				expectedChallenge,
				expectedOrigin: origin,
				expectedRPID: rpID,
				credential: {
					id: passkey.credentialId,
					publicKey: new Uint8Array(passkey.publicKey),
					counter: Number(passkey.counter),
					transports: passkey.transports
						? JSON.parse(passkey.transports)
						: undefined,
				},
			});

			if (!verification.verified) {
				throw new Error("Authentication failed.");
			}

			// Update counter
			await prisma.passkey.update({
				where: { id: passkey.id },
				data: { counter: verification.authenticationInfo.newCounter },
			});

			await createSession(user.id);

			return { success: true };
		}),

	// Logout
	logout: protectedProcedure.mutation(async () => {
		await deleteSession();
		return { success: true };
	}),
});
