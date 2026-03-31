import type { NextFunction, Request, Response } from "express";
import { getRequestId } from "../http-logger";
import { logger } from "../logger";

type HttpError = Error & { statusCode?: number };

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error: HttpError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = Number.isInteger(err.statusCode) ? Number(err.statusCode) : 500;
  const requestId = getRequestId(req, res);
  const requestLogger = (req as Request & { log?: typeof logger }).log ?? logger;

  if (statusCode >= 500) {
    requestLogger.error(
      {
        err,
        requestId,
        path: req.originalUrl,
        method: req.method,
      },
      "Unhandled server error",
    );
  } else {
    requestLogger.warn(
      {
        requestId,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        message: err.message,
      },
      "Request failed",
    );
  }

  res.status(statusCode).json({
    status: "error",
    message: statusCode >= 500 ? "Internal server error" : err.message,
    requestId,
  });
}
