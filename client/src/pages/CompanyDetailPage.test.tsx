// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CompanyDetailPage from "./CompanyDetailPage";

const state = vi.hoisted(() => ({ contacts: "empty" as "empty" | "loading" | "error", offers: "empty" as "empty" | "loading" | "error" }));
const updateDeliverySettings = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const contactRefetch = vi.hoisted(() => vi.fn());
const offerRefetch = vi.hoisted(() => vi.fn());
const configuredDelivery = vi.hoisted(() => ({ sameCityDeliveryKes: 300, nationalDeliveryKes: 1200, providerLabel: "Studio delivery" }));

vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>, useLocation: () => ["/company/5", vi.fn()], useRoute: () => [true, { id: "5" }] }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => <section><p>{title}</p>{onRetry && <button onClick={onRetry}>Retry {title}</button>}</section>,
  SuraPageSkeleton: () => <p>Loading company detail</p>,
}));
vi.mock("@/lib/dashboardAccess", () => ({ resolveDashboardDestination: () => "/company" }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    companies: {
      membership: { useQuery: () => ({ data: { memberRole: "owner" }, isLoading: false, isError: false }) },
      contacts: { useQuery: () => ({ data: state.contacts === "empty" ? [] : undefined, isLoading: state.contacts === "loading", isError: state.contacts === "error", refetch: contactRefetch }) },
      offers: { useQuery: () => ({ data: state.offers === "empty" ? [] : undefined, isLoading: state.offers === "loading", isError: state.offers === "error", refetch: offerRefetch }) },
      deliverySettings: { useQuery: () => ({ data: configuredDelivery, isLoading: false, isError: false, refetch: vi.fn() }) },
      orders: { useQuery: () => ({ data: [{ id: 9, productId: 2, product: { name: "Table lamp" }, status: "processing", commissionRatePct: 30, merchandiseSubtotalKes: 5000, deliveryKes: 300, commissionKes: 1500, sellerSettlementKes: 3500 }], isLoading: false, isError: false, refetch: vi.fn() }) },
      replaceContacts: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      createOffer: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      updateDeliverySettings: { useMutation: () => updateDeliverySettings },
    },
  },
}));

afterEach(() => { cleanup(); state.contacts = "empty"; state.offers = "empty"; updateDeliverySettings.mutate.mockReset(); updateDeliverySettings.isPending = false; contactRefetch.mockReset(); offerRefetch.mockReset(); });

describe("SURA company owner detail states", () => {
  it("keeps contact and offer management actions available alongside honest empty states", () => {
    render(<CompanyDetailPage />);
    expect(screen.getByText(/No public contact route yet/i)).toBeTruthy();
    expect(screen.getByText(/No discount offers yet/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Save contact/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Submit offer/i })).toBeTruthy();
  });

  it("shows query progress for contacts and preserves offer recovery when another owner panel fails", () => {
    state.contacts = "loading";
    state.offers = "error";
    render(<CompanyDetailPage />);
    expect(screen.getByText(/Loading company detail/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Retry Offers need another moment/i }));
    expect(offerRefetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Save contact/i })).toBeTruthy();
  });

  it("offers contact-query recovery without hiding the owner contact form", () => {
    state.contacts = "error";
    render(<CompanyDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: /Retry Contacts need another moment/i }));
    expect(contactRefetch).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("hello@yourstudio.co.ke")).toBeTruthy();
  });

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

  it("keeps the delivery action visible and disabled while owner settings are saving", () => {
    updateDeliverySettings.isPending = true;
    render(<CompanyDetailPage />);
    const savingAction = screen.getByRole("button", { name: /saving/i });
    expect(savingAction).toHaveProperty("disabled", true);
  });
});
