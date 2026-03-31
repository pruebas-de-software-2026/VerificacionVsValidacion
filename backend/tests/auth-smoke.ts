import "dotenv/config";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, Role } from "../generated/prisma/client";
import { logger } from "../src/logger";

const databaseUrl = process.env.DATABASE_URL?.trim();
const adminEmailRaw = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

if (!adminEmailRaw) {
  throw new Error("Missing required environment variable: ADMIN_EMAIL");
}

if (!adminPassword) {
  throw new Error("Missing required environment variable: ADMIN_PASSWORD");
}

const adminEmail = adminEmailRaw.toLowerCase();

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });
const smokeLogger = logger.child({ component: "auth-smoke" });

let checks = 0;

function pass(message: string): void {
  checks += 1;
  smokeLogger.info({ action: "assertion", result: "pass", checkNumber: checks }, message);
}

function fail(message: string): never {
  throw new Error(`[FAIL] ${message}`);
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    fail(message);
  }
  pass(message);
}

function runSeed(extraEnv: Record<string, string> = {}): number {
  const npmExecPath = process.env.npm_execpath;

  const result = npmExecPath
    ? spawnSync(process.execPath, [npmExecPath, "run", "prisma:seed"], {
        stdio: "inherit",
        env: { ...process.env, ...extraEnv },
      })
    : spawnSync("npm", ["run", "prisma:seed"], {
        stdio: "inherit",
        env: { ...process.env, ...extraEnv },
      });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

async function main(): Promise<void> {
  const tmpEmail = `smoke-${randomUUID()}@example.test`;

  smokeLogger.info({ action: "run", result: "started" }, "Running auth smoke tests");

  const seedStatus1 = runSeed();
  assert(seedStatus1 === 0, "first seed execution exits successfully");

  const seedStatus2 = runSeed();
  assert(seedStatus2 === 0, "second seed execution exits successfully (idempotent)");

  const adminRows = await prisma.user.findMany({ where: { email: adminEmail } });
  assert(adminRows.length === 1, "exactly one admin row exists for ADMIN_EMAIL");

  const admin = adminRows[0];
  assert(admin.role === Role.ADMIN, "admin user has ADMIN role");
  assert(admin.isActive === true, "admin user is active");
  assert(admin.email === adminEmail, "admin email is normalized to lowercase");
  assert(admin.passwordHash !== adminPassword, "admin password is not stored in plaintext");
  assert(/^\$2[aby]\$/.test(admin.passwordHash), "admin passwordHash looks like bcrypt format");

  const created = await prisma.user.create({
    data: {
      email: tmpEmail,
      name: "Smoke Test User",
      passwordHash: "not-a-real-hash",
    },
  });

  assert(created.role === Role.LECTOR, "default role for User is LECTOR");
  assert(created.isActive === true, "default isActive for User is true");

  try {
    await prisma.user.create({
      data: {
        email: tmpEmail,
        name: "Duplicate Email",
        passwordHash: "another-fake-hash",
      },
    });
    fail("duplicate email should fail due to unique constraint");
  } catch (error: unknown) {
    const known = error as Prisma.PrismaClientKnownRequestError;
    assert(known.code === "P2002", "duplicate email triggers Prisma unique constraint error (P2002)");
  }

  await prisma.user.delete({ where: { id: created.id } });
  pass("temporary user cleanup succeeded");

  const invalidRoundsValues = ["9", "16", "abc"];
  for (const value of invalidRoundsValues) {
    const status = runSeed({ BCRYPT_ROUNDS: value });
    assert(status !== 0, `seed fails when BCRYPT_ROUNDS is invalid (${value})`);
  }

  smokeLogger.info({ action: "run", result: "completed", totalChecks: checks }, "Smoke tests finished");
}

main()
  .catch((error: unknown) => {
    smokeLogger.error({ action: "run", result: "failed", err: error }, "Auth smoke tests failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    smokeLogger.flush();
    await prisma.$disconnect();
  });
