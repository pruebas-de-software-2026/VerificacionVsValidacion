"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { etiquetaCampo } from "@/lib/form-field-labels";
import { createClientAction, type ActionState } from "./actions";

const initial: ActionState = {};

export function CreateClientForm() {
  const [state, formAction, pending] = useActionState(createClientAction, initial);

  return (
    <Card className="border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <CardHeader>
        <CardTitle className="text-lg">Nuevo cliente</CardTitle>
        <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input id="name" name="name" placeholder="Nombre y apellidos" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono principal *</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+56 …" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección de atención *</Label>
            <Input id="address" name="address" placeholder="Calle, número, ciudad…" required />
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
            <p className="text-sm text-emerald-700 sm:col-span-2 dark:text-emerald-400">Cliente creado.</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Crear cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
