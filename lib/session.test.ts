import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";
import {
	createAnonSession,
	getSessionById,
	isSessionValid,
	sessionExpiresAt,
} from "./session";

let prisma: PrismaClient;

beforeAll(async () => {
	const { execSync } = await import("node:child_process");
	execSync("bunx prisma migrate deploy", {
		env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
	});

	const adapter = new PrismaLibSql({ url: "file:./prisma/test.db" });
	prisma = new PrismaClient({ adapter });
});

afterAll(async () => {
	await prisma.$disconnect();
	const { unlinkSync } = await import("node:fs");
	try {
		unlinkSync("prisma/test.db");
	} catch {}
});

describe("createAnonSession", () => {
	test("creates a user with no email and a session", async () => {
		const { user, session } = await createAnonSession(prisma);

		expect(user.id).toBeDefined();
		expect(user.email).toBeNull();
		expect(user.passwordHash).toBeNull();

		expect(session.id).toBeDefined();
		expect(session.userId).toBe(user.id);
		expect(session.expiresAt).toBeInstanceOf(Date);
		expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});
});

describe("getSessionById", () => {
	test("returns session with user for valid id", async () => {
		const { session } = await createAnonSession(prisma);
		const found = await getSessionById(prisma, session.id);

		expect(found).not.toBeNull();
		expect(found?.id).toBe(session.id);
		expect(found?.user).toBeDefined();
		expect(found?.user.id).toBe(session.userId);
	});

	test("returns null for unknown id", async () => {
		const found = await getSessionById(prisma, "nonexistent");
		expect(found).toBeNull();
	});
});

describe("isSessionValid", () => {
	test("returns true for future expiry", () => {
		const future = new Date();
		future.setDate(future.getDate() + 1);
		expect(isSessionValid({ expiresAt: future })).toBe(true);
	});

	test("returns false for past expiry", () => {
		const past = new Date();
		past.setDate(past.getDate() - 1);
		expect(isSessionValid({ expiresAt: past })).toBe(false);
	});
});

describe("sessionExpiresAt", () => {
	test("returns a date roughly 365 days from now", () => {
		const exp = sessionExpiresAt();
		const diffMs = exp.getTime() - Date.now();
		const diffDays = diffMs / (1000 * 60 * 60 * 24);
		expect(diffDays).toBeGreaterThan(364);
		expect(diffDays).toBeLessThan(366);
	});
});
