import "dotenv/config";
import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "../generated/prisma/client";
import { createApp } from "../src/app";
import { prisma } from "../src/services/prisma";
import { signAccessToken } from "../src/services/auth-service";

const jwtSecret = process.env.JWT_SECRET?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

if (!jwtSecret || !adminEmail || !adminPassword) {
  throw new Error("Missing JWT_SECRET, ADMIN_EMAIL, or ADMIN_PASSWORD for HTTP tests");
}

const LECTOR_EMAIL = "lector-reservations-http@example.test";
const LECTOR_PASSWORD = "lector-reservations-http-pass";

describe("Reservations HTTP API", () => {
  const app = createApp();
  let clientId: string;
  let technicianId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash(LECTOR_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: LECTOR_EMAIL },
      update: { passwordHash: hash, role: Role.LECTOR, isActive: true },
      create: {
        email: LECTOR_EMAIL,
        name: "Lector Reservations Test",
        passwordHash: hash,
        role: Role.LECTOR,
        isActive: true,
      },
    });

    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const clientRes = await agent
      .post("/clients")
      .send({ name: `Res Client ${Date.now()}`, email: `res-client-${Date.now()}@example.test` })
      .expect(201);
    clientId = clientRes.body?.data?.client?.id as string;

    const techRes = await agent
      .post("/technicians")
      .send({ name: `Res Tech ${Date.now()}`, specialty: "QA" })
      .expect(201);
    technicianId = techRes.body?.data?.technician?.id as string;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { technicianId } });
    await prisma.user.deleteMany({ where: { email: LECTOR_EMAIL } });
  });

  it("rejects unauthenticated POST /reservations", async () => {
    await request(app)
      .post("/reservations")
      .send({
        clientId,
        technicianId,
        startAt: "2028-06-01T10:00:00.000Z",
        endAt: "2028-06-01T11:00:00.000Z",
      })
      .expect(401);
  });

  it("lector cannot POST /reservations", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: LECTOR_EMAIL, password: LECTOR_PASSWORD }).expect(200);
    await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId,
        startAt: "2028-06-01T10:00:00.000Z",
        endAt: "2028-06-01T11:00:00.000Z",
      })
      .expect(403);
  });

  it("admin creates a future reservation in a free slot (functional)", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const startAt = "2028-07-10T14:00:00.000Z";
    const endAt = "2028-07-10T15:00:00.000Z";
    const res = await agent
      .post("/reservations")
      .send({ clientId, technicianId, startAt, endAt })
      .expect(201);

    expect(res.body?.status).toBe("ok");
    expect(res.body?.data?.reservation?.id).toBeDefined();
    expect(res.body?.data?.reservation?.technicianId).toBe(technicianId);
  });

  it("returns 409 when reservation overlaps an existing one (negative)", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const day = "2028-08-20";
    await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId,
        startAt: `${day}T10:00:00.000Z`,
        endAt: `${day}T11:00:00.000Z`,
      })
      .expect(201);

    const overlap = await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId,
        startAt: `${day}T10:30:00.000Z`,
        endAt: `${day}T11:30:00.000Z`,
      })
      .expect(409);

    expect(overlap.body?.status).toBe("error");
    expect(overlap.body?.code).toBe("RESERVATION_OVERLAP");
  });

  it("returns 400 when client id does not exist", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const res = await agent
      .post("/reservations")
      .send({
        clientId: "cl_nonexistent_xxxxxxxx",
        technicianId,
        startAt: "2028-11-01T10:00:00.000Z",
        endAt: "2028-11-01T11:00:00.000Z",
      })
      .expect(400);

    expect(res.body?.message).toMatch(/client/i);
  });

  it("returns 400 when technician id does not exist", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const res = await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId: "cm_nonexistent_tech_xxxxxx",
        startAt: "2028-11-02T10:00:00.000Z",
        endAt: "2028-11-02T11:00:00.000Z",
      })
      .expect(400);

    expect(res.body?.message).toMatch(/technician/i);
  });

  it("returns 400 when technician is inactive", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const techRes = await agent
      .post("/technicians")
      .send({ name: `Inactive ${Date.now()}`, specialty: "QA" })
      .expect(201);
    const inactiveTechId = techRes.body?.data?.technician?.id as string;
    await agent.put(`/technicians/${inactiveTechId}`).send({ isActive: false }).expect(200);

    const res = await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId: inactiveTechId,
        startAt: "2028-11-03T10:00:00.000Z",
        endAt: "2028-11-03T11:00:00.000Z",
      })
      .expect(400);

    expect(res.body?.message).toMatch(/active/i);
  });

  it("returns 400 when start is in the past", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const res = await agent
      .post("/reservations")
      .send({
        clientId,
        technicianId,
        startAt: "2020-01-01T10:00:00.000Z",
        endAt: "2020-01-01T11:00:00.000Z",
      })
      .expect(400);

    expect(res.body?.status).toBe("error");
  });

  it("concurrent POSTs for the same slot: only one reservation persists (edge)", async () => {
    const admin = await prisma.user.findUniqueOrThrow({
      where: { email: adminEmail },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    const token = signAccessToken(admin);

    const day = "2028-09-01";
    const body = {
      clientId,
      technicianId,
      startAt: `${day}T16:00:00.000Z`,
      endAt: `${day}T17:00:00.000Z`,
    };

    const [first, second] = await Promise.all([
      request(app).post("/reservations").set("Authorization", `Bearer ${token}`).send(body),
      request(app).post("/reservations").set("Authorization", `Bearer ${token}`).send(body),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);

    const count = await prisma.reservation.count({
      where: {
        technicianId,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
      },
    });
    expect(count).toBe(1);
  });
});
