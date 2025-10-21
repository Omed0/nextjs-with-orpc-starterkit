export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/orpc.server");
    
    // Initialize BullMQ workers for background job processing
    const { initializeWorkers } = await import("@/lib/bullmq/init-workers");
    await initializeWorkers();
  }
}
