import "dotenv/config";
import request from "supertest";
import { createApp } from "../src/app";

const jwtSecret = process.env.JWT_SECRET?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (!adminEmail) {
  throw new Error("Missing required environment variable: ADMIN_EMAIL");
}

if (!adminPassword) {
  throw new Error("Missing required environment variable: ADMIN_PASSWORD");
}

async function main(): Promise<void> {
  const app = createApp();
  const agent = request.agent(app);

  await agent.get("/auth/me").expect(401);

  await agent
    .post("/auth/login")
    .send({ email: adminEmail, password: adminPassword })
    .expect(200)
    .expect((res) => {
      if (res.body?.status !== "ok" || !res.body?.user?.email) {
        throw new Error("login response should include status ok and user");
      }
    });

  await agent.get("/auth/me").expect(200).expect((res) => {
    if (res.body?.user?.email !== adminEmail) {
      throw new Error("/auth/me should return seeded admin email");
    }
  });

  await agent.post("/auth/logout").expect(200);

  await agent.get("/auth/me").expect(401);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
