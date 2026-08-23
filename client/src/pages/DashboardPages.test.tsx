// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountPage, AdminPage, CompanyPage } from "./DashboardPages";

const state = vi.hoisted(() => ({ mode: "account-error" as "account-error" | "company-empty" | "admin-error" }));
const profileRefetch = vi.hoisted(() => vi.fn());
const companiesRefetch = vi.hoisted(() => vi.fn());
const queueRefetch = vi.hoisted(() => vi.fn());

vi.mock("wouter", () => ({ Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a>, useLocation: () => ["/account", vi.fn()] }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7, name: "Member", role: "admin" } }) }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraPageSkeleton: () => <p>Loading state</p>,
  SuraErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => <section><p>{title}</p>{onRetry && <button onClick={onRetry}>Try recovery</button>}</section>,
}));
vi.mock("@/lib/dashboardAccess", () => ({ resolveDashboardDestination: () => "/account" }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    account: {
      profile: { useQuery: () => ({ data: undefined, isLoading: false, isError: state.mode === "account-error", refetch: profileRefetch }) },
      updateProfile: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }) },
      acceptLegal: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
    companies: {
      mine: { useQuery: () => ({ data: state.mode === "company-empty" ? [] : undefined, isLoading: false, isError: false, refetch: companiesRefetch }) },
      create: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }) },
    },
    admin: {
      companyReviewQueue: { useQuery: () => ({ data: undefined, isLoading: false, isError: state.mode === "admin-error", refetch: queueRefetch }) },
      setCompanyReviewStatus: { useMutation: () => ({ mutate: vi.fn() }) },
    },
    payments: { catalog: { useQuery: () => ({}) }, mine: { useQuery: () => ({}) }, createOrder: { useMutation: () => ({}) } },
  },
}));

afterEach(() => { cleanup(); state.mode = "account-error"; profileRefetch.mockReset(); companiesRefetch.mockReset(); queueRefetch.mockReset(); });

describe("SURA dashboard editorial state actions", () => {
  it("keeps account recovery actionable when the protected profile query fails", () => {
    render(<AccountPage />);
    expect(screen.getByText(/could not open your account details/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try recovery/i }));
    expect(profileRefetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the company-start action available in an honest empty studio state", () => {
    state.mode = "company-empty";
    render(<CompanyPage />);
    fireEvent.click(screen.getByRole("button", { name: /create company/i }));
    expect(screen.getByText(/company name/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create & submit for review/i })).toBeTruthy();
  });

  it("keeps the admin queue recovery action available when no decision can be made", () => {
    state.mode = "admin-error";
    render(<AdminPage />);
    expect(screen.getByText(/could not load the company queue/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try recovery/i }));
    expect(queueRefetch).toHaveBeenCalledTimes(1);
  });
});
