"use client"

import { QueueMetricsOverview } from "@/components/queue/queue-metrics"
import { QueueList } from "@/components/queue/queue-list"

export function QueueManager() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Queue Management
                </h1>
                <p className="text-muted-foreground">
                    Monitor and manage BullMQ job queues in real-time
                </p>
            </div>

            <QueueMetricsOverview />

            <QueueList />
        </div>
    )
}
