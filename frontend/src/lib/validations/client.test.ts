import { describe, expect, it } from "vitest";
import { clientFormSchema } from "./client";

describe("clientFormSchema", () => {
  it("requires name", () => {
    const r = clientFormSchema.safeParse({ name: "" });
    expect(r.success).toBe(false);
  });

  it("accepts valid payload with phone and address", () => {
    const r = clientFormSchema.safeParse({
      name: "María Pérez",
      phone: "+34 600 000 000",
      address: "Av. Principal 10, Madrid",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("María Pérez");
    }
  });
});
