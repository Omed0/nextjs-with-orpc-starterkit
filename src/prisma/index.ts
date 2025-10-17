import { ORPCError } from "@orpc/server";
import { Prisma } from "@/prisma/generated/client";
import { PrismaClient } from "./generated/client";

//export const runtime = "nodejs"; // Ensure we use the Node.js runtime if not make a warning, don't remove it

const prisma = new PrismaClient({
  log: ["error"],
});

/**
 * Utility function to run a Prisma transaction safely.
 *
 * @param db - The Prisma client from context
 * @param fn - Callback that receives a transaction client
 * @returns The result of the transaction
 */
export async function withTransaction<T>(
  db: typeof prisma,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await db.$transaction(async (tx) => {
      return fn(tx);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[PrismaError]", error);
      throw new ORPCError("prisma_error", { message: error.message });
    }
    console.error("[InternalError]", error);
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
}

export default prisma;
