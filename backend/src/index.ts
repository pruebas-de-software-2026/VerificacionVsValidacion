import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getRequestId, httpLogger } from "./http-logger";
import { logger } from "./logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const environment = process.env.NODE_ENV ?? "development";
const startedAt = Date.now();

let isShuttingDown = false;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend",
    env: environment,
    uptimeSec: Math.floor(process.uptime()),
    startedAt: new Date(startedAt).toISOString(),
    timestamp: new Date().toISOString(),
    requestId: getRequestId(req, res),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

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
