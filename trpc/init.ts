import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getOrCreateSession } from "@/lib/auth";

export const createTRPCContext = async () => {
	const session = await getOrCreateSession();
	return { session };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
