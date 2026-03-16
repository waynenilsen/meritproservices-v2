import { createTRPCRouter } from "@/trpc/init";
import { authRouter } from "./auth";

export const appRouter = createTRPCRouter({
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
