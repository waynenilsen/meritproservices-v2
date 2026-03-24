import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export interface TRPCContext {
	userId: string | null;
}

const t = initTRPC.context<TRPCContext>().create({
	transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({ ctx: { userId: ctx.userId } });
});
