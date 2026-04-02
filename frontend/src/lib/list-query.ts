/** Valores por defecto alineados con el backend (`parsePaginationQuery`, max pageSize 100). */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type ClientsListQuery = {
  page: number;
  pageSize: number;
  q?: string;
};

export type TechniciansListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  specialty?: string;
  /** Cadena para URL: "true" | "false" o omitido = todos */
  isActive?: string;
};

export type ReservationsListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  /** ISO 8601 con offset */
  from?: string;
  to?: string;
  /** PROGRAMADA | COMPLETADA | CANCELADA | all */
  status?: string;
  technicianId?: string;
};

function parsePositiveInt(v: string | undefined, fallback: number): number {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") {
    return v;
  }
  if (Array.isArray(v) && typeof v[0] === "string") {
    return v[0];
  }
  return undefined;
}

export function parseClientsListQuery(
  sp: Record<string, string | string[] | undefined>,
): ClientsListQuery {
  const q = firstString(sp.q)?.trim() ?? "";
  return {
    page: parsePositiveInt(firstString(sp.page), DEFAULT_PAGE),
    pageSize: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parsePositiveInt(firstString(sp.pageSize), DEFAULT_PAGE_SIZE)),
    ),
    ...(q.length > 0 ? { q } : {}),
  };
}

export function parseTechniciansListQuery(
  sp: Record<string, string | string[] | undefined>,
): TechniciansListQuery {
  const q = firstString(sp.q)?.trim() ?? "";
  const specialty = firstString(sp.specialty)?.trim() ?? "";
  const isActive = firstString(sp.isActive);
  return {
    page: parsePositiveInt(firstString(sp.page), DEFAULT_PAGE),
    pageSize: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parsePositiveInt(firstString(sp.pageSize), DEFAULT_PAGE_SIZE)),
    ),
    ...(q.length > 0 ? { q } : {}),
    ...(specialty.length > 0 ? { specialty } : {}),
    ...(isActive === "true" || isActive === "false" ? { isActive } : {}),
  };
}

export function parseReservationsListQuery(
  sp: Record<string, string | string[] | undefined>,
): ReservationsListQuery {
  const q = firstString(sp.q)?.trim() ?? "";
  const from = firstString(sp.from)?.trim();
  const to = firstString(sp.to)?.trim();
  const status = firstString(sp.status)?.trim();
  const technicianId = firstString(sp.technicianId)?.trim();
  return {
    page: parsePositiveInt(firstString(sp.page), DEFAULT_PAGE),
    pageSize: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parsePositiveInt(firstString(sp.pageSize), DEFAULT_PAGE_SIZE)),
    ),
    ...(q.length > 0 ? { q } : {}),
    ...(from && from.length > 0 ? { from } : {}),
    ...(to && to.length > 0 ? { to } : {}),
    ...(status && status.length > 0 ? { status } : {}),
    ...(technicianId && technicianId.length > 0 ? { technicianId } : {}),
  };
}

/** Serializa parámetros para el API (omite vacíos). */
export function toQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    p.set(key, String(value));
  }
  return p.toString();
}
