export type PaginationQuery = {
  page: number;
  pageSize: number;
};

export function parsePaginationQuery(query: Record<string, unknown>): PaginationQuery {
  const pageRaw = Number.parseInt(String(query.page ?? "1"), 10);
  const pageSizeRaw = Number.parseInt(String(query.pageSize ?? "20"), 10);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? Math.min(100, Math.floor(pageSizeRaw)) : 20;

  return { page, pageSize };
}
