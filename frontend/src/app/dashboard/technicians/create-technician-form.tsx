"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { etiquetaCampo } from "@/lib/form-field-labels";
import { createTechnicianAction, type TechnicianActionState } from "./actions";

const initial: TechnicianActionState = {};

export function CreateTechnicianForm() {
  const [state, formAction, pending] = useActionState(createTechnicianAction, initial);

  return (
    <Card className="border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <CardHeader>
        <CardTitle className="text-lg">Nuevo técnico</CardTitle>
        <CardDescription>
          Nombre completo y especialidad principal son obligatorios. El técnico queda activo por defecto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tname">Nombre *</Label>
            <Input id="tname" name="name" placeholder="Nombre completo" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="specialty">Especialidad principal *</Label>
            <Input
              id="specialty"
              name="specialty"
              placeholder="Ej. refrigeración, línea blanca…"
              required
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
            <p className="text-sm text-emerald-700 sm:col-span-2 dark:text-emerald-400">Técnico creado.</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Crear técnico"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
