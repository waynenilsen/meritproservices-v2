import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";
import {
	addLineItem,
	canTransition,
	computeTotal,
	createJob,
	getJobWithDetails,
	removeLineItem,
	transitionJob,
	validTransitions,
} from "./job";

let prisma: PrismaClient;
let userId: string;
let customerId: string;

beforeAll(async () => {
	const { execSync } = await import("node:child_process");
	execSync("bunx prisma migrate deploy", {
		env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
	});

	const adapter = new PrismaLibSql({ url: "file:./prisma/test.db" });
	prisma = new PrismaClient({ adapter });
});

beforeEach(async () => {
	await prisma.jobActivity.deleteMany();
	await prisma.lineItem.deleteMany();
	await prisma.job.deleteMany();
	await prisma.customer.deleteMany();
	await prisma.session.deleteMany();
	await prisma.user.deleteMany();

	const user = await prisma.user.create({ data: {} });
	userId = user.id;

	const customer = await prisma.customer.create({
		data: { userId: user.id },
	});
	customerId = customer.id;
});

afterAll(async () => {
	await prisma.$disconnect();
	const { unlinkSync } = await import("node:fs");
	try {
		unlinkSync("prisma/test.db");
	} catch {}
});

describe("canTransition", () => {
	test("allows valid forward transitions", () => {
		expect(canTransition("draft", "estimate")).toBe(true);
		expect(canTransition("estimate", "quoted")).toBe(true);
		expect(canTransition("quoted", "accepted")).toBe(true);
		expect(canTransition("accepted", "invoiced")).toBe(true);
		expect(canTransition("invoiced", "paid")).toBe(true);
		expect(canTransition("paid", "closed")).toBe(true);
	});

	test("allows cancellation from active states", () => {
		expect(canTransition("draft", "cancelled")).toBe(true);
		expect(canTransition("estimate", "cancelled")).toBe(true);
		expect(canTransition("quoted", "cancelled")).toBe(true);
		expect(canTransition("accepted", "cancelled")).toBe(true);
		expect(canTransition("invoiced", "cancelled")).toBe(true);
	});

	test("rejects invalid transitions", () => {
		expect(canTransition("draft", "paid")).toBe(false);
		expect(canTransition("closed", "draft")).toBe(false);
		expect(canTransition("cancelled", "draft")).toBe(false);
		expect(canTransition("paid", "cancelled")).toBe(false);
	});

	test("rejects skipping states", () => {
		expect(canTransition("draft", "quoted")).toBe(false);
		expect(canTransition("estimate", "invoiced")).toBe(false);
	});
});

describe("validTransitions", () => {
	test("returns available transitions for a state", () => {
		expect(validTransitions("draft")).toEqual(["estimate", "cancelled"]);
		expect(validTransitions("closed")).toEqual([]);
		expect(validTransitions("cancelled")).toEqual([]);
	});
});

describe("createJob", () => {
	test("creates a job in draft status with activity log", async () => {
		const job = await createJob(prisma, { customerId, userId });

		expect(job.status).toBe("draft");
		expect(job.customerId).toBe(customerId);
		expect(job.userId).toBe(userId);

		const details = await getJobWithDetails(prisma, job.id);
		expect(details.activities).toHaveLength(1);
		expect(details.activities[0].action).toBe("created");
		expect(details.activities[0].toState).toBe("draft");
	});

	test("creates a job with a note", async () => {
		const job = await createJob(prisma, {
			customerId,
			userId,
			note: "Big oak in backyard",
		});
		expect(job.note).toBe("Big oak in backyard");
	});
});

describe("transitionJob", () => {
	test("transitions through the happy path", async () => {
		const job = await createJob(prisma, { customerId, userId });

		await transitionJob(prisma, {
			jobId: job.id,
			toStatus: "estimate",
			userId,
		});
		await transitionJob(prisma, { jobId: job.id, toStatus: "quoted", userId });
		await transitionJob(prisma, {
			jobId: job.id,
			toStatus: "accepted",
			userId,
		});
		await transitionJob(prisma, {
			jobId: job.id,
			toStatus: "invoiced",
			userId,
		});
		await transitionJob(prisma, { jobId: job.id, toStatus: "paid", userId });
		const closed = await transitionJob(prisma, {
			jobId: job.id,
			toStatus: "closed",
			userId,
		});

		expect(closed.status).toBe("closed");

		const details = await getJobWithDetails(prisma, job.id);
		expect(details.activities).toHaveLength(7);
	});

	test("rejects invalid transition", async () => {
		const job = await createJob(prisma, { customerId, userId });

		expect(
			transitionJob(prisma, { jobId: job.id, toStatus: "paid", userId }),
		).rejects.toThrow("Invalid transition: draft → paid");
	});

	test("records detail on transition", async () => {
		const job = await createJob(prisma, { customerId, userId });
		await transitionJob(prisma, {
			jobId: job.id,
			toStatus: "estimate",
			userId,
			detail: "Sent via email",
		});

		const details = await getJobWithDetails(prisma, job.id);
		const activity = details.activities.find(
			(a) => a.action === "status_change",
		);
		expect(activity?.detail).toBe("Sent via email");
		expect(activity?.fromState).toBe("draft");
		expect(activity?.toState).toBe("estimate");
	});
});

describe("addLineItem / removeLineItem", () => {
	test("adds line items with auto-incrementing sort order", async () => {
		const job = await createJob(prisma, { customerId, userId });

		const li1 = await addLineItem(prisma, {
			jobId: job.id,
			description: "Stump removal 24in",
			unitPrice: 15000,
			userId,
		});
		const li2 = await addLineItem(prisma, {
			jobId: job.id,
			description: "Root grinding",
			quantity: 2,
			unitPrice: 5000,
			userId,
		});

		expect(li1.sortOrder).toBe(0);
		expect(li1.amount).toBe(15000);
		expect(li2.sortOrder).toBe(1);
		expect(li2.amount).toBe(10000);
	});

	test("removes a line item and logs activity", async () => {
		const job = await createJob(prisma, { customerId, userId });
		const li = await addLineItem(prisma, {
			jobId: job.id,
			description: "Stump removal",
			unitPrice: 15000,
			userId,
		});

		await removeLineItem(prisma, { lineItemId: li.id, userId });

		const details = await getJobWithDetails(prisma, job.id);
		expect(details.lineItems).toHaveLength(0);
		const removeActivity = details.activities.find(
			(a) => a.action === "line_item_removed",
		);
		expect(removeActivity?.detail).toBe("Stump removal");
	});
});

describe("computeTotal", () => {
	test("sums line item amounts in pennies", () => {
		expect(
			computeTotal([{ amount: 15000 }, { amount: 10000 }, { amount: 7500 }]),
		).toBe(32500);
	});

	test("returns 0 for empty list", () => {
		expect(computeTotal([])).toBe(0);
	});
});
