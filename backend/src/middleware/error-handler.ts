import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { getRequestId } from "../http-logger";
import { logger } from "../logger";
import { HttpError } from "../errors/http-error";
import { ValidationError } from "../errors/validation-error";

type HttpErrorLike = Error & { statusCode?: number; code?: string };

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error: HttpErrorLike = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err: HttpErrorLike, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    const requestId = getRequestId(req, res);
    res.status(400).json({
      status: "error",
      message: err.message,
      issues: err.issues,
      requestId,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const requestId = getRequestId(req, res);
    res.status(409).json({
      status: "error",
      message: "A record with this unique field already exists",
      requestId,
    });
    return;
  }

  if (err instanceof HttpError) {
    const requestId = getRequestId(req, res);
    const requestLogger = (req as Request & { log?: typeof logger }).log ?? logger;
    if (err.statusCode >= 500) {
      requestLogger.error(
        { err, requestId, path: req.originalUrl, method: req.method },
        "Unhandled server error",
      );
    } else {
      requestLogger.warn(
        {
          requestId,
          statusCode: err.statusCode,
          path: req.originalUrl,
          method: req.method,
          message: err.message,
        },
        "Request failed",
      );
    }
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      requestId,
    });
    return;
  }

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
