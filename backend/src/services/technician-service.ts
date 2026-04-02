import { prisma } from "./prisma";
import type { CreateTechnicianBody, UpdateTechnicianBody } from "../schemas/technician-schema";
import type { PaginationQuery } from "../lib/pagination";

export async function listTechnicians(pagination: PaginationQuery) {
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.technician.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.technician.count(),
  ]);

  return { items, total, page, pageSize };
}

export async function getTechnicianById(id: string) {
  return prisma.technician.findUnique({ where: { id } });
}

export async function createTechnician(body: CreateTechnicianBody) {
  return prisma.technician.create({
    data: {
      name: body.name,
      specialty: body.specialty,
      isActive: body.isActive ?? true,
    },
  });
}

export async function updateTechnician(id: string, body: UpdateTechnicianBody) {
  return prisma.technician.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.specialty !== undefined ? { specialty: body.specialty } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });
}
