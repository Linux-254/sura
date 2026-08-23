import { afterEach, describe, expect, it } from "vitest";
import { resolveSupabaseEmailRedirect, SURA_PRODUCTION_JOIN_URL } from "./auth-redirect";

const originalNodeEnv = process.env.NODE_ENV;
afterEach(() => { process.env.NODE_ENV = originalNodeEnv; });

describe("SURA trusted Supabase email redirect policy", () => {
  it("falls back to the canonical production join callback for preview, arbitrary, malformed, and omitted origins", () => {
    process.env.NODE_ENV = "production";
    expect(resolveSupabaseEmailRedirect()).toBe(SURA_PRODUCTION_JOIN_URL);
    expect(resolveSupabaseEmailRedirect("https://3000-preview.manus.computer/join")).toBe(SURA_PRODUCTION_JOIN_URL);
    expect(resolveSupabaseEmailRedirect("https://example.invalid/steal")) .toBe(SURA_PRODUCTION_JOIN_URL);
    expect(resolveSupabaseEmailRedirect("not a url")).toBe(SURA_PRODUCTION_JOIN_URL);
    expect(resolveSupabaseEmailRedirect("http://localhost:3000/join")).toBe(SURA_PRODUCTION_JOIN_URL);
  });

  it("permits only an explicit localhost port-3000 join callback outside production", () => {
    process.env.NODE_ENV = "development";
    expect(resolveSupabaseEmailRedirect("http://localhost:3000/join")).toBe("http://localhost:3000/join");
    expect(resolveSupabaseEmailRedirect("http://127.0.0.1:3000/join")).toBe("http://127.0.0.1:3000/join");
    expect(resolveSupabaseEmailRedirect("http://localhost:3000/account")).toBe(SURA_PRODUCTION_JOIN_URL);
    expect(resolveSupabaseEmailRedirect("http://localhost:5173/join")).toBe(SURA_PRODUCTION_JOIN_URL);
  });
});
