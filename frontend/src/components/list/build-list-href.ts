/** Construye `pathname?query` omitiendo claves vacías. */
export function buildListHref(
  pathname: string,
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    p.set(key, String(value));
  }
  const qs = p.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
