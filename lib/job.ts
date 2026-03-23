import type { PrismaClient } from "@/app/generated/prisma/client";

export const JOB_STATUSES = [
	"draft",
	"estimate",
	"quoted",
	"accepted",
	"invoiced",
	"paid",
	"closed",
	"cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
	draft: ["estimate", "cancelled"],
	estimate: ["quoted", "cancelled"],
	quoted: ["accepted", "cancelled"],
	accepted: ["invoiced", "cancelled"],
	invoiced: ["paid", "cancelled"],
	paid: ["closed"],
	closed: [],
	cancelled: [],
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
	return TRANSITIONS[from]?.includes(to) ?? false;
}

export function validTransitions(from: JobStatus): JobStatus[] {
	return TRANSITIONS[from] ?? [];
}

export async function createJob(
	prisma: PrismaClient,
	opts: { customerId: string; userId: string; note?: string },
) {
	const job = await prisma.job.create({
		data: {
			customerId: opts.customerId,
			userId: opts.userId,
			note: opts.note,
		},
	});

	await prisma.jobActivity.create({
		data: {
			jobId: job.id,
			action: "created",
			toState: "draft",
			userId: opts.userId,
		},
	});

	return job;
}

export async function transitionJob(
	prisma: PrismaClient,
	opts: {
		jobId: string;
		toStatus: JobStatus;
		userId?: string;
		detail?: string;
	},
) {
	const job = await prisma.job.findUniqueOrThrow({
		where: { id: opts.jobId },
	});

	const from = job.status as JobStatus;
	const to = opts.toStatus;

	if (!canTransition(from, to)) {
		throw new Error(`Invalid transition: ${from} → ${to}`);
	}

	const updated = await prisma.job.update({
		where: { id: opts.jobId },
		data: { status: to },
	});

	await prisma.jobActivity.create({
		data: {
			jobId: opts.jobId,
			action: "status_change",
			fromState: from,
			toState: to,
			detail: opts.detail,
			userId: opts.userId,
		},
	});

	return updated;
}

export async function addLineItem(
	prisma: PrismaClient,
	opts: {
		jobId: string;
		description: string;
		quantity?: number;
		unitPrice: number;
		userId?: string;
	},
) {
	const quantity = opts.quantity ?? 1;
	const amount = Math.round(quantity * opts.unitPrice);

	const maxSort = await prisma.lineItem.aggregate({
		where: { jobId: opts.jobId },
		_max: { sortOrder: true },
	});

	const lineItem = await prisma.lineItem.create({
		data: {
			jobId: opts.jobId,
			description: opts.description,
			quantity,
			unitPrice: opts.unitPrice,
			amount,
			sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
		},
	});

	await prisma.jobActivity.create({
		data: {
			jobId: opts.jobId,
			action: "line_item_added",
			detail: opts.description,
			userId: opts.userId,
		},
	});

	return lineItem;
}

export async function removeLineItem(
	prisma: PrismaClient,
	opts: { lineItemId: string; userId?: string },
) {
	const lineItem = await prisma.lineItem.delete({
		where: { id: opts.lineItemId },
	});

	await prisma.jobActivity.create({
		data: {
			jobId: lineItem.jobId,
			action: "line_item_removed",
			detail: lineItem.description,
			userId: opts.userId,
		},
	});

	return lineItem;
}

export async function getJobWithDetails(prisma: PrismaClient, jobId: string) {
	return prisma.job.findUniqueOrThrow({
		where: { id: jobId },
		include: {
			customer: true,
			lineItems: { orderBy: { sortOrder: "asc" } },
			activities: { orderBy: { createdAt: "asc" } },
		},
	});
}

export function computeTotal(lineItems: { amount: number }[]): number {
	return lineItems.reduce((sum, li) => sum + li.amount, 0);
}
