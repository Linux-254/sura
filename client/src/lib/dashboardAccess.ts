export type DashboardRole = "user" | "admin" | null;

export function resolveDashboardDestination(requestedPath: string, role: DashboardRole, hasCompanyMembership?: boolean) {
  if (requestedPath === "/admin" && role !== "admin") return "/account";
  if (requestedPath.startsWith("/company/") && !hasCompanyMembership) return "/company";
  return requestedPath;
}
