/**
 * Queue Pause/Resume API
 * 
 * POST /api/queues/[queueName]/pause
 * POST /api/queues/[queueName]/resume
 */

import { NextRequest, NextResponse } from "next/server";
import { queueManager, QueueName } from "@/lib/bullmq";

export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string; action: string } }
) {
  try {
    const { queueName, action } = params;

    if (!Object.values(QueueName).includes(queueName as QueueName)) {
      return NextResponse.json(
        { error: "Invalid queue name" },
        { status: 400 }
      );
    }

    if (action === "pause") {
      await queueManager.pauseQueue(queueName as QueueName);
      return NextResponse.json({
        success: true,
        message: `Queue ${queueName} paused`,
      });
    } else if (action === "resume") {
      await queueManager.resumeQueue(queueName as QueueName);
      return NextResponse.json({
        success: true,
        message: `Queue ${queueName} resumed`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'pause' or 'resume'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error ${params.action}ing queue:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${params.action} queue`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
