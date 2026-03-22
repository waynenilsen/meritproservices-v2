import { publicProcedure, router } from "../trpc";

export const appRouter = router({
	hello: publicProcedure.query(() => {
		return {
			greeting: "Hello from tRPC!",
			serverTime: new Date(),
		};
	}),
});

export type AppRouter = typeof appRouter;
