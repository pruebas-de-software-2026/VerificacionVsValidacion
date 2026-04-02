import { describe, expect, it } from "vitest";
import { createTechnicianBodySchema } from "./technician-schema";

describe("createTechnicianBodySchema", () => {
  it("defaults isActive when omitted", () => {
    const out = createTechnicianBodySchema.parse({ name: "Tech", specialty: "Línea blanca" });
    expect(out.isActive).toBeUndefined();
    expect(out.name).toBe("Tech");
  });

  it("rejects empty name", () => {
    expect(() => createTechnicianBodySchema.parse({ name: "" })).toThrow();
  });
});
