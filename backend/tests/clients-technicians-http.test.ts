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

const LECTOR_EMAIL = "lector-http-test@example.test";
const LECTOR_PASSWORD = "lector-http-test-pass";

describe("Clients and technicians HTTP API", () => {
  const app = createApp();
  let lectorUserId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash(LECTOR_PASSWORD, 10);
    const lector = await prisma.user.upsert({
      where: { email: LECTOR_EMAIL },
      update: { passwordHash: hash, role: Role.LECTOR, isActive: true },
      create: {
        email: LECTOR_EMAIL,
        name: "Lector HTTP Test",
        passwordHash: hash,
        role: Role.LECTOR,
        isActive: true,
      },
    });
    lectorUserId = lector.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: LECTOR_EMAIL } });
    await prisma.$disconnect();
  });

  it("rejects unauthenticated GET /clients", async () => {
    await request(app).get("/clients").expect(401);
  });

  it("admin creates and lists a client (functional)", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const name = `Cliente Test ${Date.now()}`;
    const createRes = await agent
      .post("/clients")
      .send({
        name,
        email: `client-${Date.now()}@example.test`,
        phone: "+34900111222",
        address: "Calle Cliente HTTP 1",
      })
      .expect(201);

    expect(createRes.body?.status).toBe("ok");
    expect(createRes.body?.data?.client?.name).toBe(name);

    const listRes = await agent.get("/clients").expect(200);
    const items = listRes.body?.data?.items as { name: string }[];
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((c) => c.name === name)).toBe(true);
  });

  it("returns 400 when client payload is invalid", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const res = await agent.post("/clients").send({ name: "" }).expect(400);
    expect(res.body?.status).toBe("error");
    expect(Array.isArray(res.body?.issues)).toBe(true);
  });

  it("lector cannot POST /clients", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: LECTOR_EMAIL, password: LECTOR_PASSWORD }).expect(200);
    await agent
      .post("/clients")
      .send({ name: "No permitido", phone: "+34900111222", address: "Calle 1" })
      .expect(403);
  });

  it("lector can GET /clients", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: LECTOR_EMAIL, password: LECTOR_PASSWORD }).expect(200);
    await agent.get("/clients").expect(200);
  });

  it("GET /clients/:id returns 404 for unknown id", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);
    await agent.get("/clients/cl_nonexistent_id_xxxxxxxx").expect(404);
  });

  it("accepts Authorization Bearer for technicians list", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: lectorUserId } });
    const token = signAccessToken(user);
    const res = await request(app).get("/technicians").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body?.status).toBe("ok");
  });

  it("admin creates technician with isActive default true", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const name = `Técnico Test ${Date.now()}`;
    const createRes = await agent.post("/technicians").send({ name, specialty: "Test" }).expect(201);
    expect(createRes.body?.data?.technician?.isActive).toBe(true);

    const id = createRes.body?.data?.technician?.id as string;
    const getRes = await agent.get(`/technicians/${id}`).expect(200);
    expect(getRes.body?.data?.technician?.name).toBe(name);
  });

  it("admin can toggle technician isActive", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const createRes = await agent
      .post("/technicians")
      .send({ name: `Toggle ${Date.now()}`, specialty: "QA", isActive: true })
      .expect(201);
    const id = createRes.body?.data?.technician?.id as string;

    await agent.put(`/technicians/${id}`).send({ isActive: false }).expect(200);
    const getRes = await agent.get(`/technicians/${id}`).expect(200);
    expect(getRes.body?.data?.technician?.isActive).toBe(false);
  });

  it("admin updates a client via PUT", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const createRes = await agent
      .post("/clients")
      .send({
        name: `Put Client ${Date.now()}`,
        email: `put-${Date.now()}@example.test`,
        phone: "+34900111222",
        address: "Calle Put 1",
      })
      .expect(201);
    const id = createRes.body?.data?.client?.id as string;

    const updated = await agent.put(`/clients/${id}`).send({ name: "Nombre actualizado" }).expect(200);
    expect(updated.body?.data?.client?.name).toBe("Nombre actualizado");
  });

  it("returns 400 when technician name is invalid", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const res = await agent.post("/technicians").send({ name: "" }).expect(400);
    expect(res.body?.issues).toBeDefined();
  });

  it("returns 409 when client email duplicates", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

    const email = `dup-${Date.now()}@example.test`;
    await agent
      .post("/clients")
      .send({ name: "Primero", email, phone: "+34900111222", address: "Dir A" })
      .expect(201);
    const res = await agent
      .post("/clients")
      .send({ name: "Segundo", email, phone: "+34900111333", address: "Dir B" })
      .expect(409);
    expect(res.body?.status).toBe("error");
  });
});
