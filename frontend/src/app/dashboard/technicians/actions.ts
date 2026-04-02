"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getBackendProxyUrl } from "@/lib/internal-fetch";
import { technicianFormSchema } from "@/lib/validations/technician";

export type TechnicianActionState = {
  error?: string;
  issues?: { path: string; message: string }[];
  ok?: boolean;
};

export async function createTechnicianAction(
  _prev: TechnicianActionState,
  formData: FormData,
): Promise<TechnicianActionState> {
  const raw = {
    name: formData.get("name"),
    specialty: formData.get("specialty"),
  };

  const parsed = technicianFormSchema.safeParse({
    name: raw.name,
    specialty: raw.specialty,
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
  const url = await getBackendProxyUrl("/technicians");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      name: parsed.data.name,
      specialty: parsed.data.specialty,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { status?: string; message?: string; issues?: unknown };

  if (!res.ok) {
    return {
      error: typeof json.message === "string" ? json.message : "No se pudo crear el técnico",
      issues: Array.isArray(json.issues)
        ? (json.issues as { path?: string[]; message?: string }[]).map((i) => ({
            path: (i.path ?? []).join("."),
            message: i.message ?? "Inválido",
          }))
        : undefined,
    };
  }

  revalidatePath("/dashboard/technicians");
  return { ok: true };
}

export async function setTechnicianActive(id: string, isActive: boolean): Promise<TechnicianActionState> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = await getBackendProxyUrl(`/technicians/${id}`);

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    return { error: json.message ?? "No se pudo actualizar" };
  }

  revalidatePath("/dashboard/technicians");
  return { ok: true };
}
