// Note: QueueScheduler is deprecated in BullMQ v4+
// Scheduling is now handled automatically by the queue itself
// This file is kept for compatibility but schedulers are no longer needed

import { redisConnection, QueueName } from "./config";

/**
 * Scheduler Manager - Deprecated in BullMQ v4+
 * 
 * Note: In BullMQ v4+, the QueueScheduler is no longer needed.
 * Delayed and repeating jobs are handled automatically by the queue itself.
 * 
 * This manager is kept for backward compatibility but does nothing.
 */
class SchedulerManager {
  /**
   * Get scheduler - No-op in BullMQ v4+
   */
  getScheduler(queueName: string | QueueName): null {
    console.log(
      `Note: Schedulers are no longer needed in BullMQ v4+. Queue ${queueName} handles scheduling automatically.`
    );
    return null;
  }

  /**
   * Close scheduler - No-op in BullMQ v4+
   */
  async closeScheduler(queueName: string | QueueName): Promise<void> {
    // No-op
  }

  /**
   * Close all schedulers - No-op in BullMQ v4+
   */
  async closeAll(): Promise<void> {
    // No-op
  }

  /**
   * Get scheduler names - Returns empty array in BullMQ v4+
   */
  getSchedulerNames(): string[] {
    return [];
  }
}

// Singleton instance
export const schedulerManager = new SchedulerManager();

// Export for custom instances if needed
export { SchedulerManager };
