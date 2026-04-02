/**
 * Intervalos medio-abiertos [start, end): no hay solape entre [10,11) y [11,12).
 */
export function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return endA > startB && endB > startA;
}
