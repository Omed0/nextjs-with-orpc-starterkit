import type { ConnectionOptions, QueueOptions, WorkerOptions } from "bullmq";
import { env } from "@/lib/utils/env";

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // BullMQ requires this to be null
  enableReadyCheck: false, // BullMQ manages connections internally
  retryStrategy(times) {
    return Math.min(times * 1000, 30000); // Max 30 seconds
  },
};

/**
 * Default queue options with best practices
 */
export const defaultQueueOptions: Omit<QueueOptions, "connection"> = {
    defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential", // Exponential backoff between retries
      delay: 1000, // Start with 1 second delay
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000, // Keep at most 1000 completed jobs
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
      count: 5000, // Keep at most 5000 failed jobs
    },
  },
};

/**
 * Default worker options with best practices
 */
export const defaultWorkerOptions: Omit<WorkerOptions, "connection"> = {
  concurrency: 10, // Process up to 10 jobs concurrently
  limiter: {
    max: 100, // Max 100 jobs
    duration: 1000, // Per second
  },
  // Enable auto-run (worker starts processing immediately)
  autorun: true,
  // Graceful shutdown
  lockDuration: 30000, // 30 seconds lock duration
  // Remove completed jobs
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

/**
 * Queue names enum for type safety
 */
export enum QueueName {
  EMAIL = "email",
  NOTIFICATION = "notification",
  FILE_PROCESSING = "file-processing",
  DATA_EXPORT = "data-export",
  ANALYTICS = "analytics",
  WEBHOOK = "webhook",
  CLEANUP = "cleanup",
  DEFAULT = "default",
}

/**
 * Job priorities
 */
export enum JobPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5,
}
