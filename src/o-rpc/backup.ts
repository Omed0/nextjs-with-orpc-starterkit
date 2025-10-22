/**
 * oRPC Backup API
 * Endpoints for managing database backups
 */

import { publicProcedure } from "./base";
import { z } from "zod";
import {
  triggerBackup,
  scheduleAutomaticBackup,
  scheduleWeeklyBackup,
} from "@/lib/bullmq/examples/database-backup-queue";
import { queueManager, QueueName } from "@/lib/bullmq";

export const backupRouter = {
  /**
   * Trigger a manual backup
   */
  triggerBackup: publicProcedure
    .input(
      z.object({
        type: z.enum(["full", "schema-only"]).default("full"),
        scheduledBy: z.string().optional(),
        retentionDays: z.number().min(1).max(365).default(30),
        compress: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      const job = await triggerBackup(input);
      return {
        success: true,
        jobId: job.id,
        message: "Backup job queued successfully",
      };
    }),

  /**
   * Schedule automatic backup (daily at 2 AM)
   */
  scheduleDaily: publicProcedure.handler(async () => {
    const job = await scheduleAutomaticBackup();
    return {
      success: true,
      jobId: job.id,
      message: "Daily backup scheduled at 2 AM",
    };
  }),

  /**
   * Schedule weekly backup (Sunday at 3 AM)
   */
  scheduleWeekly: publicProcedure.handler(async () => {
    const job = await scheduleWeeklyBackup();
    return {
      success: true,
      jobId: job.id,
      message: "Weekly backup scheduled for Sunday at 3 AM",
    };
  }),

  /**
   * Schedule custom backup
   */
  scheduleCustom: publicProcedure
    .input(
      z.object({
        pattern: z.string(), // Cron pattern
        type: z.enum(["full", "schema-only"]).default("full"),
        retentionDays: z.number().min(1).max(365).default(30),
        compress: z.boolean().default(true),
      })
    )
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);

      const job = await queue.add(
        "database-backup",
        {
          type: input.type,
          scheduledBy: "custom-schedule",
          retentionDays: input.retentionDays,
          compress: input.compress,
        },
        {
          repeat: {
            pattern: input.pattern,
          },
          priority: 2,
        }
      );

      return {
        success: true,
        jobId: job.id,
        pattern: input.pattern,
        message: "Custom backup schedule created",
      };
    }),

  /**
   * Get scheduled backups
   */
  getScheduled: publicProcedure.handler(async () => {
    const queue = queueManager.getQueue(QueueName.CLEANUP);
    const repeatableJobs = await queue.getJobSchedulers();

    return repeatableJobs.map((job) => ({
      id: job.id,
      name: job.name,
      pattern: job.pattern,
      next: job.next,
      key: job.key,
    }));
  }),

  /**
   * Remove scheduled backup
   */
  removeScheduled: publicProcedure
    .input(z.object({ key: z.string() }))
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);
      await queue.removeJobScheduler(input.key);

      return {
        success: true,
        message: "Scheduled backup removed",
      };
    }),

  /**
   * Get backup job status
   */
  getJobStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);
      const job = await queue.getJob(input.jobId);

      if (!job) {
        return null;
      }

      const state = await job.getState();

      return {
        id: job.id,
        name: job.name,
        data: job.data,
        state,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
      };
    }),

  /**
   * Get recent backup jobs
   */
  getRecentJobs: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);

      const [completed, failed, active, waiting] = await Promise.all([
        queue.getCompleted(0, input.limit),
        queue.getFailed(0, input.limit),
        queue.getActive(0, input.limit),
        queue.getWaiting(0, input.limit),
      ]);

      const jobs = [...active, ...waiting, ...completed, ...failed]
        .filter((job) => job.name === "database-backup")
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, input.limit);

      return Promise.all(
        jobs.map(async (job) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          state: await job.getState(),
          progress: job.progress,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
          returnvalue: job.returnvalue,
        }))
      );
    }),

  /**
   * Get backup statistics
   */
  getStats: publicProcedure.handler(async () => {
    const queue = queueManager.getQueue(QueueName.CLEANUP);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }),

  /**
   * Retry a failed backup
   */
  retryJob: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);
      const job = await queue.getJob(input.jobId);

      if (!job) {
        throw new Error("Job not found");
      }

      await job.retry();

      return {
        success: true,
        message: "Backup job queued for retry",
      };
    }),

  /**
   * Remove a backup job
   */
  removeJob: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .handler(async ({ input }) => {
      const queue = queueManager.getQueue(QueueName.CLEANUP);
      const job = await queue.getJob(input.jobId);

      if (!job) {
        throw new Error("Job not found");
      }

      await job.remove();

      return {
        success: true,
        message: "Backup job removed",
      };
    }),
};
