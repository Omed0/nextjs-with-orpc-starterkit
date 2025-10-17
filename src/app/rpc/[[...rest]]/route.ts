import "server-only";

import type { NextRequest } from "next/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
  SimpleCsrfProtectionHandlerPlugin,
  CORSPlugin,
} from "@orpc/server/plugins";
import { appRouter } from "@/o-rpc/routes";

const handler = new RPCHandler(appRouter, {
  strictGetMethodPluginEnabled: false,
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin,
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      credentials: true,
    }),
    new SimpleCsrfProtectionHandlerPlugin(),
  ],
});

async function handleRequest(req: NextRequest) {
  const { response } = await handler.handle(req, {
    prefix: "/rpc",
    context: { headers: req.headers },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
