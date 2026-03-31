"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
exports.getRequestId = getRequestId;
const node_crypto_1 = require("node:crypto");
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./logger");
function resolveRequestId(req) {
    const incomingRequestId = req.header("x-request-id");
    if (incomingRequestId && incomingRequestId.trim().length > 0) {
        return incomingRequestId.trim();
    }
    return (0, node_crypto_1.randomUUID)();
}
exports.httpLogger = (0, pino_http_1.default)({
    logger: logger_1.logger,
    genReqId(req, res) {
        const requestId = resolveRequestId(req);
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
function getRequestId(req, res) {
    const reqWithId = req;
    const responseHeaderId = typeof res?.getHeader("X-Request-Id") === "string" ? String(res.getHeader("X-Request-Id")) : undefined;
    return reqWithId.id ?? responseHeaderId ?? "unknown";
}
//# sourceMappingURL=http-logger.js.map