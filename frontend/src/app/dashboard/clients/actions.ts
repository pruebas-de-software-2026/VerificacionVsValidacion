"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import { clientFormSchema } from "@/lib/validations/client";

export type ActionState = { error?: string; issues?: { path: string; message: string }[]; ok?: boolean };

export async function createClientAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  };

  const parsed = clientFormSchema.safeParse({
    name: raw.name,
    email: raw.email === "" || raw.email === null ? undefined : raw.email,
    phone: raw.phone,
    address: raw.address,
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

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = await getBackendProxyUrl("/clients");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    issues?: unknown;
  };

  if (!res.ok) {
    return {
      error: typeof json.message === "string" ? json.message : "No se pudo crear el cliente",
      issues: Array.isArray(json.issues)
        ? (json.issues as { path?: string[]; message?: string }[]).map((i) => ({
            path: (i.path ?? []).join("."),
            message: i.message ?? "Inválido",
          }))
        : undefined,
    };
  }

  revalidatePath("/dashboard/clients");
  return { ok: true };
}
