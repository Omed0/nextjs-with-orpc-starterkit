import { env } from "@/lib/utils/env";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: env.NEXT_PUBLIC_PROJECT_NAME,
    short_name: `${env.NEXT_PUBLIC_PROJECT_NAME} with included examples u can fork and build on`,
    description: "",
    start_url: "/new",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
