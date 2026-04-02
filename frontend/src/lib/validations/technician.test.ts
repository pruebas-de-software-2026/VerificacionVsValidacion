import { describe, expect, it } from "vitest";
import { technicianFormSchema } from "./technician";

describe("technicianFormSchema", () => {
  it("rejects empty name", () => {
    expect(technicianFormSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts name and specialty", () => {
    const r = technicianFormSchema.safeParse({ name: "Ana", specialty: "Frío" });
    expect(r.success).toBe(true);
  });

  it("rejects empty specialty", () => {
    expect(technicianFormSchema.safeParse({ name: "Ana", specialty: "" }).success).toBe(false);
  });
});
