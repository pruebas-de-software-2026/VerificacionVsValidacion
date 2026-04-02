"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { TechnicianRow } from "@/lib/types/catalog";
import { setTechnicianActive } from "./actions";

type Props = {
  technicians: TechnicianRow[];
};

export function TechniciansTable({ technicians }: Props) {
  const [pending, startTransition] = useTransition();

  if (technicians.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No hay técnicos todavía. Crea el primero con el formulario superior.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead className="w-[120px] text-right">Activo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.specialty ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={t.isActive}
                  disabled={pending}
                  onCheckedChange={(checked) => {
                    startTransition(async () => {
                      await setTechnicianActive(t.id, checked);
                    });
                  }}
                  aria-label={`Activo ${t.name}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
