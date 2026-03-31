import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!.trim() });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, isActive: true, role: true, createdAt: true, updatedAt: true },
});

console.log(user);
await prisma.$disconnect();
