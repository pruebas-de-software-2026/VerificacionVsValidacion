import { describe, expect, it } from "vitest";
import { createReservationBodySchema } from "./reservation-schema";

describe("createReservationBodySchema", () => {
  it("accepts ISO datetimes with Z", () => {
    const parsed = createReservationBodySchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      startAt: "2026-12-01T10:00:00.000Z",
      endAt: "2026-12-01T11:00:00.000Z",
      description: "Nevera no enfría",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects endAt before startAt", () => {
    const parsed = createReservationBodySchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      startAt: "2026-12-01T11:00:00.000Z",
      endAt: "2026-12-01T10:00:00.000Z",
      description: "Test",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects datetime without offset", () => {
    const parsed = createReservationBodySchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      startAt: "2026-12-01T10:00:00.000",
      endAt: "2026-12-01T11:00:00.000Z",
      description: "Test",
    });
    expect(parsed.success).toBe(false);
  });
});
