/**
 * Initialize all BullMQ workers
 * 
 * Call this function during application startup to register all job processors
 */

import { registerEmailWorker } from "./examples/email-queue";
import { registerFileProcessingWorker } from "./examples/file-processing-queue";
import { registerWebhookWorker } from "./examples/webhook-queue";
import { registerBackupWorker } from "./examples/database-backup-queue";

/**
 * Initialize all workers
 * This should be called once when the application starts
 */
export async function initializeWorkers(): Promise<void> {
  console.log("🚀 Initializing BullMQ workers...");

  try {
    // Register all workers
    registerEmailWorker();
    registerFileProcessingWorker();
    registerWebhookWorker();
    registerBackupWorker();

    console.log("✅ All BullMQ workers initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing BullMQ workers:", error);
    throw error;
  }
}

/**
 * Example: Add this to your app initialization
 * 
 * In Next.js, you can add this to:
 * - src/instrumentation.ts (for server-side initialization)
 * - A custom server file
 * - An API route that runs on startup
 * 
 * Example in instrumentation.ts:
 * ```typescript
 * export async function register() {
 *   if (process.env.NEXT_RUNTIME === 'nodejs') {
 *     await initializeWorkers();
 *   }
 * }
 * ```
 */
