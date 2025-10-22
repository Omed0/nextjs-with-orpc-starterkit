# Queue Management System

Complete BullMQ queue management system using oRPC procedures with protected access control and a real-time monitoring GUI.

## 🎯 Overview

This system replaces Next.js API routes with type-safe oRPC procedures, providing:

- **Protected access** - Only authenticated users can manage queues
- **Type safety** - Full TypeScript support end-to-end
- **Real-time monitoring** - Auto-refreshing dashboard
- **Queue control** - Pause, resume, clean, and drain queues
- **Job management** - View, monitor, and remove individual jobs

## 📂 Architecture

```
src/
├── o-rpc/
│   └── queue.ts                    # oRPC procedures for queue operations
├── components/queue/
│   ├── queue-manager.tsx           # Main container component
│   ├── queue-metrics.tsx           # Overview metrics cards
│   └── queue-list.tsx              # Queue list with actions
└── app/(admin)/admin/queues/
    └── page.tsx                    # Admin queue management page
```

## 🔐 oRPC Procedures

All procedures are **protected** - requiring authentication to access.

### Location

`src/o-rpc/queue.ts`

### Available Procedures

#### 1. **getQueuesStatus**

Get status and metrics for all queues.

```typescript
const data = await orpc.queues.getQueuesStatus()

// Returns:
{
  queues: [{
    name: "email",
    isPaused: false,
    metrics: {
      waiting: 5,
      active: 2,
      completed: 100,
      failed: 3,
      delayed: 1
    }
  }],
  total: {
    waiting: 5,
    active: 2,
    completed: 100,
    failed: 3,
    delayed: 1
  },
  timestamp: "2025-10-22T..."
}
```

#### 2. **pauseQueue**

Pause a specific queue.

```typescript
const result = await orpc.queues.pauseQueue.mutate({
  queueName: QueueName.EMAIL
})

// Returns:
{
  success: true,
  message: "Queue email paused"
}
```

#### 3. **resumeQueue**

Resume a paused queue.

```typescript
const result = await orpc.queues.resumeQueue.mutate({
  queueName: QueueName.EMAIL
})

// Returns:
{
  success: true,
  message: "Queue email resumed"
}
```

#### 4. **cleanQueue**

Clean old jobs from a queue.

```typescript
const result = await orpc.queues.cleanQueue.mutate({
  queueName: QueueName.EMAIL,
  grace: 3600000,      // 1 hour in milliseconds
  limit: 100,          // Max jobs to clean
  status: "completed"  // "completed" or "failed"
})

// Returns:
{
  success: true,
  queueName: "email",
  cleaned: 42,
  jobIds: ["job1", "job2", ...]
}
```

#### 5. **drainQueue**

Remove all waiting jobs from a queue.

```typescript
const result = await orpc.queues.drainQueue.mutate({
  queueName: QueueName.EMAIL,
  delayed: false  // Include delayed jobs?
})

// Returns:
{
  success: true,
  message: "Queue email drained"
}
```

#### 6. **getJob**

Get details of a specific job.

```typescript
const job = await orpc.queues.getJob({
  queueName: QueueName.EMAIL,
  jobId: "12345"
})

// Returns:
{
  id: "12345",
  name: "send-welcome-email",
  data: { to: "user@example.com", ... },
  state: "completed",
  progress: 100,
  attemptsMade: 1,
  timestamp: 1697894400000,
  processedOn: 1697894401000,
  finishedOn: 1697894402000,
  returnvalue: { sent: true },
  failedReason: null
}
```

#### 7. **removeJob**

Remove a specific job from a queue.

```typescript
const result = await orpc.queues.removeJob.mutate({
  queueName: QueueName.EMAIL,
  jobId: "12345"
})

// Returns:
{
  success: true,
  message: "Job 12345 removed"
}
```

#### 8. **getJobsByStatus**

Get jobs by their status.

```typescript
const result = await orpc.queues.getJobsByStatus({
  queueName: QueueName.EMAIL,
  status: "failed",  // "completed" | "failed" | "delayed" | "active" | "wait" | "paused"
  limit: 50
})

// Returns:
{
  queueName: "email",
  status: "failed",
  total: 3,
  jobs: [
    {
      id: "job1",
      name: "send-email",
      data: {...},
      state: "failed",
      progress: 0,
      attemptsMade: 3,
      ...
    }
  ]
}
```

---

## 🎨 GUI Components

### QueueManager

The main container component orchestrating the entire queue management interface.

**Location:** `src/components/queue/queue-manager.tsx`

**Features:**

- Combines metrics overview and queue list
- Responsive layout
- Clean separation of concerns

**Usage:**

```tsx
import { QueueManager } from "@/components/queue";

export default function Page() {
  return <QueueManager />;
}
```

---

### QueueMetricsOverview

Real-time metrics cards showing aggregate queue statistics.

**Location:** `src/components/queue/queue-metrics.tsx`

**Features:**

- 5 metric cards: Waiting, Active, Completed, Failed, Delayed
- Auto-refresh every 5 seconds
- Color-coded icons and backgrounds
- Loading skeletons
- Responsive grid layout

**Visual Design:**

- Blue: Waiting jobs
- Green: Active jobs
- Emerald: Completed jobs
- Red: Failed jobs
- Orange: Delayed jobs

---

### QueueList

Interactive table showing all queues with real-time actions.

**Location:** `src/components/queue/queue-list.tsx`

**Features:**

- Real-time queue status
- Pause/Resume queue buttons
- Clean queue action
- Auto-refresh every 5 seconds
- Manual refresh button
- Status badges (Active/Paused/Error)
- Detailed metrics per queue

**Actions:**

- **Pause/Resume:** Toggle queue processing
- **Clean:** Remove old completed jobs (1 hour grace period, max 100 jobs)

---

## 🚀 Getting Started

### 1. Register Routes

The queue router is already registered in `src/o-rpc/routes.ts`:

```typescript
export const appRouter = {
  // ... other routes
  queues: queueRouter,
};
```

### 2. Access the GUI

Navigate to the admin queue management page:

```
/admin/queues
```

### 3. Use in Code

```typescript
import { orpc } from "@/lib/orpc";
import { QueueName } from "@/lib/bullmq";
import { useQuery, useMutation } from "@tanstack/react-query";

// Get all queue status
const { data } = useQuery(orpc.queues.getQueuesStatus.queryOptions());

// Pause a queue
const pauseQueue = useMutation(
  orpc.queues.pauseQueue.mutationOptions({
    onSuccess: () => {
      console.log("Queue paused!");
    },
  })
);

pauseQueue.mutate({ queueName: QueueName.EMAIL });

// Clean a queue
const cleanQueue = useMutation(orpc.queues.cleanQueue.mutationOptions());

cleanQueue.mutate({
  queueName: QueueName.EMAIL,
  grace: 3600000,
  limit: 100,
  status: "completed",
});
```

---

## 📊 Real-time Features

### Auto-refresh

Both the metrics overview and queue list auto-refresh every 5 seconds to provide real-time monitoring.

### Manual Refresh

Click the refresh button in the queue list header to manually update data.

### Loading States

- Skeleton loaders during initial load
- Disabled buttons during mutations
- Loading spinners on refresh

---

## 🔒 Security

### Authentication Required

All queue procedures use `protectedProcedure`, which:

- Requires active user session
- Redirects to `/sign-in` if unauthorized
- Provides `context.session` with user details

### Authorization

Consider adding role-based access control:

```typescript
// In base.ts
const requireAdminMiddleware = requireAuthMiddleware.middleware(
  async ({ context, next, errors }) => {
    if (context.session.user.role !== "admin") {
      throw errors.FORBIDDEN({ message: "Admin access required" })
    }
    return next({ context })
  }
)

export const adminProcedure = publicProcedure
  .use(requireAuthMiddleware)
  .use(requireAdminMiddleware)

// Then in queue.ts
export const pauseQueue = adminProcedure...
```

---

## 🎯 Example: Complete Workflow

### Add a Job

```typescript
import { queueManager, QueueName } from "@/lib/bullmq";

// Add email job
const job = await queueManager.addJob(QueueName.EMAIL, "send-welcome-email", {
  to: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up",
});
```

### Monitor in GUI

1. Visit `/admin/queues`
2. See the job in "Waiting" metrics
3. Watch it move to "Active" when processed
4. See it in "Completed" after processing

### Query Job Status

```typescript
const job = await orpc.queues.getJob({
  queueName: QueueName.EMAIL,
  jobId: job.id,
});

console.log(job.state); // "completed"
```

### Clean Old Jobs

```typescript
const result = await orpc.queues.cleanQueue.mutate({
  queueName: QueueName.EMAIL,
  grace: 86400000, // 24 hours
  limit: 1000,
  status: "completed",
});

console.log(`Cleaned ${result.cleaned} jobs`);
```

---

## 🔧 Configuration

### Queue Names

Add new queues in `src/lib/bullmq/config.ts`:

```typescript
export enum QueueName {
  EMAIL = "email",
  NOTIFICATION = "notification",
  ANALYTICS = "analytics",
  // Add your queues here
}
```

### Refresh Interval

Modify auto-refresh in components:

```typescript
// In queue-metrics.tsx or queue-list.tsx
React.useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000); // Change to 10 seconds

  return () => clearInterval(interval);
}, [refetch]);
```

---

## 📚 vs API Routes

### Before (API Routes)

```typescript
// Multiple route files
// src/app/api/queues/status/route.ts
// src/app/api/queues/[queueName]/pause/route.ts
// src/app/api/queues/[queueName]/resume/route.ts
// src/app/api/queues/[queueName]/clean/route.ts
// src/app/api/jobs/[jobId]/route.ts

// No type safety
const response = await fetch("/api/queues/status");
const data = await response.json(); // any type

// Manual error handling
if (!response.ok) {
  throw new Error("Failed to fetch");
}
```

### After (oRPC)

```typescript
// Single file: src/o-rpc/queue.ts

// Full type safety
const data = await orpc.queues.getQueuesStatus();
// data is fully typed!

// Automatic error handling
// Built-in mutations with TanStack Query
// Authentication handled automatically
```

---

## 🎉 Benefits

1. **Type Safety** - End-to-end TypeScript
2. **Less Code** - One procedure file vs multiple route files
3. **Better DX** - Auto-complete and IntelliSense
4. **Auth Built-in** - Protected procedures handle authentication
5. **TanStack Query Integration** - Caching, refetching, mutations
6. **Centralized** - All queue logic in one place
7. **Testable** - Easy to unit test procedures
8. **Maintainable** - Clear structure and organization

---

## 🚦 Deleted API Routes

The following Next.js API routes have been removed and replaced with oRPC:

- ❌ `src/app/api/queues/status/route.ts`
- ❌ `src/app/api/queues/[queueName]/[action]/route.ts`
- ❌ `src/app/api/queues/[queueName]/clean/route.ts`
- ❌ `src/app/api/jobs/[jobId]/route.ts`

✅ Replaced with `src/o-rpc/queue.ts`

---

## 🎨 Customization

### Add New Actions

Add procedures in `src/o-rpc/queue.ts`:

```typescript
export const retryFailedJobs = protectedProcedure
  .input(z.object({ queueName: z.nativeEnum(QueueName) }))
  .handler(async ({ input }) => {
    const jobs = await queueManager.getJobs(input.queueName, "failed");

    for (const job of jobs) {
      await job.retry();
    }

    return {
      success: true,
      retriedCount: jobs.length,
    };
  });

// Add to queueRouter
export const queueRouter = {
  // ... existing procedures
  retryFailedJobs,
};
```

### Add New Metrics

Modify `queue-metrics.tsx` to show custom metrics.

### Style Customization

All components use shadcn/ui and Tailwind CSS - fully customizable.

---

Happy queue managing! 🎉
