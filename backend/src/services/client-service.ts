import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "./prisma";
import type { CreateClientBody, ListClientsParsedQuery, UpdateClientBody } from "../schemas/client-schema";
import type { PaginationQuery } from "../lib/pagination";

export type ListClientsInput = PaginationQuery & ListClientsParsedQuery;

export async function listClients(input: ListClientsInput) {
  const { page, pageSize, q } = input;
  const skip = (page - 1) * pageSize;

  const trimmed = q?.trim() ?? "";
  const where: Prisma.ClientWhereInput =
    trimmed.length > 0
      ? {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
          ],
        }
      : {};

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.client.count({ where }),
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
      address: body.address,
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
      ...(body.address !== undefined ? { address: body.address } : {}),
    },
  });
}
