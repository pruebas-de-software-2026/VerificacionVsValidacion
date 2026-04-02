import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseBody } from "./parse-body";
import { ValidationError } from "../errors/validation-error";

describe("parseBody", () => {
  it("returns parsed data", () => {
    const schema = z.object({ a: z.number() });
    expect(parseBody(schema, { a: 1 })).toEqual({ a: 1 });
  });

  it("throws ValidationError on failure", () => {
    const schema = z.object({ a: z.number() });
    expect(() => parseBody(schema, {})).toThrow(ValidationError);
  });
});
