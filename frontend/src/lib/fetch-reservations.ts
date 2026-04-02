import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import type { ReservationsListQuery } from "@/lib/list-query";
import { toQueryString } from "@/lib/list-query";
import type { ReservationsListData } from "@/lib/types/reservation";

async function getCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}

/** Listado de reservas con paginación y filtros en query. */
export async function fetchReservationsList(
  query: ReservationsListQuery,
): Promise<{ ok: true; data: ReservationsListData } | { ok: false; error: "unauthorized" | "failed" }> {
  const qs = toQueryString({
    page: query.page,
    pageSize: query.pageSize,
    q: query.q,
    from: query.from,
    to: query.to,
    status: query.status,
    technicianId: query.technicianId,
  });
  const url = await getBackendProxyUrl(`/reservations?${qs}`);
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
