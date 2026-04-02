import { describe, expect, it } from "vitest";
import { clientFormSchema } from "./client";

describe("clientFormSchema", () => {
  it("requires name", () => {
    const r = clientFormSchema.safeParse({ name: "" });
    expect(r.success).toBe(false);
  });

  it("accepts valid name only", () => {
    const r = clientFormSchema.safeParse({ name: "Acme SL" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Acme SL");
    }
  });
});
