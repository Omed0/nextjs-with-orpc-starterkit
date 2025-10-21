import { betterAuth, z } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  admin,
  //username,
  //organization,
  //magicLink,
  emailOTP,
  haveIBeenPwned,
} from "better-auth/plugins";
import { env } from "@/lib/utils/env";
import { cache as secStorage, rateLimiters } from "@/lib/redis";
import prisma from "@/prisma";
import { cache } from "react";
import { nextCookies } from "better-auth/next-js";

//const options = {
//  //...config options
//  plugins: [
//    //...plugins
//  ],
//} satisfies BetterAuthOptions;

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  telemetry: { enabled: false },
  trustedOrigins: [env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,

    //async sendResetPassword: async (data, request) => {
    //},
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  secondaryStorage: {
    get(key) {
      return secStorage.get(key);
    },
    set(key, value) {
      return secStorage.set(key, value);
    },
    delete(key) {
      secStorage.delete(key);
    },
  },
  rateLimit: {
    window: 10, // time in milliseconds
    max: 100, // max requests per millisecond window
    storage: "secondary-storage",
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 4,
      },
      //"/sign-in/password": {
      //  window: 60,
      //  max: 14,
      //},
      "/two-factor/*": async () => {
        // custom function to return rate limit window and max
        return {
          window: 60,
          max: 4,
        };
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 15, // 15 minutes
    },
    storeSessionInDatabase: true,
    //updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  plugins: [
    admin(),
    haveIBeenPwned(),
    //username(),
    //organization(),
    nextCookies(),
    emailOTP({
      async sendVerificationOTP() {},
    }),
  ],
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: process.env.NODE_ENV === "production",
      partitioned: true,
    },
  },
});

export type getSessionType = ReturnType<typeof auth.api.getSession>;
export const getSession = cache(
  async (headers: Headers): Promise<getSessionType> => {
    return await auth.api.getSession({ headers });
  }
);
