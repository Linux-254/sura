// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CompanyDetailPage from "./CompanyDetailPage";

const updateDeliverySettings = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const refetch = vi.hoisted(() => vi.fn());
const configuredDelivery = vi.hoisted(() => ({ sameCityDeliveryKes: 300, nationalDeliveryKes: 1200, providerLabel: "Studio delivery" }));

vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>, useLocation: () => ["/company/5", vi.fn()], useRoute: () => [true, { id: "5" }] }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraErrorState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraPageSkeleton: () => <p>Loading</p>,
}));
vi.mock("@/lib/dashboardAccess", () => ({ resolveDashboardDestination: () => "/company" }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    companies: {
      membership: { useQuery: () => ({ data: { memberRole: "owner" }, isLoading: false, isError: false }) },
      contacts: { useQuery: () => ({ data: [], isLoading: false, isError: false, refetch }) },
      offers: { useQuery: () => ({ data: [], isLoading: false, isError: false, refetch }) },
      deliverySettings: { useQuery: () => ({ data: configuredDelivery, isLoading: false, isError: false, refetch }) },
      orders: { useQuery: () => ({ data: [{ id: 9, productId: 2, product: { name: "Table lamp" }, status: "processing", commissionRatePct: 30, merchandiseSubtotalKes: 5000, deliveryKes: 300, commissionKes: 1500, sellerSettlementKes: 3500 }], isLoading: false, isError: false, refetch }) },
      replaceContacts: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      createOffer: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      updateDeliverySettings: { useMutation: () => updateDeliverySettings },
    },
  },
}));

afterEach(() => { cleanup(); updateDeliverySettings.mutate.mockReset(); });

describe("SURA company delivery and settlement controls", () => {
  it("lets an owner save bounded delivery estimate inputs and view settlement without customer identity", () => {
    render(<CompanyDetailPage />);
    expect(screen.getByText(/Delivery estimate settings/i)).toBeTruthy();
    expect(screen.getAllByText(/Seller settlement/i).length).toBeGreaterThan(0);
    expect(screen.getByText("KES 3,500")).toBeTruthy();
    expect(screen.queryByText(/customer name/i)).toBeNull();
    fireEvent.change(screen.getByDisplayValue("Studio delivery"), { target: { value: "Trusted courier estimate" } });
    fireEvent.click(screen.getByRole("button", { name: /save delivery estimates/i }));
    expect(updateDeliverySettings.mutate).toHaveBeenCalledWith({ companyId: 5, sameCityDeliveryKes: 300, nationalDeliveryKes: 1200, providerLabel: "Trusted courier estimate" });
  });
});
