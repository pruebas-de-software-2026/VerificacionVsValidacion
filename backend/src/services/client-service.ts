import { prisma } from "./prisma";
import type { CreateClientBody, UpdateClientBody } from "../schemas/client-schema";
import type { PaginationQuery } from "../lib/pagination";

export async function listClients(pagination: PaginationQuery) {
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.client.count(),
  ]);

  return { items, total, page, pageSize };
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export async function createClient(body: CreateClientBody) {
  return prisma.client.create({
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone,
    },
  });
}

export async function updateClient(id: string, body: UpdateClientBody) {
  return prisma.client.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email ?? null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    },
  });
}
