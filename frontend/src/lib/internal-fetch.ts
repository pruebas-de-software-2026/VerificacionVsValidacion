import { headers } from "next/headers";

/** URL absoluta hacia las rutas proxificadas `/backend/*` en el mismo origen Next. */
export async function getBackendProxyUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/backend${normalized}`;
}
