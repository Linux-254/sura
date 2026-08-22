import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUserContext(): TrpcContext {
  return {
    user: { id: 989898, openId: "unauthorized-company-user", name: "Member Check", email: "member@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("SURA protected company and payment routes", () => {
  it("denies a signed-in user access to a company they do not belong to", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.companies.membership({ companyId: 1 })).rejects.toThrow("do not have access");
  });

  it("rejects payment creation for a company that is not owned by the current user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.payments.createOrder({ orderType: "company_membership", companyId: 1 })).rejects.toThrow("only create an order");
  });
});
