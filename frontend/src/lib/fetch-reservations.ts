import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import type { ReservationsListData } from "@/lib/types/reservation";

async function getCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}

/** Próximas reservas (desde ahora, sin canceladas por defecto en API). */
export async function fetchReservationsList(): Promise<
  { ok: true; data: ReservationsListData } | { ok: false; error: "unauthorized" | "failed" }
> {
  const url = await getBackendProxyUrl("/reservations?page=1&pageSize=100");
  const res = await fetch(url, { headers: { cookie: await getCookieHeader() }, cache: "no-store" });
  if (res.status === 401) {
    return { ok: false, error: "unauthorized" };
  }
  if (!res.ok) {
    return { ok: false, error: "failed" };
  }
  const json = (await res.json()) as { data: ReservationsListData };
  return { ok: true, data: json.data };
}
