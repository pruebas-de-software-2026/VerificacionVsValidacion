import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertValidReservationSlot } from "./business-hours";

describe("assertValidReservationSlot", () => {
  const prev = process.env.BUSINESS_TIMEZONE;

  beforeEach(() => {
    process.env.BUSINESS_TIMEZONE = "UTC";
  });

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.BUSINESS_TIMEZONE;
    } else {
      process.env.BUSINESS_TIMEZONE = prev;
    }
  });

  it("accepts Monday 10:00–11:00 UTC", () => {
    const start = new Date("2030-06-17T10:00:00.000Z");
    const end = new Date("2030-06-17T11:00:00.000Z");
    expect(() => assertValidReservationSlot(start, end)).not.toThrow();
  });

  it("rejects Sunday", () => {
    const start = new Date("2030-06-16T10:00:00.000Z");
    const end = new Date("2030-06-16T11:00:00.000Z");
    expect(() => assertValidReservationSlot(start, end)).toThrow();
  });

  it("rejects duration other than 1 hour", () => {
    const start = new Date("2030-06-17T10:00:00.000Z");
    const end = new Date("2030-06-17T12:00:00.000Z");
    expect(() => assertValidReservationSlot(start, end)).toThrow();
  });
});
