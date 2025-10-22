import { todoRouter } from "./todo";
import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "@/o-rpc/base";
import { filesRoute } from "./files";
import { userRouter } from "./user";
import { queueRouter } from "./queue";
import { backupRouter } from "./backup";
import * as analytics from "./analytics";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session.user,
    };
  }),
  session: protectedProcedure.handler(({ context }) => {
    return {
      session: context.session,
    };
  }),
  todo: todoRouter,
  files: filesRoute,
  users: userRouter,
  queues: queueRouter,
  backup: backupRouter,
  analytics,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter, AppRouter>;
