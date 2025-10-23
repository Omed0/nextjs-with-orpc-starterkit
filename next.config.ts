import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  //cacheMaxMemorySize: 1024 * 1024 * 256, // 256 MB default is 50
  typedRoutes: true,
  output: "standalone",
  //serverExternalPackages: [], // this is good for something using nodejs apis like fs, path, etc. or can cause problem with edge by my understanding
  experimental: {
    globalNotFound: true,
    optimizePackageImports: [
      "zod",
      "minio",
      "next-intl",
      "sonner",
      "better-auth",
      "@tanstack/react-query",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
