import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const appRouter = createTRPCRouter({
  time: publicProcedure.query(() => {
    return { serverTime: new Date() };
  }),
});

export type AppRouter = typeof appRouter;
