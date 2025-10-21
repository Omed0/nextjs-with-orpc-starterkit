/**
 * Job Status API
 * 
 * GET /api/jobs/[jobId]?queue=queueName
 * 
 * Get status and details of a specific job
 */

import { NextRequest, NextResponse } from "next/server";
import { queueManager } from "@/lib/bullmq";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get("queue");

    if (!queueName) {
      return NextResponse.json(
        { error: "Queue name is required" },
        { status: 400 }
      );
    }

    const job = await queueManager.getJob(queueName, jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const state = await job.getState();
    const progress = job.progress;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get("queue");

    if (!queueName) {
      return NextResponse.json(
        { error: "Queue name is required" },
        { status: 400 }
      );
    }

    await queueManager.removeJob(queueName, jobId);

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} removed`,
    });
  } catch (error) {
    console.error("Error removing job:", error);
    return NextResponse.json(
      {
        error: "Failed to remove job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
