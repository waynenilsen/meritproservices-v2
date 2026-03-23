import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	addLineItem,
	getJobWithDetails,
	removeLineItem,
	updateLineItem,
} from "@/lib/job";
import { prisma } from "@/lib/prisma";
import { authedProcedure, router } from "../trpc";

async function assertJobOwner(jobId: string, userId: string) {
	const job = await prisma.job.findUnique({ where: { id: jobId } });
	if (!job || job.userId !== userId) {
		throw new TRPCError({ code: "FORBIDDEN" });
	}
	return job;
}

export const jobRouter = router({
	get: authedProcedure
		.input(z.object({ jobId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertJobOwner(input.jobId, ctx.userId);
			return getJobWithDetails(prisma, input.jobId);
		}),

	addLineItem: authedProcedure
		.input(
			z.object({
				jobId: z.string(),
				description: z.string(),
				quantity: z.number().int().min(1).default(1),
				unitPrice: z.number().int().min(0),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await assertJobOwner(input.jobId, ctx.userId);
			return addLineItem(prisma, {
				jobId: input.jobId,
				description: input.description,
				quantity: input.quantity,
				unitPrice: input.unitPrice,
				userId: ctx.userId,
			});
		}),

	updateLineItem: authedProcedure
		.input(
			z.object({
				lineItemId: z.string(),
				quantity: z.number().int().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const lineItem = await prisma.lineItem.findUniqueOrThrow({
				where: { id: input.lineItemId },
			});
			await assertJobOwner(lineItem.jobId, ctx.userId);
			return updateLineItem(prisma, {
				lineItemId: input.lineItemId,
				quantity: input.quantity,
				userId: ctx.userId,
			});
		}),

	removeLineItem: authedProcedure
		.input(z.object({ lineItemId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const lineItem = await prisma.lineItem.findUniqueOrThrow({
				where: { id: input.lineItemId },
			});
			await assertJobOwner(lineItem.jobId, ctx.userId);
			return removeLineItem(prisma, {
				lineItemId: input.lineItemId,
				userId: ctx.userId,
			});
		}),
});
