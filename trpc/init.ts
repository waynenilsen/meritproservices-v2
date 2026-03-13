import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createTRPCContext = async () => {
	return {};
};

const t = initTRPC.create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
