export async function register() {
  try {
    // Validate environment variables at startup
    const { getEnv } = await import("@/lib/config/env");
    getEnv();
    console.log("✅ Environment validation passed");

    // Initialize app (counter table, etc.)
    const { initApp } = await import("@/lib/init");
    await initApp();
    console.log("✅ App initialized");
  } catch (e) {
    console.error("❌ Startup failed:", e);
    process.exit(1);
  }
}
