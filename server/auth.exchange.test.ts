import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => undefined,
    } as TrpcContext["res"],
  };
}

describe("auth.exchangeSupabaseSession", () => {
  it("fails fast with a deployment configuration error before contacting Supabase", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(
      caller.auth.exchangeSupabaseSession({
        accessToken: "a-valid-looking-token-with-more-than-20-chars",
      }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: expect.stringContaining("not configured"),
    });
  });
});
