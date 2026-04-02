import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReservationListItem } from "@/lib/types/reservation";
import { CancelReservationButton } from "./cancel-reservation-button";
import { CompleteReservationButton } from "./complete-reservation-button";

const reservationStatusLabel: Record<string, string> = {
  PROGRAMADA: "Programada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

type Props = {
  items: ReservationListItem[];
  isAdmin: boolean;
};

function formatRange(startAt: string, endAt: string) {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  return {
    date: format(start, "d MMM yyyy", { locale: es }),
    span: `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`,
  };
}

export function ReservationsTable({ items, isAdmin }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No hay reservas próximas. Crea una con el formulario inferior o ajusta los filtros en la API si usas datos de prueba.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Horario (local)</TableHead>
            <TableHead>Técnico</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="max-w-[12rem]">Descripción</TableHead>
            <TableHead>Estado</TableHead>
            {isAdmin ? <TableHead className="text-right">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const { date, span } = formatRange(row.startAt, row.endAt);
            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium capitalize">{date}</TableCell>
                <TableCell>{span}</TableCell>
                <TableCell>{row.technician.name}</TableCell>
                <TableCell>{row.client.name}</TableCell>
                <TableCell className="max-w-[12rem] truncate text-sm text-zinc-700 dark:text-zinc-300" title={row.description}>
                  {row.description}
                </TableCell>
                <TableCell>{reservationStatusLabel[row.status] ?? row.status}</TableCell>
                {isAdmin ? (
                  <TableCell className="text-right">
                    {row.status === "CANCELADA" || row.status === "COMPLETADA" ? (
                      <span className="text-xs text-zinc-500">—</span>
                    ) : (
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <CompleteReservationButton reservationId={row.id} />
                        <CancelReservationButton reservationId={row.id} />
                      </div>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
