"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import type { ClientsListQuery } from "@/lib/list-query";
import type { ClientRow } from "@/lib/types/catalog";
import { DataTablePagination } from "@/components/list/data-table-pagination";
import { EmptyListState } from "@/components/list/empty-list-state";
import { ListFilterCollapsible } from "@/components/list/list-filter-collapsible";
import { UrlSearchField } from "@/components/list/url-search-field";
import { buildListHref } from "@/components/list/build-list-href";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  { accessorKey: "phone", header: "Teléfono" },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => (
      <span className="max-w-[14rem] truncate" title={row.original.address}>
        {row.original.address}
      </span>
    ),
  },
];

type Props = {
  clients: ClientRow[];
  total: number;
  query: ClientsListQuery;
  pathname: string;
};

export function ClientsListView({ clients, total, query, pathname }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize) || 1);

  const mergeBase = useMemo(
    () => ({
      pageSize: query.pageSize,
      ...(query.q ? { q: query.q } : {}),
    }),
    [query.pageSize, query.q],
  );

  const table = useReactTable({
    data: clients,
    columns: clientColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex: query.page - 1, pageSize: query.pageSize } },
  });

  const hasFilters = Boolean(query.q?.trim());

  return (
    <div className="space-y-4">
      <ListFilterCollapsible title="Búsqueda">
        <UrlSearchField
          pathname={pathname}
          defaultValue={query.q ?? ""}
          mergeBase={mergeBase}
          placeholder="Buscar por nombre o email…"
        />
      </ListFilterCollapsible>

      {clients.length === 0 ? (
        <EmptyListState
          title={hasFilters ? "No se encontraron clientes" : "No hay clientes todavía"}
          description={
            hasFilters
              ? "Prueba con otros términos o restablece los filtros."
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
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
            }}
          />
        </div>
      )}
    </div>
  );
}
