import { describe, expect, it } from "vitest";
import { parsePaginationQuery } from "./pagination";

describe("parsePaginationQuery", () => {
  it("uses defaults", () => {
    expect(parsePaginationQuery({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("parses page and caps pageSize", () => {
    expect(parsePaginationQuery({ page: "2", pageSize: "500" })).toEqual({ page: 2, pageSize: 100 });
  });

  it("rejects invalid page", () => {
    expect(parsePaginationQuery({ page: "0" })).toEqual({ page: 1, pageSize: 20 });
  });
});
