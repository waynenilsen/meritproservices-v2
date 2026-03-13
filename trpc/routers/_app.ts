import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { authRouter } from "./auth";

export const appRouter = createTRPCRouter({
	time: publicProcedure.query(() => {
		return { serverTime: new Date() };
	}),
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
