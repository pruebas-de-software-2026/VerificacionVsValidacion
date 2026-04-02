import { ReservationStatus } from "../../generated/prisma/client";
import { HttpError } from "../errors/http-error";
import type { PaginationQuery } from "../lib/pagination";
import type { CreateReservationBody, ListReservationsParsedQuery } from "../schemas/reservation-schema";
import { prisma } from "./prisma";

export type ListReservationsInput = PaginationQuery & ListReservationsParsedQuery;

export async function listReservations(input: ListReservationsInput) {
  const { page, pageSize } = input;
  const skip = (page - 1) * pageSize;
  const fromDate = input.from ? new Date(input.from) : new Date();

  const where = {
    startAt: { gte: fromDate },
    ...(input.technicianId ? { technicianId: input.technicianId } : {}),
    ...(!input.includeCancelled ? { status: { not: ReservationStatus.CANCELADO } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: [{ technicianId: "asc" }, { startAt: "asc" }],
      skip,
      take: pageSize,
      include: {
        client: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function cancelReservation(id: string) {
  const existing = await prisma.reservation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });

  if (!existing) {
    throw new HttpError(404, "Reservation not found");
  }

  if (existing.status === ReservationStatus.CANCELADO) {
    return existing;
  }

  return prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELADO },
    include: {
      client: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}

/** Clave estable bigint para `pg_advisory_xact_lock` por técnico (serializa creación de reservas). */
export function technicianAdvisoryLockKey(technicianId: string): bigint {
  let h = 0n;
  for (let i = 0; i < technicianId.length; i++) {
    h = (h * 131n + BigInt(technicianId.charCodeAt(i))) & ((1n << 62n) - 1n);
  }
  return h === 0n ? 1n : h;
}

export async function createReservation(input: CreateReservationBody) {
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  if (startAt.getTime() < Date.now()) {
    throw new HttpError(400, "Reservation start must be in the future");
  }

  return prisma.$transaction(
    async (tx) => {
      const lockKey = technicianAdvisoryLockKey(input.technicianId);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

      const client = await tx.client.findUnique({ where: { id: input.clientId } });
      if (!client) {
        throw new HttpError(400, "Client not found");
      }

      const technician = await tx.technician.findUnique({ where: { id: input.technicianId } });
      if (!technician) {
        throw new HttpError(400, "Technician not found");
      }
      if (!technician.isActive) {
        throw new HttpError(400, "Technician is not active");
      }

      const overlapping = await tx.reservation.findFirst({
        where: {
          technicianId: input.technicianId,
          status: { not: ReservationStatus.CANCELADO },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (overlapping) {
        throw new HttpError(
          409,
          "Technician already has a reservation in this time range",
          "RESERVATION_OVERLAP",
        );
      }

      return tx.reservation.create({
        data: {
          clientId: input.clientId,
          technicianId: input.technicianId,
          startAt,
          endAt,
          status: ReservationStatus.PENDIENTE,
        },
      });
    },
    { maxWait: 5000, timeout: 15000 },
  );
}
