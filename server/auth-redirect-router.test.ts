import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import * as supabaseAuth from "./supabase-auth";
import { SURA_PRODUCTION_JOIN_URL } from "./auth-redirect";

function caller() {
  return appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: {} as any });
}

describe("SURA Supabase redirect router boundary", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("replaces a preview-port sign-up callback with the canonical deployed join URL", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(undefined);
    const register = vi.spyOn(supabaseAuth, "registerSupabaseEmailAccount").mockResolvedValue(null);
    await expect(caller().auth.emailSignUp({ email: "new@example.com", password: "another-safe-password", redirectTo: "https://3000-preview.manus.computer/join" })).resolves.toEqual({ status: "verification_required" });
    expect(register).toHaveBeenCalledWith("new@example.com", "another-safe-password", SURA_PRODUCTION_JOIN_URL);
  });

  it("allows a legacy SURA member to begin verified email access before explicitly linking their established profile", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue({ id: 7, email: "member@example.com" } as any);
    const register = vi.spyOn(supabaseAuth, "registerSupabaseEmailAccount").mockResolvedValue(null);
    await expect(caller().auth.emailSignUp({ email: "Member@Example.com", password: "another-safe-password", redirectTo: SURA_PRODUCTION_JOIN_URL })).resolves.toEqual({ status: "verification_and_link_required" });
    expect(register).toHaveBeenCalledWith("member@example.com", "another-safe-password", SURA_PRODUCTION_JOIN_URL);
  });

  it("replaces an arbitrary recovery callback with the canonical deployed join URL", async () => {
    const recovery = vi.spyOn(supabaseAuth, "requestSupabasePasswordRecovery").mockResolvedValue();
    await expect(caller().auth.emailPasswordRecovery({ email: "member@example.com", redirectTo: "https://example.invalid/callback" })).resolves.toEqual({ status: "recovery_sent" });
    expect(recovery).toHaveBeenCalledWith("member@example.com", SURA_PRODUCTION_JOIN_URL);
  });
});
