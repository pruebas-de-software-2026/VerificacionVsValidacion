"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const environment = process.env.NODE_ENV ?? "development";
const isProduction = environment === "production";
const logLevel = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");
const shouldPrettyPrint = !isProduction && process.env.LOG_PRETTY === "true";
const redactPaths = [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.body.password",
    "req.body.token",
    "req.body.accessToken",
    "req.body.refreshToken",
    "authorization",
    "password",
    "token",
    "accessToken",
    "refreshToken",
];
const transport = shouldPrettyPrint
    ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
        },
    }
    : undefined;
exports.logger = (0, pino_1.default)({
    level: logLevel,
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        service: "backend",
        env: environment,
    },
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    redact: {
        paths: redactPaths,
        censor: "[REDACTED]",
    },
    transport,
});
//# sourceMappingURL=logger.js.map