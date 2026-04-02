import { describe, expect, it } from "vitest";
import { reservationFormSchema, reservationFormToIsoPayload } from "./reservation";

describe("reservationFormSchema", () => {
  it("accepts a future 1h slot with description", () => {
    const date = "2030-01-15";
    const parsed = reservationFormSchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      date,
      startTime: "14:00",
      description: "Lavadora no centrifuga",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires description", () => {
    const parsed = reservationFormSchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      date: "2030-01-15",
      startTime: "14:00",
      description: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects start times outside 9:00–17:00", () => {
    const parsed = reservationFormSchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      date: "2030-01-15",
      startTime: "08:00",
      description: "Test",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("reservationFormToIsoPayload", () => {
  it("produces ISO strings with Z suffix and 1h duration", () => {
    const { startAt, endAt } = reservationFormToIsoPayload({
      clientId: "c1",
      technicianId: "t1",
      date: "2030-06-01",
      startTime: "10:00",
      description: "Test",
    });
    expect(startAt).toMatch(/Z$/);
    expect(endAt).toMatch(/Z$/);
    const a = new Date(startAt).getTime();
    const b = new Date(endAt).getTime();
    expect(b - a).toBe(60 * 60 * 1000);
  });
});
