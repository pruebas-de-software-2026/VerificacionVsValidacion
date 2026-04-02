import { describe, expect, it } from "vitest";
import { intervalsOverlap } from "./reservation-intervals";

describe("intervalsOverlap", () => {
  const d = (iso: string) => new Date(iso);

  it("returns false for adjacent non-overlapping blocks [10,11) and [11,12)", () => {
    expect(intervalsOverlap(d("2026-04-02T10:00:00.000Z"), d("2026-04-02T11:00:00.000Z"), d("2026-04-02T11:00:00.000Z"), d("2026-04-02T12:00:00.000Z"))).toBe(
      false,
    );
  });

  it("returns true for partial intersection", () => {
    expect(intervalsOverlap(d("2026-04-02T10:00:00.000Z"), d("2026-04-02T11:00:00.000Z"), d("2026-04-02T10:30:00.000Z"), d("2026-04-02T11:30:00.000Z"))).toBe(
      true,
    );
  });

  it("returns true when one interval contains the other", () => {
    expect(intervalsOverlap(d("2026-04-02T09:00:00.000Z"), d("2026-04-02T12:00:00.000Z"), d("2026-04-02T10:00:00.000Z"), d("2026-04-02T11:00:00.000Z"))).toBe(
      true,
    );
  });

  it("returns false for disjoint intervals", () => {
    expect(intervalsOverlap(d("2026-04-02T08:00:00.000Z"), d("2026-04-02T09:00:00.000Z"), d("2026-04-02T10:00:00.000Z"), d("2026-04-02T11:00:00.000Z"))).toBe(
      false,
    );
  });
});
