"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const http_logger_1 = require("../http-logger");
const logger_1 = require("../logger");
function notFoundHandler(req, _res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}
function errorHandler(err, req, res, _next) {
    const statusCode = Number.isInteger(err.statusCode) ? Number(err.statusCode) : 500;
    const requestId = (0, http_logger_1.getRequestId)(req, res);
    const requestLogger = req.log ?? logger_1.logger;
    if (statusCode >= 500) {
        requestLogger.error({
            err,
            requestId,
            path: req.originalUrl,
            method: req.method,
        }, "Unhandled server error");
    }
    else {
        requestLogger.warn({
            requestId,
            statusCode,
            path: req.originalUrl,
            method: req.method,
            message: err.message,
        }, "Request failed");
    }
    res.status(statusCode).json({
        status: "error",
        message: statusCode >= 500 ? "Internal server error" : err.message,
        requestId,
    });
}
//# sourceMappingURL=error-handler.js.map