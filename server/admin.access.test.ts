import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUserContext(role: "user" | "admin"): TrpcContext {
  return {
    user: { id: 99, openId: "role-check", name: "Role Check", email: "role@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("SURA admin controls", () => {
  it("rejects company-review access for a non-admin account before data access", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.companyReviewQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
