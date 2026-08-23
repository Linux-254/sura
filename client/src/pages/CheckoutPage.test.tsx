// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "./CheckoutPage";

const state = vi.hoisted(() => ({ catalogError: false, ordersError: false, orders: [] as Array<unknown> }));
const refetch = vi.hoisted(() => vi.fn());
const createOrder = vi.hoisted(() => ({ mutateAsync: vi.fn().mockResolvedValue({ id: 4 }), isPending: false }));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title, copy }: { title: string; copy: string }) => <section><h2>{title}</h2><p>{copy}</p></section>,
  SuraErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => <section><h2>{title}</h2>{onRetry && <button onClick={onRetry}>Try again</button>}</section>,
  SuraPageSkeleton: () => <p>Loading services</p>,
  SuraProcessing: ({ title }: { title: string }) => <p>{title}</p>,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    payments: {
      catalog: { useQuery: () => ({ data: state.catalogError ? undefined : { company_membership: { amountKes: 2500 } }, isLoading: false, isError: state.catalogError, refetch }) },
      mine: { useQuery: () => ({ data: state.ordersError ? undefined : state.orders, isLoading: false, isError: state.ordersError, refetch }) },
      createOrder: { useMutation: () => createOrder },
    },
  },
}));

afterEach(() => { cleanup(); state.catalogError = false; state.ordersError = false; state.orders = []; createOrder.mutateAsync.mockReset().mockResolvedValue({ id: 4 }); refetch.mockReset(); });

describe("SURA checkout states", () => {
  it("keeps a service action visible alongside the honest empty payment-record state", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/No payment orders yet/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Create payment order/i })).toBeTruthy();
  });

  it("preserves private records context and recovery when service catalog loading fails", () => {
    state.catalogError = true;
    render(<CheckoutPage />);
    expect(screen.getByText(/Services need another moment/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
    expect(screen.getByText(/No payment orders yet/i)).toBeTruthy();
  });

  it("keeps service orders visible when the private payment-record query needs recovery", () => {
    state.ordersError = true;
    render(<CheckoutPage />);
    expect(screen.getByText(/Your payment records need another moment/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Create payment order/i })).toBeTruthy();
  });
});
