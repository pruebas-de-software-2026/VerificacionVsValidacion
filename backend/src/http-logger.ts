import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import pinoHttp from "pino-http";
import { logger } from "./logger";

function resolveRequestId(req: Request): string {
  const incomingRequestId = req.header("x-request-id");

  if (incomingRequestId && incomingRequestId.trim().length > 0) {
    return incomingRequestId.trim();
  }

  return randomUUID();
}

export const httpLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const requestId = resolveRequestId(req as Request);
    res.setHeader("X-Request-Id", requestId);
    return requestId;
  },
  customLogLevel(_req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

export function getRequestId(req: Request, res?: Response): string {
  const reqWithId = req as Request & { id?: string };
  const responseHeaderId = typeof res?.getHeader("X-Request-Id") === "string" ? String(res.getHeader("X-Request-Id")) : undefined;

  return reqWithId.id ?? responseHeaderId ?? "unknown";
}
