import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import type { CreateTechnicianBody, ListTechniciansParsedQuery, UpdateTechnicianBody } from "../schemas/technician-schema";
import type { PaginationQuery } from "../lib/pagination";

export type ListTechniciansInput = PaginationQuery & ListTechniciansParsedQuery;

export async function listTechnicians(input: ListTechniciansInput) {
  const { page, pageSize, q, specialty, isActive } = input;
  const skip = (page - 1) * pageSize;

  const where: Prisma.TechnicianWhereInput = {};
  const nameQ = q?.trim() ?? "";
  if (nameQ.length > 0) {
    where.name = { contains: nameQ, mode: "insensitive" };
  }
  const spec = specialty?.trim() ?? "";
  if (spec.length > 0) {
    where.specialty = { contains: spec, mode: "insensitive" };
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [items, total] = await Promise.all([
    prisma.technician.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.technician.count({ where }),
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
