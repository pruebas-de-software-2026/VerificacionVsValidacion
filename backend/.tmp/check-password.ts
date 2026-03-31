import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!.trim() });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD!.trim();
const user = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } });

if (!user) {
  console.log({ exists: false });
} else {
  const matches = await bcrypt.compare(password, user.passwordHash);
  console.log({ exists: true, envPasswordMatchesHash: matches });
}

await prisma.$disconnect();
