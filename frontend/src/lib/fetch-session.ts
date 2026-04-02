import { headers } from "next/headers";
import { cache } from "react";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import type { AuthUser } from "@/lib/types/reservation";

async function getCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}

export const fetchAuthUser = cache(async function fetchAuthUser(): Promise<
  { ok: true; user: AuthUser } | { ok: false; error: "unauthorized" | "failed" }
> {
  const url = await getBackendProxyUrl("/auth/me");
  const res = await fetch(url, { headers: { cookie: await getCookieHeader() }, cache: "no-store" });
  if (res.status === 401) {
    return { ok: false, error: "unauthorized" };
  }
  if (!res.ok) {
    return { ok: false, error: "failed" };
  }
  const json = (await res.json()) as { user?: AuthUser };
  if (!json.user?.role) {
    return { ok: false, error: "failed" };
  }
  return { ok: true, user: json.user };
});
