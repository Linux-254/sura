// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CompanyCatalogPage from "./CompanyCatalogPage";

const state = vi.hoisted(() => ({ mode: "owner-empty" as "loading" | "product-error" | "owner-empty" }));
const refetch = vi.hoisted(() => vi.fn());
const createProduct = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false, isError: false }));

vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>, useRoute: () => [true, { id: "5" }] }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => <section><p>{title}</p>{onRetry && <button onClick={onRetry}>Retry catalog</button>}</section>,
  SuraPageSkeleton: () => <p>Loading catalog</p>,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    companies: {
      membership: { useQuery: () => ({ data: state.mode === "loading" ? undefined : { memberRole: "owner" }, isLoading: state.mode === "loading", isError: false }) },
      products: { useQuery: () => ({ data: state.mode === "owner-empty" ? [] : undefined, isLoading: false, isError: state.mode === "product-error", refetch }) },
      createProduct: { useMutation: () => createProduct },
    },
  },
}));

afterEach(() => { cleanup(); state.mode = "owner-empty"; createProduct.mutate.mockReset(); refetch.mockReset(); });

describe("SURA company catalog states", () => {
  it("keeps a protected owner catalog understandable while membership is loading", () => {
    state.mode = "loading";
    render(<CompanyCatalogPage />);
    expect(screen.getByText("Loading catalog")).toBeTruthy();
  });

  it("offers recovery when a protected owner product query fails", () => {
    state.mode = "product-error";
    render(<CompanyCatalogPage />);
    expect(screen.getByText(/could not open this product catalog/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /retry catalog/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("uses an honest empty state rather than inventing company stock", () => {
    render(<CompanyCatalogPage />);
    expect(screen.getByText(/No products yet/i)).toBeTruthy();
    expect(screen.getByText(/never list stock you cannot fulfil/i)).toBeTruthy();
  });

  it("submits a bounded owner product draft through the protected catalog mutation", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<CompanyCatalogPage />);
    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Woven lamp" } });
    fireEvent.change(screen.getByPlaceholderText("Clear product detail and fulfilment note"), { target: { value: "A locally made woven lamp with a warm, indirect glow." } });
    fireEvent.change(screen.getByPlaceholderText("KES price"), { target: { value: "3500" } });
    fireEvent.change(screen.getByPlaceholderText(/Sizes, comma-separated/i), { target: { value: "One size" } });
    fireEvent.click(screen.getByRole("button", { name: /Add to secure catalog/i }));
    expect(createProduct.mutate).toHaveBeenCalledWith(expect.objectContaining({ companyId: 5, name: "Woven lamp", priceKes: 3500, sizeOptions: ["One size"], stockQuantity: 1 }));
  });
});
