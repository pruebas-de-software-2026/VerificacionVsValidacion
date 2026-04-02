import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./logger";

const app = createApp();
const port = Number(process.env.PORT) || 4000;
const environment = process.env.NODE_ENV ?? "development";

let isShuttingDown = false;

const server = app.listen(port, () => {
  logger.info({ port, env: environment }, "Backend is running");
});

function gracefulShutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.warn({ signal }, "Shutdown signal received");

  server.close((error?: Error) => {
    if (error) {
      logger.error({ err: error }, "Failed to close HTTP server");
      process.exit(1);
    }

    logger.info("HTTP server closed successfully");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error: Error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});
