import posthog from "posthog-js";

const isEnabled = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_API_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_API_HOST &&
    process.env.NODE_ENV === "production"
);

if (isEnabled && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    defaults: "2025-05-24",
    capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
    capture_pageleave: true, // This enables capturing pageleave events, set to false if you don't want this
    capture_performance: true, // This enables capturing performance events, set to false if you don't want this
    debug: process.env.NODE_ENV === "development",
  });
}
