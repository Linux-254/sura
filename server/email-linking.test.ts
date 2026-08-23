import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import * as supabaseAuth from "./supabase-auth";

const existingUser = { id: 41, openId: "legacy-open-id", name: "Existing Member", email: "member@example.com", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const emailIdentity = { id: "11111111-1111-4111-8111-111111111111", email: "member@example.com", email_confirmed_at: "2026-08-23T00:00:00Z" };

function caller() {
  return appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { cookie: vi.fn() } as any });
}

describe("consented legacy SURA email linking", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("requires explicit consent before it accepts email credentials for linking", async () => {
    await expect(caller().auth.emailLinkExistingAccount({ email: "member@example.com", password: "a-safe-password", consent: false } as any)).rejects.toThrow();
  });

  it("links only a verified email identity to the existing SURA user ID", async () => {
    vi.spyOn(supabaseAuth, "signInWithSupabaseEmail").mockResolvedValue({ access_token: "verified-token", user: emailIdentity });
    vi.spyOn(supabaseAuth, "verifySupabaseAccessToken").mockResolvedValue(emailIdentity);
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(existingUser);
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue(undefined);
    const map = vi.spyOn(supabaseAuth, "recordSupabaseIdentityLink").mockResolvedValue();
    vi.spyOn(db, "updateUserAuthIdentity").mockResolvedValue({ ...existingUser, openId: emailIdentity.id, loginMethod: "supabase_email" });

    const result = await caller().auth.emailLinkExistingAccount({ email: "member@example.com", password: "a-safe-password", consent: true });
    expect(result.status).toBe("linked");
    expect(map).toHaveBeenCalledWith(existingUser.id, emailIdentity.id);
    expect(db.updateUserAuthIdentity).toHaveBeenCalledWith(existingUser.id, emailIdentity.id);
  });

  it("rejects an already-linked Supabase identity that belongs to another SURA account", async () => {
    vi.spyOn(supabaseAuth, "signInWithSupabaseEmail").mockResolvedValue({ access_token: "verified-token", user: emailIdentity });
    vi.spyOn(supabaseAuth, "verifySupabaseAccessToken").mockResolvedValue(emailIdentity);
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(existingUser);
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue({ ...existingUser, id: 99, openId: emailIdentity.id });
    await expect(caller().auth.emailLinkExistingAccount({ email: "member@example.com", password: "a-safe-password", consent: true })).rejects.toThrow("already linked");
  });
});
