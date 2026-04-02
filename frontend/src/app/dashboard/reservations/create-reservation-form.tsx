"use client";

import { format } from "date-fns";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientRow, TechnicianRow } from "@/lib/types/catalog";
import { createReservationAction, type ReservationActionState } from "./actions";

const initial: ReservationActionState = {};

type Props = {
  clients: ClientRow[];
  technicians: TechnicianRow[];
};

export function CreateReservationForm({ clients, technicians }: Props) {
  const [state, formAction, pending] = useActionState(createReservationAction, initial);
  const minDate = format(new Date(), "yyyy-MM-dd");
  const activeTechnicians = technicians.filter((t) => t.isActive);

  return (
    <Card className="border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <CardHeader>
        <CardTitle className="text-lg">Nueva reserva</CardTitle>
        <CardDescription>
          Selecciona cliente, técnico y franja horaria. Las horas se envían al servidor en UTC (ISO con Z).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <select
              id="clientId"
              name="clientId"
              required
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="technicianId">Técnico *</Label>
            <select
              id="technicianId"
              name="technicianId"
              required
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              {activeTechnicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.specialty ? ` — ${t.specialty}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input id="date" name="date" type="date" min={minDate} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Inicio *</Label>
            <Input id="startTime" name="startTime" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Fin *</Label>
            <Input id="endTime" name="endTime" type="time" required />
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
                  {i.path}: {i.message}
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
