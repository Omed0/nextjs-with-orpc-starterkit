/**
 * Queue Monitoring API
 * 
 * GET /api/queues/status
 * 
 * Returns status and metrics for all queues
 */

import { NextResponse } from "next/server";
import { queueManager, QueueName } from "@/lib/bullmq";

export async function GET() {
  try {
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

    return NextResponse.json({
      queues: queuesStatus,
      total: totalMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch queue status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
