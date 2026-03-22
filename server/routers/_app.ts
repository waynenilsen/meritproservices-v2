import { prisma } from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
	hello: publicProcedure.query(() => {
		return {
			greeting: "Hello from tRPC!",
			serverTime: new Date(),
		};
	}),
	projects: router({
		list: publicProcedure.query(() => {
			return prisma.project.findMany({
				orderBy: { createdAt: "desc" },
			});
		}),
	}),
});

export type AppRouter = typeof appRouter;
