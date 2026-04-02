"use client";

import { format } from "date-fns";
import { useActionState, useEffect, useState } from "react";
import { FormSearchableSelect } from "@/components/form-searchable-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { etiquetaCampo } from "@/lib/form-field-labels";
import type { ClientRow, TechnicianRow } from "@/lib/types/catalog";
import { createReservationAction, type ReservationActionState } from "./actions";

/** Bloques de inicio permitidos (9:00–17:00; cada uno dura 1 h hasta las 18:00). */
const BLOQUES_HORA_INICIO = Array.from({ length: 9 }, (_, i) => {
  const h = 9 + i;
  return `${String(h).padStart(2, "0")}:00`;
});

const initial: ReservationActionState = {};

type Props = {
  clients: ClientRow[];
  technicians: TechnicianRow[];
};

export function CreateReservationForm({ clients, technicians }: Props) {
  const [state, formAction, pending] = useActionState(createReservationAction, initial);
  const [selectKey, setSelectKey] = useState(0);
  const minDate = format(new Date(), "yyyy-MM-dd");
  const activeTechnicians = technicians.filter((t) => t.isActive);

  useEffect(() => {
    if (state.ok) {
      setSelectKey((k) => k + 1);
    }
  }, [state.ok]);

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
    keywords: [c.email, c.phone].filter(Boolean).join(" "),
  }));

  const technicianOptions = activeTechnicians.map((t) => ({
    value: t.id,
    label: `${t.name} — ${t.specialty}`,
    keywords: `${t.name} ${t.specialty}`,
  }));

  const startTimeOptions = BLOQUES_HORA_INICIO.map((v) => {
    const [hh] = v.split(":");
    const endH = Number.parseInt(hh ?? "0", 10) + 1;
    const label = `${v} – ${String(endH).padStart(2, "0")}:00`;
    return { value: v, label, keywords: label };
  });

  return (
    <Card className="border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <CardHeader>
        <CardTitle className="text-lg">Nueva reserva</CardTitle>
        <CardDescription>
          Horario laboral 9:00–18:00 en hora de Chile (Santiago, L–V), en bloques de 1 h. La hora de fin
          se calcula automáticamente (inicio + 1 h).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <FormSearchableSelect
              key={`client-${selectKey}`}
              id="clientId"
              name="clientId"
              required
              options={clientOptions}
              placeholder="Seleccionar cliente…"
              searchPlaceholder="Buscar por nombre, email o teléfono…"
              emptyLabel="No hay clientes que coincidan."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="technicianId">Técnico *</Label>
            <FormSearchableSelect
              key={`tech-${selectKey}`}
              id="technicianId"
              name="technicianId"
              required
              options={technicianOptions}
              placeholder="Seleccionar técnico…"
              searchPlaceholder="Buscar por nombre o especialidad…"
              emptyLabel="No hay técnicos activos que coincidan."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input id="date" name="date" type="date" min={minDate} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="startTime">Hora de inicio (bloque 1 h) *</Label>
            <FormSearchableSelect
              key={`time-${selectKey}`}
              id="startTime"
              name="startTime"
              required
              options={startTimeOptions}
              placeholder="Seleccionar hora…"
              searchPlaceholder="Buscar hora (ej. 10)…"
              emptyLabel="No hay bloques que coincidan."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción del problema / electrodoméstico *</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="Ej. frigorífico no enfría, lavadora pierde agua…"
              className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-red-600 sm:col-span-2 dark:text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.issues?.length ? (
            <ul className="list-inside list-disc text-sm text-red-600 sm:col-span-2 dark:text-red-400">
              {state.issues.map((i) => (
                <li key={`${i.path}-${i.message}`}>
                  {etiquetaCampo(i.path)}: {i.message}
                </li>
              ))}
            </ul>
          ) : null}
          {state.ok ? (
            <p className="text-sm text-emerald-700 sm:col-span-2 dark:text-emerald-400">Reserva creada.</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Crear reserva"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
