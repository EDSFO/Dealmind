import { appRouter as exampleRouter } from "~/server/api/routers/example";
import { companyRouter } from "~/server/api/routers/company";
import { userRouter } from "~/server/api/routers/user";
import { inviteRouter } from "~/server/api/routers/invite";
import { dealRouter } from "~/server/api/routers/deal";
import { contactRouter } from "~/server/api/routers/contact";
import { conversationRouter } from "~/server/api/routers/conversation";
import { activityRouter } from "~/server/api/routers/activity";
import { ticketRouter } from "~/server/api/routers/ticket";
import { pipelineStageRouter } from "~/server/api/routers/pipeline-stage";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  company: companyRouter,
  user: userRouter,
  invite: inviteRouter,
  deal: dealRouter,
  contact: contactRouter,
  conversation: conversationRouter,
  activity: activityRouter,
  ticket: ticketRouter,
  pipelineStage: pipelineStageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.example.hello({ text: "world" });
 */
export const createCaller = createCallerFactory(appRouter);
