import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("verifySupabaseAccessToken", () => {
  it("fails closed when Supabase server configuration is missing", async () => {
    const { verifySupabaseAccessToken } = await import("./supabase-auth");

    await expect(
      verifySupabaseAccessToken("a-valid-looking-token-with-more-than-20-chars")
    ).rejects.toThrow("Supabase email authentication is not configured");
  });

  it("verifies through Supabase Auth and returns a normalized identity", async () => {
    vi.stubEnv("SUPABASE_URL", "https://sura.example.supabase.co/");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_only");
    vi.resetModules();

    const { verifySupabaseAccessToken } = await import("./supabase-auth");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "user-123",
          email: "  person@example.com ",
          user_metadata: { full_name: "  Person Example  " },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    await expect(
      verifySupabaseAccessToken(
        "a-valid-looking-token-with-more-than-20-chars",
        fetchMock
      )
    ).resolves.toEqual({
      id: "user-123",
      email: "person@example.com",
      name: "Person Example",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://sura.example.supabase.co/auth/v1/user",
      expect.objectContaining({
        method: "GET",
        headers: {
          apikey: "sb_publishable_test_only",
          Authorization: "Bearer a-valid-looking-token-with-more-than-20-chars",
          Accept: "application/json",
        },
      })
    );
  });

  it("rejects a token when Supabase Auth does not accept it", async () => {
    vi.stubEnv("SUPABASE_URL", "https://sura.example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_only");
    vi.resetModules();

    const { verifySupabaseAccessToken } = await import("./supabase-auth");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("unauthorized", { status: 401 })
    );

    await expect(
      verifySupabaseAccessToken(
        "a-valid-looking-token-with-more-than-20-chars",
        fetchMock
      )
    ).rejects.toThrow("Invalid Supabase access token");
  });
});
