import "dotenv/config";
import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("src", "prisma", "schema"),
  migrations: {
    path: path.join("src", "prisma", "migrations"),
    //seed: path.join("src", "prisma", "seed.ts"),
  },
} satisfies PrismaConfig;
