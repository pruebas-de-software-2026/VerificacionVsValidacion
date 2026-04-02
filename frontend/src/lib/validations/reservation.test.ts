import { describe, expect, it } from "vitest";
import { reservationFormSchema, reservationFormToIsoPayload } from "./reservation";

describe("reservationFormSchema", () => {
  it("accepts a future slot on a valid date", () => {
    const date = "2030-01-15";
    const parsed = reservationFormSchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      date,
      startTime: "14:00",
      endTime: "15:00",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects when end is before start", () => {
    const parsed = reservationFormSchema.safeParse({
      clientId: "c1",
      technicianId: "t1",
      date: "2030-01-15",
      startTime: "15:00",
      endTime: "14:00",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("reservationFormToIsoPayload", () => {
  it("produces ISO strings with Z suffix", () => {
    const { startAt, endAt } = reservationFormToIsoPayload({
      clientId: "c1",
      technicianId: "t1",
      date: "2030-06-01",
      startTime: "10:00",
      endTime: "11:00",
    });
    expect(startAt).toMatch(/Z$/);
    expect(endAt).toMatch(/Z$/);
  });
});
