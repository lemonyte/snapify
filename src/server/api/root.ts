import { createTRPCRouter } from "~/server/api/trpc";
import { videoRouter } from "~/server/api/routers/video";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
});

export type AppRouter = typeof appRouter;
