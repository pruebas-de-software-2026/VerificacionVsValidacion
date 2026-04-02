import { describe, expect, it } from "vitest";
import { pathParamId } from "./path-param";

describe("pathParamId", () => {
  it("returns undefined when param is undefined", () => {
    expect(pathParamId(undefined)).toBeUndefined();
  });

  it("returns the string when param is a string", () => {
    expect(pathParamId("abc")).toBe("abc");
  });

  it("returns the first value when param is an array", () => {
    expect(pathParamId(["x", "y"])).toBe("x");
  });
});
