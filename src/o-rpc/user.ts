import z from "zod";
import { protectedProcedure, publicProcedure } from "./base";

export const userRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    const users = await context.authApi.listUserAccounts({
      headers: context.headers,
    });

    return users;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(70),
        email: z.string().email(),
        password: z.string().min(6).max(100),
        image: z.string().url().optional(),
        callbackURL: z.string().url().optional(),
        rememberMe: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      return await context.authApi.signUpEmail({
        headers: context.headers,
        body: { ...input },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        image: z.string().url().optional(),
        name: z.string().min(2).max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      return await context.authApi.updateUser({
        headers: context.headers,
        body: { ...input },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        password: z.string().min(6).max(100),
        token: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      return await context.authApi.deleteUser({
        headers: context.headers,
        body: { ...input },
      });
    }),
};
