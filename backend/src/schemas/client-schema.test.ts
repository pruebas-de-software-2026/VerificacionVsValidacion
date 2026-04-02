import { describe, expect, it } from "vitest";
import { createClientBodySchema } from "./client-schema";

describe("createClientBodySchema", () => {
  it("accepts minimal valid payload", () => {
    const out = createClientBodySchema.parse({
      name: "Acme",
      phone: "+34 600 000 000",
      address: "Calle Mayor 1",
    });
    expect(out.name).toBe("Acme");
    expect(out.email).toBeUndefined();
  });

  it("rejects empty name", () => {
    expect(() => createClientBodySchema.parse({ name: "" })).toThrow();
  });
});
