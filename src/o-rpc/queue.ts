import z from "zod";
import { protectedProcedure } from "./base";
import { queueManager, QueueName } from "@/lib/bullmq";

/**
 * Queue Management oRPC Procedures
 * Protected routes for managing BullMQ queues
 */

// Get all queues status
export const getQueuesStatus = protectedProcedure.handler(async () => {
  const queueNames = Object.values(QueueName);

  const queuesStatus = await Promise.all(
    queueNames.map(async (queueName) => {
      try {
        const metrics = await queueManager.getMetrics(queueName);
        const queue = queueManager.getQueueInstance(queueName);

        return {
          name: queueName,
          isPaused: queue ? await queue.isPaused() : false,
          metrics,
        };
      } catch (error) {
        return {
          name: queueName,
          error: error instanceof Error ? error.message : "Unknown error",
          metrics: null,
        };
      }
    })
  );

  const totalMetrics = queuesStatus.reduce(
    (acc, queue) => {
      if (queue.metrics) {
        acc.waiting += queue.metrics.waiting;
        acc.active += queue.metrics.active;
        acc.completed += queue.metrics.completed;
        acc.failed += queue.metrics.failed;
        acc.delayed += queue.metrics.delayed;
      }
      return acc;
    },
    { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
  );

  return {
    queues: queuesStatus,
    total: totalMetrics,
    timestamp: new Date().toISOString(),
  };
});

// Pause a queue
export const pauseQueue = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
    })
  )
  .handler(async ({ input }) => {
    await queueManager.pauseQueue(input.queueName);
    return {
      success: true,
      message: `Queue ${input.queueName} paused`,
    };
  });

// Resume a queue
export const resumeQueue = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
    })
  )
  .handler(async ({ input }) => {
    await queueManager.resumeQueue(input.queueName);
    return {
      success: true,
      message: `Queue ${input.queueName} resumed`,
    };
  });

// Clean a queue
export const cleanQueue = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
      grace: z.number().default(86400000), // 24 hours default
      limit: z.number().default(1000),
      status: z.enum(["completed", "failed"]).default("completed"),
    })
  )
  .handler(async ({ input }) => {
    const cleaned = await queueManager.cleanQueue(
      input.queueName,
      input.grace,
      input.limit,
      input.status
    );

    return {
      success: true,
      queueName: input.queueName,
      cleaned: cleaned.length,
      jobIds: cleaned,
    };
  });

// Drain a queue (remove all waiting jobs)
export const drainQueue = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
      delayed: z.boolean().default(false),
    })
  )
  .handler(async ({ input }) => {
    await queueManager.drainQueue(input.queueName, input.delayed);
    return {
      success: true,
      message: `Queue ${input.queueName} drained`,
    };
  });

// Get job details
export const getJob = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
      jobId: z.string(),
    })
  )
  .handler(async ({ input, errors }) => {
    const job = await queueManager.getJob(input.queueName, input.jobId);

    if (!job) {
      throw errors.NOT_FOUND({ message: "Job not found" });
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  });

// Remove a job
export const removeJob = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
      jobId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    await queueManager.removeJob(input.queueName, input.jobId);
    return {
      success: true,
      message: `Job ${input.jobId} removed`,
    };
  });

// Get jobs by status
export const getJobsByStatus = protectedProcedure
  .input(
    z.object({
      queueName: z.enum(QueueName),
      status: z
        .enum(["completed", "failed", "delayed", "active", "wait", "paused"])
        .default("wait"),
      limit: z.number().default(50),
    })
  )
  .handler(async ({ input }) => {
    const jobs = await queueManager.getJobs(input.queueName, input.status);

    // Limit the results
    const limitedJobs = jobs.slice(0, input.limit);

    return {
      queueName: input.queueName,
      status: input.status,
      total: jobs.length,
      jobs: await Promise.all(
        limitedJobs.map(async (job) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          state: await job.getState(),
          progress: job.progress,
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
        }))
      ),
    };
  });

// Export all queue procedures
export const queueRouter = {
  getQueuesStatus,
  pauseQueue,
  resumeQueue,
  cleanQueue,
  drainQueue,
  getJob,
  removeJob,
  getJobsByStatus,
};
