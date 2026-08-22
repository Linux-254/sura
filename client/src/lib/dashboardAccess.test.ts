import { describe, expect, it } from "vitest";
import { resolveDashboardDestination } from "./dashboardAccess";

describe("SURA dashboard access resolution", () => {
  it("keeps non-admin users out of the administration destination", () => {
    expect(resolveDashboardDestination("/admin", "user")).toBe("/account");
    expect(resolveDashboardDestination("/admin", null)).toBe("/account");
    expect(resolveDashboardDestination("/admin", "admin")).toBe("/admin");
  });

  it("keeps non-members out of specific company-management destinations", () => {
    expect(resolveDashboardDestination("/company/7", "user", false)).toBe("/company");
    expect(resolveDashboardDestination("/company/7", "user", true)).toBe("/company/7");
    expect(resolveDashboardDestination("/company", "user", false)).toBe("/company");
  });
});
