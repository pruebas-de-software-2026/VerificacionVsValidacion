"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import { reservationFormSchema, reservationFormToIsoPayload } from "@/lib/validations/reservation";

export type ReservationActionState = {
  error?: string;
  issues?: { path: string; message: string }[];
  ok?: boolean;
};

export async function createReservationAction(
  _prev: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const raw = {
    clientId: formData.get("clientId"),
    technicianId: formData.get("technicianId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    description: formData.get("description"),
  };

  const parsed = reservationFormSchema.safeParse({
    clientId: raw.clientId,
    technicianId: raw.technicianId,
    date: raw.date,
    startTime: raw.startTime,
    description: raw.description,
  });

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    };
  }

  const { startAt, endAt } = reservationFormToIsoPayload(parsed.data);

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = await getBackendProxyUrl("/reservations");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      clientId: parsed.data.clientId,
      technicianId: parsed.data.technicianId,
      startAt,
      endAt,
      description: parsed.data.description,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    code?: string;
    issues?: unknown;
  };

  if (res.status === 409) {
    return {
      error:
        typeof json.message === "string"
          ? json.message
          : "El técnico ya tiene una reserva en ese horario.",
    };
  }

  if (!res.ok) {
    return {
      error: typeof json.message === "string" ? json.message : "No se pudo crear la reserva",
      issues: Array.isArray(json.issues)
        ? (json.issues as { path?: string[]; message?: string }[]).map((i) => ({
            path: (i.path ?? []).join("."),
            message: i.message ?? "Dato inválido",
          }))
        : undefined,
    };
  }

  revalidatePath("/dashboard/reservations");
  return { ok: true };
}

export async function completeReservationAction(
  _prev: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const rawId = formData.get("reservationId");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id) {
    return { error: "Identificador de reserva inválido" };
  }

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = await getBackendProxyUrl(`/reservations/${encodeURIComponent(id)}/complete`);

  const res = await fetch(url, {
    method: "PATCH",
    headers: { cookie },
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string };

  if (res.status === 403) {
    return {
      error: "No tienes permiso para completar reservas (solo administradores).",
    };
  }

  if (res.status === 404) {
    return { error: "La reserva no existe." };
  }

  if (!res.ok) {
    return {
      error: typeof json.message === "string" ? json.message : "No se pudo marcar la reserva como completada",
    };
  }

  revalidatePath("/dashboard/reservations");
  return { ok: true };
}

export async function cancelReservationAction(
  _prev: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const rawId = formData.get("reservationId");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id) {
    return { error: "Identificador de reserva inválido" };
  }

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = await getBackendProxyUrl(`/reservations/${encodeURIComponent(id)}/cancel`);

  const res = await fetch(url, {
    method: "PATCH",
    headers: { cookie },
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string };

  if (res.status === 403) {
    return {
      error: "No tienes permiso para cancelar reservas (solo administradores).",
    };
  }

  if (res.status === 404) {
    return { error: "La reserva no existe o ya fue eliminada del sistema." };
  }

  if (!res.ok) {
    return {
      error: typeof json.message === "string" ? json.message : "No se pudo cancelar la reserva",
    };
  }

  revalidatePath("/dashboard/reservations");
  return { ok: true };
}
