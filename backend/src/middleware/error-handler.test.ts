import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../errors/http-error";
import { ValidationError } from "../errors/validation-error";
import { errorHandler, notFoundHandler } from "./error-handler";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    getHeader: vi.fn(),
  };
  return res as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("notFoundHandler", () => {
  it("passes a 404 error to next", () => {
    const next = vi.fn();
    const req = { method: "GET", originalUrl: "/nope" } as Request;
    notFoundHandler(req, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as Error & { statusCode?: number };
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("GET");
    expect(err.message).toContain("/nope");
  });
});

describe("errorHandler", () => {
  it("responds 400 with issues for ValidationError", () => {
    const res = mockRes();
    const req = { id: "req-1" } as Request;
    const err = new ValidationError([{ code: "custom", message: "x", path: ["a"] }]);
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        issues: err.issues,
        requestId: "req-1",
      }),
    );
  });

  it("responds 409 for Prisma unique constraint P2002", () => {
    const res = mockRes();
    const req = { id: "r2" } as Request;
    const err = new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002",
      clientVersion: "test",
    });
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", message: expect.stringMatching(/único/i) }),
    );
  });

  it("responds with HttpError status and logs warn for 4xx", () => {
    const res = mockRes();
    const req = { id: "r3", originalUrl: "/x", method: "POST", log: { warn: vi.fn(), error: vi.fn() } } as Request & {
      log: { warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
    };
    const err = new HttpError(404, "missing");
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(req.log.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "missing" }));
  });

  it("responds with HttpError 500 and logs error", () => {
    const res = mockRes();
    const req = { id: "r4", originalUrl: "/y", method: "GET", log: { warn: vi.fn(), error: vi.fn() } } as Request & {
      log: { warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
    };
    const err = new HttpError(500, "boom");
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(req.log.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("includes code in JSON when HttpError has code", () => {
    const res = mockRes();
    const req = { id: "r5", originalUrl: "/z", method: "GET" } as Request;
    const err = new HttpError(409, "conflict", "CODE_X");
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "CODE_X" }));
  });

  it("handles generic Error with numeric statusCode (4xx)", () => {
    const res = mockRes();
    const req = { id: "r6", originalUrl: "/a", method: "GET", log: { warn: vi.fn(), error: vi.fn() } } as Request & {
      log: { warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
    };
    const err = Object.assign(new Error("client"), { statusCode: 422 });
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(req.log.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "client" }));
  });

  it("handles generic Error with invalid statusCode as 500", () => {
    const res = mockRes();
    const req = { id: "r7", originalUrl: "/b", method: "GET", log: { warn: vi.fn(), error: vi.fn() } } as Request & {
      log: { warn: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
    };
    const err = Object.assign(new Error("oops"), { statusCode: 9.5 });
    errorHandler(err, req, res, vi.fn() as NextFunction);
    expect(req.log.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Error interno del servidor" }),
    );
  });
});
