import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserByOpenId = vi.hoisted(() => vi.fn());
const upsertUser = vi.hoisted(() => vi.fn());

vi.mock("./db", () => ({ getUserByOpenId, upsertUser }));

import { COOKIE_NAME } from "@shared/const";
import { sdk } from "./_core/sdk";

describe("SURA registration-first private access", () => {
  beforeEach(() => {
    getUserByOpenId.mockReset();
    upsertUser.mockReset();
  });

  it("rejects an existing non-email session until the account is linked to verified Supabase email access", async () => {
    getUserByOpenId.mockResolvedValue({ id: 1, openId: "legacy-member", name: "Legacy", email: "legacy@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
    const token = await sdk.createSessionToken("legacy-member", { name: "Legacy" });
    const request = { headers: { cookie: `${COOKIE_NAME}=${token}` }, protocol: "https" } as any;
    await expect(sdk.authenticateRequest(request)).rejects.toThrow("Register or link a verified SURA email account");
  });

  it("permits verified Supabase email session identities and refreshes only their existing SURA record", async () => {
    const user = { id: 2, openId: "22222222-2222-4222-8222-222222222222", name: "Email Member", email: "member@example.com", loginMethod: "supabase_email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    getUserByOpenId.mockResolvedValue(user);
    const token = await sdk.createSessionToken(user.openId, { name: user.name });
    const request = { headers: { cookie: `${COOKIE_NAME}=${token}` }, protocol: "https" } as any;
    await expect(sdk.authenticateRequest(request)).resolves.toMatchObject({ id: 2, loginMethod: "supabase_email" });
    expect(upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: user.openId }));
  });
});
