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

  it("rejects commission-rate changes for a non-admin account before a company record can change", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.setCompanyCommissionRate({ companyId: 1, commissionRatePct: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("enforces the 20% to 50% commission boundary before mutation", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    await expect(caller.admin.setCompanyCommissionRate({ companyId: 1, commissionRatePct: 19 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.admin.setCompanyCommissionRate({ companyId: 1, commissionRatePct: 51 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps platform announcements, public-contact replacement, and offer moderation behind administrator access", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.createAnnouncement({ title: "A clear update", body: "Members have a concise update to review.", isActive: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.replacePlatformContacts({ contacts: [{ label: "Support", contactType: "email", value: "support@example.com", isPublic: true, sortOrder: 0 }] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.setDiscountReviewStatus({ offerId: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
