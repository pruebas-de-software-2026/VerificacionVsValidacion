import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!.trim() });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
const result = await prisma.user.deleteMany({ where: { email } });
console.log({ deleted: result.count, email });

await prisma.$disconnect();
