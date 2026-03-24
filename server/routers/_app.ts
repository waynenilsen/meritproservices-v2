import { router } from "../trpc";
import { jobRouter } from "./job";

export const appRouter = router({
	job: jobRouter,
});

export type AppRouter = typeof appRouter;
