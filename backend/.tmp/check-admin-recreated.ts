import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!.trim() });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD!.trim();
const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, isActive: true, role: true, passwordHash: true } });

if (!user) {
  console.log({ exists: false });
} else {
  const matches = await bcrypt.compare(password, user.passwordHash);
  console.log({ exists: true, email: user.email, isActive: user.isActive, role: user.role, envPasswordMatchesHash: matches });
}

await prisma.$disconnect();
