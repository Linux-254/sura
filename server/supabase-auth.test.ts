import { afterEach, describe, expect, it, vi } from "vitest";
import { registerSupabaseEmailAccount, requestSupabasePasswordRecovery, signInWithSupabaseEmail, verifySupabaseAccessToken } from "./supabase-auth";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("Supabase email-auth server contracts", () => {
  it("submits sign-up credentials only to Supabase Auth with an optional verification redirect", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { id: "11111111-1111-4111-8111-111111111111", email: "member@example.com" } }), { status: 200 }));
    global.fetch = fetchMock;
    await expect(registerSupabaseEmailAccount("member@example.com", "a-safe-password", "https://sura.example/join")).resolves.toMatchObject({ email: "member@example.com" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/v1\/signup$/), expect.objectContaining({ method: "POST", body: expect.stringContaining("emailRedirectTo") }));
  });

  it("verifies the returned Supabase session user before SURA can issue its own cookie", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "short-lived-access-token", user: { id: "11111111-1111-4111-8111-111111111111" } }), { status: 200 }));
    global.fetch = fetchMock;
    const session = await signInWithSupabaseEmail("member@example.com", "a-safe-password");
    const user = await verifySupabaseAccessToken(session.access_token, async () => ({ id: "11111111-1111-4111-8111-111111111111", email: "member@example.com", email_confirmed_at: "2026-08-23T00:00:00Z" }));
    expect(user.email_confirmed_at).toBeTruthy();
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(/token\?grant_type=password$/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a forged token before SURA can issue a private session", async () => {
    await expect(verifySupabaseAccessToken("forged.token.value")).rejects.toThrow();
  });

  it("surfaces a bounded server error when Supabase rejects an email request", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ msg: "Invalid login credentials" }), { status: 400 }));
    await expect(signInWithSupabaseEmail("member@example.com", "wrong-password")).rejects.toThrow("Invalid login credentials");
  });

  it("keeps a non-JSON provider outage bounded instead of surfacing a parsing error", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response("<!doctype html><title>Temporary gateway page</title>", { status: 503, headers: { "Content-Type": "text/html" } }));

    await expect(signInWithSupabaseEmail("member@example.com", "safe-password")).rejects.toThrow("Secure email service is temporarily unavailable. Please wait before trying again.");
  });

  it("requests password recovery through Supabase without exposing a session token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    global.fetch = fetchMock;
    await requestSupabasePasswordRecovery("member@example.com", "https://sura.example/join");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/v1\/recover$/), expect.objectContaining({ method: "POST" }));
  });
});
