import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import type { ClientRow, Paginated, TechnicianRow } from "@/lib/types/catalog";

async function getCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}

export async function fetchClientsList(): Promise<
  { ok: true; data: Paginated<ClientRow> } | { ok: false; error: "unauthorized" | "failed" }
> {
  const url = await getBackendProxyUrl("/clients?page=1&pageSize=100");
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

export async function fetchTechniciansList(): Promise<
  { ok: true; data: Paginated<TechnicianRow> } | { ok: false; error: "unauthorized" | "failed" }
> {
  const url = await getBackendProxyUrl("/technicians?page=1&pageSize=100");
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
