import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { headers } from "next/headers";
import { getBackendProxyUrl } from "./internal-fetch";

describe("getBackendProxyUrl", () => {
  beforeEach(() => {
    const h = new Headers();
    h.set("host", "localhost:3000");
    h.set("x-forwarded-proto", "http");
    vi.mocked(headers).mockResolvedValue(h);
  });

  it("prefixes path with /backend on same origin", async () => {
    const url = await getBackendProxyUrl("/clients");
    expect(url).toBe("http://localhost:3000/backend/clients");
  });

  it("normalizes missing leading slash", async () => {
    const url = await getBackendProxyUrl("technicians");
    expect(url).toBe("http://localhost:3000/backend/technicians");
  });
});
