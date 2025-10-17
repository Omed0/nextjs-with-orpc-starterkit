import { todoRouter } from "./todo";
import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "@/o-rpc/base";
import { filesRoute } from "./files";
import { userRouter } from "./user";

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
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter, AppRouter>;
