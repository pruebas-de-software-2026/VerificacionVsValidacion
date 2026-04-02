"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format, formatISO, endOfDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { ReservationsListQuery } from "@/lib/list-query";
import type { ReservationListItem } from "@/lib/types/reservation";
import { CancelReservationButton } from "./cancel-reservation-button";
import { CompleteReservationButton } from "./complete-reservation-button";
import { DataTablePagination } from "@/components/list/data-table-pagination";
import { EmptyListState } from "@/components/list/empty-list-state";
import { ListFilterCollapsible } from "@/components/list/list-filter-collapsible";
import { UrlSearchField } from "@/components/list/url-search-field";
import { buildListHref } from "@/components/list/build-list-href";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const reservationStatusLabel: Record<string, string> = {
  PROGRAMADA: "Programada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

function formatRange(startAt: string, endAt: string) {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  return {
    date: format(start, "d MMM yyyy", { locale: es }),
    span: `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`,
  };
}

function StatusBadge({ status }: { status: string }) {
  const label = reservationStatusLabel[status] ?? status;
  if (status === "PROGRAMADA") {
    return (
      <Badge variant="secondary" className="font-normal">
        {label}
      </Badge>
    );
  }
  if (status === "COMPLETADA") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/10 font-normal text-emerald-800 dark:text-emerald-200"
      >
        {label}
      </Badge>
    );
  }
  if (status === "CANCELADA") {
    return (
      <Badge variant="destructive" className="font-normal">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="font-normal">
      {label}
    </Badge>
  );
}

type Props = {
  items: ReservationListItem[];
  total: number;
  query: ReservationsListQuery;
  pathname: string;
  isAdmin: boolean;
};

export function ReservationsListView({ items, total, query, pathname, isAdmin }: Props) {
  const router = useRouter();
  const [rangeOpen, setRangeOpen] = useState(false);

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize) || 1);

  const mergeBase = useMemo(
    () => ({
      pageSize: query.pageSize,
      ...(query.q ? { q: query.q } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from ? { from: query.from } : {}),
      ...(query.to ? { to: query.to } : {}),
      ...(query.technicianId ? { technicianId: query.technicianId } : {}),
    }),
    [query],
  );

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (!query.from) {
      return undefined;
    }
    const from = parseISO(query.from);
    const to = query.to ? parseISO(query.to) : from;
    return { from, to };
  }, [query.from, query.to]);

  const rangeLabel =
    selectedRange?.from && selectedRange?.to
      ? `${format(selectedRange.from, "d MMM", { locale: es })} – ${format(selectedRange.to, "d MMM yyyy", { locale: es })}`
      : "Rango de fechas";

  const onStatusChange = (v: string) => {
    router.replace(
      buildListHref(pathname, {
        ...mergeBase,
        status: v === "default" ? undefined : v,
        page: 1,
      }),
      { scroll: false },
    );
  };

  const onRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      router.replace(
        buildListHref(pathname, {
          ...mergeBase,
          from: undefined,
          to: undefined,
          page: 1,
        }),
        { scroll: false },
      );
      return;
    }
    const end = range.to ?? range.from;
    const fromIso = formatISO(startOfDay(range.from));
    const toIso = formatISO(endOfDay(end));
    router.replace(
      buildListHref(pathname, {
        ...mergeBase,
        from: fromIso,
        to: toIso,
        page: 1,
      }),
      { scroll: false },
    );
    if (range.from && range.to) {
      setRangeOpen(false);
    }
  };

  const columns = useMemo<ColumnDef<ReservationListItem>[]>(() => {
    const base: ColumnDef<ReservationListItem>[] = [
      {
        id: "date",
        header: "Fecha",
        cell: ({ row }) => {
          const { date } = formatRange(row.original.startAt, row.original.endAt);
          return <span className="font-medium capitalize">{date}</span>;
        },
      },
      {
        id: "time",
        header: "Horario (local)",
        cell: ({ row }) => formatRange(row.original.startAt, row.original.endAt).span,
      },
      {
        accessorFn: (r) => r.technician.name,
        id: "technician",
        header: "Técnico",
      },
      {
        accessorFn: (r) => r.client.name,
        id: "client",
        header: "Cliente",
      },
      {
        id: "description",
        header: "Descripción",
        cell: ({ row }) => (
          <span
            className="text-muted-foreground max-w-[12rem] truncate text-sm"
            title={row.original.description}
          >
            {row.original.description}
          </span>
        ),
      },
      {
        id: "status",
        header: "Estado",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ];
    if (isAdmin) {
      base.push({
        id: "actions",
        header: () => <span className="block w-full text-right">Acciones</span>,
        cell: ({ row }) => {
          const rowData = row.original;
          if (rowData.status === "CANCELADA" || rowData.status === "COMPLETADA") {
            return <span className="text-muted-foreground text-xs">—</span>;
          }
          return (
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
              <CompleteReservationButton reservationId={rowData.id} />
              <CancelReservationButton reservationId={rowData.id} />
            </div>
          );
        },
      });
    }
    return base;
  }, [isAdmin]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex: query.page - 1, pageSize: query.pageSize } },
  });

  const statusValue = query.status ?? "default";

  const hasFilters = Boolean(
    query.q?.trim() ||
      query.status ||
      query.from ||
      query.to ||
      query.technicianId,
  );

  return (
    <div className="space-y-4">
      <ListFilterCollapsible title="Búsqueda y filtros">
        <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
          <UrlSearchField
            pathname={pathname}
            defaultValue={query.q ?? ""}
            mergeBase={mergeBase}
            placeholder="Buscar por cliente o técnico…"
          />
          <div className="flex min-w-[12rem] flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Estado</Label>
            <Select value={statusValue} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-full min-w-[12rem]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Activas (sin canceladas)</SelectItem>
                <SelectItem value="PROGRAMADA">Programada</SelectItem>
                <SelectItem value="COMPLETADA">Completada</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Rango (inicio de cita)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 min-w-[14rem] justify-start gap-2 font-normal",
                      !selectedRange && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4 shrink-0" />
                    {rangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    locale={es}
                    numberOfMonths={1}
                    selected={selectedRange}
                    onSelect={onRangeSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(query.from || query.to) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    router.replace(
                      buildListHref(pathname, {
                        ...mergeBase,
                        from: undefined,
                        to: undefined,
                        page: 1,
                      }),
                      { scroll: false },
                    );
                  }}
                >
                  Quitar fechas
                </Button>
              )}
            </div>
          </div>
        </div>
      </ListFilterCollapsible>

      {items.length === 0 ? (
        <EmptyListState
          title={hasFilters ? "No hay reservas con estos criterios" : "No hay reservas próximas"}
          description={
            hasFilters
              ? "Prueba otro rango, estado o búsqueda, o limpia los filtros."
              : "Crea una con el formulario inferior o amplía el rango de fechas."
          }
          clearHref={
            hasFilters
              ? buildListHref(pathname, { page: 1, pageSize: query.pageSize })
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === "actions" ? "text-right" : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "actions" ? "text-right" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTablePagination
            pathname={pathname}
            total={total}
            page={query.page}
            pageSize={query.pageSize}
            query={{
              ...(query.q ? { q: query.q } : {}),
              ...(query.status ? { status: query.status } : {}),
              ...(query.from ? { from: query.from } : {}),
              ...(query.to ? { to: query.to } : {}),
              ...(query.technicianId ? { technicianId: query.technicianId } : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}
