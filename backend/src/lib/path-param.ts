/** Express 5 puede tipar params como string | string[] */
export function pathParamId(value: string | string[] | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}
