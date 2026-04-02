import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import type { ClientsListQuery, TechniciansListQuery } from "@/lib/list-query";
import { toQueryString } from "@/lib/list-query";
import type { ClientRow, Paginated, TechnicianRow } from "@/lib/types/catalog";

async function getCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}

export async function fetchClientsList(
  query: ClientsListQuery,
): Promise<{ ok: true; data: Paginated<ClientRow> } | { ok: false; error: "unauthorized" | "failed" }> {
  const qs = toQueryString({
    page: query.page,
    pageSize: query.pageSize,
    q: query.q,
  });
  const url = await getBackendProxyUrl(`/clients?${qs}`);
  const res = await fetch(url, { headers: { cookie: await getCookieHeader() }, cache: "no-store" });
  if (res.status === 401) {
    return { ok: false, error: "unauthorized" };
  }
  if (!res.ok) {
    return { ok: false, error: "failed" };
  }
  const json = (await res.json()) as { data: Paginated<ClientRow> };
  return { ok: true, data: json.data };
}

export async function fetchTechniciansList(
  query: TechniciansListQuery,
): Promise<{ ok: true; data: Paginated<TechnicianRow> } | { ok: false; error: "unauthorized" | "failed" }> {
  const qs = toQueryString({
    page: query.page,
    pageSize: query.pageSize,
    q: query.q,
    specialty: query.specialty,
    isActive: query.isActive,
  });
  const url = await getBackendProxyUrl(`/technicians?${qs}`);
  const res = await fetch(url, { headers: { cookie: await getCookieHeader() }, cache: "no-store" });
  if (res.status === 401) {
    return { ok: false, error: "unauthorized" };
  }
  if (!res.ok) {
    return { ok: false, error: "failed" };
  }
  const json = (await res.json()) as { data: Paginated<TechnicianRow> };
  return { ok: true, data: json.data };
}
