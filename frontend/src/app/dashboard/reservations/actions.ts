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
    endTime: formData.get("endTime"),
  };

  const parsed = reservationFormSchema.safeParse({
    clientId: raw.clientId,
    technicianId: raw.technicianId,
    date: raw.date,
    startTime: raw.startTime,
    endTime: raw.endTime,
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
            message: i.message ?? "Inválido",
          }))
        : undefined,
    };
  }

  revalidatePath("/dashboard/reservations");
  return { ok: true };
}
