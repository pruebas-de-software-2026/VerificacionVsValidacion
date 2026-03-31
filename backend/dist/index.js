"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_logger_1 = require("./http-logger");
const logger_1 = require("./logger");
const error_handler_1 = require("./middleware/error-handler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 4000;
const environment = process.env.NODE_ENV ?? "development";
const startedAt = Date.now();
let isShuttingDown = false;
app.disable("x-powered-by");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(http_logger_1.httpLogger);
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "backend",
        env: environment,
        uptimeSec: Math.floor(process.uptime()),
        startedAt: new Date(startedAt).toISOString(),
        timestamp: new Date().toISOString(),
        requestId: (0, http_logger_1.getRequestId)(req, res),
    });
});
app.use(error_handler_1.notFoundHandler);
app.use(error_handler_1.errorHandler);
const server = app.listen(port, () => {
    logger_1.logger.info({ port, env: environment }, "Backend is running");
});
function gracefulShutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    logger_1.logger.warn({ signal }, "Shutdown signal received");
    server.close((error) => {
        if (error) {
            logger_1.logger.error({ err: error }, "Failed to close HTTP server");
            process.exit(1);
        }
        logger_1.logger.info("HTTP server closed successfully");
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000).unref();
}
process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
});
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error({ err: reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (error) => {
    logger_1.logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
});
//# sourceMappingURL=index.js.map