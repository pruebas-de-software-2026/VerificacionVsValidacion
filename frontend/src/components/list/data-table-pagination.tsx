"use client";

import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildListHref } from "./build-list-href";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Páginas a mostrar con un único hueco `ellipsis` entre grupos. */
function visiblePages(current: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 9) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const want = new Set<number>([1, pageCount, current, current - 1, current + 1]);
  const sorted = [...want].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && p - prev > 1) {
      out.push("ellipsis");
    }
    out.push(p);
  }
  return out;
}

type Props = {
  pathname: string;
  total: number;
  page: number;
  pageSize: number;
  /** Valores actuales de la query (strings) para conservar al cambiar página. */
  query: Record<string, string | undefined>;
};

export function DataTablePagination({ pathname, total, page, pageSize, query }: Props) {
  const router = useRouter();
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, pageCount);

  const hrefFor = (nextPage: number, nextSize = pageSize) =>
    buildListHref(pathname, {
      ...query,
      page: nextPage,
      pageSize: nextSize,
    });

  const onPageSize = (value: string) => {
    const next = Number.parseInt(value, 10);
    router.replace(hrefFor(1, next), { scroll: false });
  };

  const pages = visiblePages(safePage, pageCount);

  return (
    <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-muted-foreground text-xs sm:text-sm">
        {total === 0 ? (
          "Sin resultados"
        ) : (
          <>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, total)}
            </span>{" "}
            de <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs whitespace-nowrap">Filas</span>
          <Select value={String(pageSize)} onValueChange={onPageSize}>
            <SelectTrigger size="sm" className="h-8 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="flex-wrap gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                href={hrefFor(Math.max(1, safePage - 1))}
                text="Anterior"
                aria-disabled={safePage <= 1}
                className={safePage <= 1 ? "pointer-events-none opacity-40" : undefined}
              />
            </PaginationItem>
            {pages.map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink href={hrefFor(p)} isActive={p === safePage} size="icon">
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={hrefFor(Math.min(pageCount, safePage + 1))}
                text="Siguiente"
                aria-disabled={safePage >= pageCount}
                className={safePage >= pageCount ? "pointer-events-none opacity-40" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
