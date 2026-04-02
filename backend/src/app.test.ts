import "dotenv/config";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  const prevCors = process.env.CORS_ORIGIN;
  const prevNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.CORS_ORIGIN = "http://localhost:3000";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    if (prevCors === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = prevCors;
    }
    if (prevNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = prevNodeEnv;
    }
  });

  it("GET /health returns service metadata", async () => {
    const res = await request(createApp()).get("/health").expect(200);
    expect(res.body).toMatchObject({
      status: "ok",
      service: "backend",
      env: "test",
    });
    expect(typeof res.body.uptimeSec).toBe("number");
    expect(res.body.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.headers["x-request-id"]).toBeDefined();
  });

  it("rejects requests when Origin is not allowed by CORS", async () => {
    await request(createApp())
      .get("/health")
      .set("Origin", "https://not-allowed.example")
      .expect(500);
  });
});
