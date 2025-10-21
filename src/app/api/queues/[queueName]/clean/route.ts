/**
 * Queue Management API
 * 
 * POST /api/queues/[queueName]/clean
 * 
 * Clean old jobs from a specific queue
 */

import { NextRequest, NextResponse } from "next/server";
import { queueManager, QueueName } from "@/lib/bullmq";

export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string } }
) {
  try {
    const { queueName } = params;
    const body = await request.json();

    const grace = body.grace || 86400000; // 24 hours default
    const limit = body.limit || 1000;
    const status = body.status || "completed";

    if (!Object.values(QueueName).includes(queueName as QueueName)) {
      return NextResponse.json(
        { error: "Invalid queue name" },
        { status: 400 }
      );
    }

    const cleaned = await queueManager.cleanQueue(
      queueName as QueueName,
      grace,
      limit,
      status
    );

    return NextResponse.json({
      success: true,
      queueName,
      cleaned: cleaned.length,
      jobIds: cleaned,
    });
  } catch (error) {
    console.error("Error cleaning queue:", error);
    return NextResponse.json(
      {
        error: "Failed to clean queue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
