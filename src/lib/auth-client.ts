import { createAuthClient, type ErrorContext } from "better-auth/react";
import {
  //usernameClient,
  //organizationClient,
  adminClient,
  magicLinkClient,
  emailOTPClient,
} from "better-auth/client/plugins";
import { env } from "a/lib/utils/env";
import { toast } from "sonner";

export const authClient = createAuthClient({
  fetchOptions: {
    onError: async (context: ErrorContext) => {
      const { response, error } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        //console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        toast.error(
          `Too many requests. Please try again after ${retryAfter} seconds.`
        );
      } else {
        //console.error(`${error.name}: ${error.message}`);
        toast.error(error.message || "An unexpected error occurred.");
      }
    },
  },
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    //usernameClient(),
    //organizationClient(),
    adminClient(),
    emailOTPClient(),
    magicLinkClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
