"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { TechniciansListQuery } from "@/lib/list-query";
import type { TechnicianRow } from "@/lib/types/catalog";
import { setTechnicianActive } from "./actions";
import { DataTablePagination } from "@/components/list/data-table-pagination";
import { EmptyListState } from "@/components/list/empty-list-state";
import { ListFilterCollapsible } from "@/components/list/list-filter-collapsible";
import { UrlSearchField } from "@/components/list/url-search-field";
import { buildListHref } from "@/components/list/build-list-href";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  technicians: TechnicianRow[];
  total: number;
  query: TechniciansListQuery;
  pathname: string;
};

export function TechniciansListView({ technicians, total, query, pathname }: Props) {
  const router = useRouter();
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize) || 1);

  const [specDraft, setSpecDraft] = useState(query.specialty ?? "");

  useEffect(() => {
    setSpecDraft(query.specialty ?? "");
  }, [query.specialty]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = specDraft.trim();
      const cur = (query.specialty ?? "").trim();
      if (trimmed === cur) {
        return;
      }
      router.replace(
        buildListHref(pathname, {
          pageSize: query.pageSize,
          ...(query.q ? { q: query.q } : {}),
          ...(query.isActive ? { isActive: query.isActive } : {}),
          specialty: trimmed || undefined,
          page: 1,
        }),
        { scroll: false },
      );
    }, 400);
    return () => clearTimeout(t);
  }, [specDraft, pathname, query.isActive, query.pageSize, query.q, query.specialty, router]);

  const mergeBase = useMemo(
    () => ({
      pageSize: query.pageSize,
      ...(query.q ? { q: query.q } : {}),
      ...(query.specialty ? { specialty: query.specialty } : {}),
      ...(query.isActive ? { isActive: query.isActive } : {}),
    }),
    [query.pageSize, query.q, query.specialty, query.isActive],
  );

  const onActiveChange = (v: string) => {
    router.replace(
      buildListHref(pathname, {
        ...mergeBase,
        isActive: v === "all" ? undefined : v,
        page: 1,
      }),
      { scroll: false },
    );
  };

  const columns: ColumnDef<TechnicianRow>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: "specialty", header: "Especialidad" },
    {
      id: "active",
      header: () => <span className="block w-full text-right">Activo</span>,
      cell: ({ row }) => (
        <ActiveSwitch technician={row.original} />
      ),
    },
  ];

  const table = useReactTable({
    data: technicians,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex: query.page - 1, pageSize: query.pageSize } },
  });

  const hasFilters = Boolean(
    query.q?.trim() || query.specialty?.trim() || query.isActive,
  );

  return (
    <div className="space-y-4">
      <ListFilterCollapsible title="Búsqueda y filtros">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <UrlSearchField
            pathname={pathname}
            defaultValue={query.q ?? ""}
            mergeBase={mergeBase}
            placeholder="Buscar por nombre del técnico…"
          />
          <div className="flex min-w-[12rem] flex-col gap-1.5">
            <Label htmlFor="tech-specialty" className="text-muted-foreground text-xs">
              Especialidad
            </Label>
            <Input
              id="tech-specialty"
              value={specDraft}
              onChange={(e) => setSpecDraft(e.target.value)}
              placeholder="Contiene…"
              className="h-9"
            />
          </div>
          <div className="flex min-w-[10rem] flex-col gap-1.5">
            <Label htmlFor="tech-active" className="text-muted-foreground text-xs">
              Estado
            </Label>
            <Select
              value={query.isActive ?? "all"}
              onValueChange={onActiveChange}
            >
              <SelectTrigger id="tech-active" className="h-9 w-full min-w-[10rem]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ListFilterCollapsible>

      {technicians.length === 0 ? (
        <EmptyListState
          title={hasFilters ? "No se encontraron técnicos" : "No hay técnicos todavía"}
          description={
            hasFilters
              ? "Ajusta la búsqueda o los filtros."
              : "Crea el primero con el formulario superior."
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
                    <TableHead key={header.id} className={header.id === "active" ? "text-right" : undefined}>
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
                      className={cell.column.id === "active" ? "text-right" : undefined}
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
              ...(query.specialty ? { specialty: query.specialty } : {}),
              ...(query.isActive ? { isActive: query.isActive } : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}

function ActiveSwitch({ technician }: { technician: TechnicianRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={technician.isActive}
      disabled={pending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await setTechnicianActive(technician.id, checked);
        });
      }}
      aria-label={`Técnico activo: ${technician.name}`}
    />
  );
}
