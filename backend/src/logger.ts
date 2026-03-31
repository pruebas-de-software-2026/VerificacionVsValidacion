import pino from "pino";

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

export const logger = pino({
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "backend",
    env: environment,
  },
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  transport,
});
