import { os } from "@orpc/server";
import { auth, getSession, type getSessionType } from "@/lib/auth";
import { Prisma, PrismaClient } from "@/prisma/generated/client";
import { redirect } from "next/navigation";
import prisma from "@/prisma";

/**
 * Define the base context type so all middleware
 * can extend it without losing IntelliSense
 */

type BaseContext = {
  headers: Headers;
};

export const base = os.$context<BaseContext>().errors({
  UNAUTHORIZED: { message: "User is Unauthorized" },
  BAD_REQUEST: { message: "Bad Request" },
  INTERNAL_SERVER_ERROR: { message: "Internal Server Error" },
  NOT_FOUND: { message: "Not Found" },
  FORBIDDEN: { message: "Forbidden Request" },
  Prisma_Error: { message: "DB Known Error" },
  Prisma_Unknown_Error: { message: "DB Unknown Error" },
});

/**
 * Middleware: Require authentication
 */
const requireAuthMiddleware = base
  .$context<{ session?: Awaited<getSessionType>; headers: Headers }>()
  .middleware(async ({ context, next }) => {
    const session = context.session ?? (await getSession(context.headers));
    if (!session || !session?.user) {
      return redirect("/sign-in");
    }
    return next({ context: { session } });
  });

/**
 * Middleware: Provide Prisma client
 * (no connect/disconnect every request, just use the singleton)
 */
export const dbProvider = base
  .$context<{ db?: PrismaClient }>()
  .middleware(async ({ next, errors, context }) => {
    const db = context.db ?? prisma;
    try {
      return next({ context: { db } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error);
        throw errors.Prisma_Error({ message: error.message });
      }
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        console.error(error);
        throw errors.Prisma_Unknown_Error({ message: error.message });
      }
      console.error(error);
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });

/**
 * Middleware: Provide auth API
 */
export const authApi = base
  .$context<{ authApi?: typeof auth.api }>()
  .middleware(({ next, context }) => {
    return next({ context: { authApi: context.authApi ?? auth.api } });
  });

/**
 * Export reusable procedure helpers
 */
export const publicProcedure = base.use(dbProvider).use(authApi);
export const protectedProcedure = publicProcedure.use(requireAuthMiddleware);
