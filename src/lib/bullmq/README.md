# BullMQ Integration

Comprehensive job queue management using BullMQ and Redis for background job processing, scheduling, and workflow management.

## Features

✅ **Queue Management** - Create and manage multiple queues  
✅ **Worker Processing** - Register job processors with concurrency control  
✅ **Job Scheduling** - Delayed and recurring jobs with cron patterns  
✅ **Flow Producer** - Parent-child job relationships and dependencies  
✅ **Retry Logic** - Exponential backoff for failed jobs  
✅ **Event Monitoring** - Comprehensive event tracking and logging  
✅ **Metrics & Monitoring** - Queue statistics and worker status  
✅ **Graceful Shutdown** - Clean resource cleanup  

## Installation

BullMQ has been installed and configured with your existing Redis setup.

## Quick Start

### 1. Basic Job Queue

```typescript
import { queueManager, workerManager, QueueName } from '@/lib/bullmq';

// Add a job to the queue
const job = await queueManager.addJob(
  QueueName.EMAIL,
  'send-welcome-email',
  {
    to: 'user@example.com',
    subject: 'Welcome!',
    body: 'Thanks for signing up',
  }
);

// Register a worker to process jobs
workerManager.registerWorker(QueueName.EMAIL, async (job) => {
  console.log('Processing job:', job.data);
  // Your email sending logic here
  return { sent: true };
});
```

### 2. Recurring Jobs

```typescript
import { queueManager, QueueName } from '@/lib/bullmq';

const queue = queueManager.getQueue(QueueName.CLEANUP);

// Run every day at 2 AM
await queue.add(
  'daily-cleanup',
  { task: 'cleanup-old-data' },
  {
    repeat: {
      pattern: '0 2 * * *', // Cron pattern
    },
  }
);
```

### 3. Delayed Jobs

```typescript
// Process after 1 hour
await queueManager.addJob(
  QueueName.NOTIFICATION,
  'send-reminder',
  { userId: '123' },
  {
    delay: 3600000, // 1 hour in ms
  }
);
```

### 4. Job Priorities

```typescript
import { JobPriority } from '@/lib/bullmq';

await queueManager.addJob(
  QueueName.EMAIL,
  'urgent-email',
  { to: 'admin@example.com' },
  {
    priority: JobPriority.CRITICAL, // Higher priority = processed first
  }
);
```

## Queue Names

Pre-configured queue names for common use cases:

```typescript
enum QueueName {
  EMAIL = "email",
  NOTIFICATION = "notification",
  FILE_PROCESSING = "file-processing",
  DATA_EXPORT = "data-export",
  ANALYTICS = "analytics",
  WEBHOOK = "webhook",
  CLEANUP = "cleanup",
  DEFAULT = "default",
}
```

## Worker Configuration

### Basic Worker

```typescript
import { workerManager, createProcessor } from '@/lib/bullmq';

workerManager.registerWorker(
  'my-queue',
  createProcessor(async (job) => {
    // Job processing logic
    await job.updateProgress(50); // Update progress
    await job.log('Processing step 1'); // Add log
    
    return { success: true };
  }),
  {
    concurrency: 5, // Process 5 jobs at once
    limiter: {
      max: 100, // Max 100 jobs
      duration: 1000, // Per second
    },
  }
);
```

### Worker Events

Workers automatically log:
- Job started
- Job completed
- Job failed
- Job progress
- Worker errors

## Job Flow (Parent-Child)

```typescript
import { flowProducerManager, createFlow } from '@/lib/bullmq';

const flow = createFlow({
  name: 'parent-job',
  queueName: 'main',
  data: { orderId: 123 },
  children: [
    {
      name: 'process-payment',
      queueName: 'payment',
      data: { orderId: 123 },
    },
    {
      name: 'send-confirmation',
      queueName: 'email',
      data: { orderId: 123 },
    },
  ],
});

await flowProducerManager.addFlow(flow);
```

## Queue Management

### Get Queue Metrics

```typescript
const metrics = await queueManager.getMetrics(QueueName.EMAIL);

console.log({
  waiting: metrics.waiting,
  active: metrics.active,
  completed: metrics.completed,
  failed: metrics.failed,
  delayed: metrics.delayed,
  total: metrics.total,
});
```

### Clean Old Jobs

```typescript
// Clean completed jobs older than 24 hours
await queueManager.cleanQueue(
  QueueName.EMAIL,
  86400000, // 24 hours in ms
  1000, // Max 1000 jobs
  'completed'
);

// Clean failed jobs
await queueManager.cleanQueue(
  QueueName.EMAIL,
  604800000, // 7 days
  5000,
  'failed'
);
```

### Pause/Resume Queue

```typescript
await queueManager.pauseQueue(QueueName.EMAIL);
await queueManager.resumeQueue(QueueName.EMAIL);
```

### Drain Queue (Remove Waiting Jobs)

```typescript
await queueManager.drainQueue(QueueName.EMAIL);
```

## Examples

The `/examples` directory contains full working examples:

### Email Queue (`email-queue.ts`)

```typescript
import { sendEmail, registerEmailWorker } from '@/lib/bullmq/examples/email-queue';

// On app startup
registerEmailWorker();

// Send an email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Thanks for signing up!',
});
```

### File Processing (`file-processing-queue.ts`)

```typescript
import { processFile, registerFileProcessingWorker } from '@/lib/bullmq/examples/file-processing-queue';

// On app startup
registerFileProcessingWorker();

// Process a file
await processFile({
  fileId: 'file-123',
  fileName: 'image.jpg',
  fileType: 'image/jpeg',
  fileUrl: 'https://example.com/uploads/image.jpg',
  userId: 'user-456',
  operations: ['resize', 'compress', 'thumbnail'],
});
```

### Webhook Delivery (`webhook-queue.ts`)

```typescript
import { sendWebhook, registerWebhookWorker } from '@/lib/bullmq/examples/webhook-queue';

// On app startup
registerWebhookWorker();

// Send a webhook with retries
await sendWebhook({
  url: 'https://api.partner.com/webhooks',
  method: 'POST',
  event: 'order.created',
  body: { orderId: 123 },
  headers: { 'X-API-Key': 'secret' },
});
```

### Recurring Jobs (`recurring-jobs.ts`)

```typescript
import { 
  scheduleCleanupJob,
  scheduleAnalyticsAggregation 
} from '@/lib/bullmq/examples/recurring-jobs';

// Schedule on app startup
await scheduleCleanupJob(); // Daily at 2 AM
await scheduleAnalyticsAggregation(); // Every hour
```

## Application Setup

### Initialize Workers (Server Startup)

Create `src/lib/bullmq/init-workers.ts`:

```typescript
import { registerEmailWorker } from './examples/email-queue';
import { registerFileProcessingWorker } from './examples/file-processing-queue';
import { registerWebhookWorker } from './examples/webhook-queue';

export async function initializeWorkers() {
  console.log('Initializing BullMQ workers...');
  
  registerEmailWorker();
  registerFileProcessingWorker();
  registerWebhookWorker();
  
  console.log('All workers initialized');
}
```

### Graceful Shutdown

In your app shutdown handler:

```typescript
import { gracefulShutdown } from '@/lib/bullmq';

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await gracefulShutdown();
  process.exit(0);
});
```

## API Routes Example

### Add Job Endpoint

```typescript
// app/api/jobs/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/bullmq/examples/email-queue';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const job = await sendEmail({
    to: body.to,
    subject: body.subject,
    body: body.body,
  });
  
  return NextResponse.json({
    success: true,
    jobId: job.id,
  });
}
```

### Queue Status Endpoint

```typescript
// app/api/jobs/status/route.ts
import { NextResponse } from 'next/server';
import { queueManager, QueueName } from '@/lib/bullmq';

export async function GET() {
  const queues = Object.values(QueueName);
  const status = await Promise.all(
    queues.map(async (queueName) => ({
      name: queueName,
      metrics: await queueManager.getMetrics(queueName),
    }))
  );
  
  return NextResponse.json({ queues: status });
}
```

## Best Practices

### 1. Job Retries

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s, 8s...
  },
}
```

### 2. Job Timeouts

```typescript
{
  timeout: 30000, // 30 seconds
}
```

### 3. Remove Completed Jobs

```typescript
{
  removeOnComplete: {
    age: 86400, // 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 604800, // 7 days
    count: 5000,
  },
}
```

### 4. Concurrency Control

```typescript
workerManager.registerWorker(
  'queue',
  processor,
  {
    concurrency: 5, // Process 5 jobs at once
  }
);
```

### 5. Rate Limiting

```typescript
{
  limiter: {
    max: 100, // Max jobs
    duration: 1000, // Per second
  },
}
```

### 6. Job Progress Tracking

```typescript
async (job) => {
  await job.updateProgress(25);
  // Do some work
  await job.updateProgress(50);
  // Do more work
  await job.updateProgress(100);
}
```

### 7. Job Logging

```typescript
async (job) => {
  await job.log('Starting processing');
  await job.log('Step 1 complete');
  await job.log('Finished');
}
```

## Monitoring

### Bull Board (Optional UI)

Install Bull Board for a web UI:

```bash
bun add @bull-board/api @bull-board/express
```

Then set up the dashboard (see Bull Board docs).

### Custom Monitoring

```typescript
import { queueManager } from '@/lib/bullmq';

// Get metrics for all queues
async function getQueueStats() {
  const queueNames = queueManager.getQueueNames();
  
  for (const name of queueNames) {
    const metrics = await queueManager.getMetrics(name);
    console.log(`Queue ${name}:`, metrics);
  }
}
```

## Cron Patterns

Common cron patterns for recurring jobs:

```
* * * * *   - Every minute
0 * * * *   - Every hour
0 0 * * *   - Every day at midnight
0 2 * * *   - Every day at 2 AM
0 0 * * 0   - Every Sunday at midnight
0 0 1 * *   - First day of every month
*/5 * * * * - Every 5 minutes
0 9-17 * * 1-5 - Every hour from 9 AM to 5 PM, Monday to Friday
```

## Troubleshooting

### Jobs Not Processing

1. Make sure worker is registered
2. Check Redis connection
3. Verify queue name matches
4. Check worker logs for errors

### Jobs Failing

1. Check job logs: `await job.logs()`
2. Verify retry configuration
3. Check error messages in failed jobs
4. Increase timeout if needed

### High Memory Usage

1. Enable job removal: `removeOnComplete` and `removeOnFail`
2. Clean old jobs regularly
3. Monitor queue sizes
4. Limit job retention period

## Architecture

```
Application
    ├── Queue Manager (Add jobs)
    ├── Worker Manager (Process jobs)
    ├── Scheduler (Delayed/Recurring)
    └── Flow Producer (Job workflows)
         ↓
    Redis (Storage & Coordination)
```

## Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Cron Pattern Guide](https://crontab.guru/)

---

Your BullMQ integration is ready for production! 🚀
