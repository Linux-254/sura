// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getSupabaseEmailRedirect, SURA_PRODUCTION_JOIN_URL } from "./supabaseAuthRedirect";

describe("SURA Supabase email redirect", () => {
  it("uses the canonical deployed join URL for previews and deployed browser origins", () => {
    expect(getSupabaseEmailRedirect("https://3000-preview.manus.computer")).toBe(SURA_PRODUCTION_JOIN_URL);
    expect(getSupabaseEmailRedirect("https://vibekenya-wbvg4xgc.manus.space")).toBe(SURA_PRODUCTION_JOIN_URL);
  });

  it("allows only the explicit local port-3000 join callback during local development", () => {
    expect(getSupabaseEmailRedirect("http://localhost:3000")).toBe("http://localhost:3000/join");
    expect(getSupabaseEmailRedirect("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000/join");
    expect(getSupabaseEmailRedirect("http://localhost:5173")).toBe(SURA_PRODUCTION_JOIN_URL);
  });
});
