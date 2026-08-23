// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShopPage } from "./CommercePages";

const state = vi.hoisted(() => ({ mode: "empty" as "empty" | "error" }));
const refetch = vi.hoisted(() => vi.fn());

vi.mock("wouter", () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, formatKes: (value: number) => `KES ${value}` }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/contexts/KenyaLocationContext", () => ({ useKenyaLocation: () => ({ city: "Nairobi" }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { commerce: { products: { useQuery: () => ({ data: state.mode === "empty" ? [] : undefined, isLoading: false, isError: state.mode === "error", refetch }) } } } }));

afterEach(() => { cleanup(); state.mode = "empty"; refetch.mockReset(); });

describe("SURA connected-shop states", () => {
  it("keeps the AI-direction action available in the honest no-inventory state", () => {
    render(<ShopPage />);
    expect(screen.getByText(/No connected items here yet/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Create an AI direction/i }).getAttribute("href")).toBe("/ai-studio");
  });

  it("provides an explicit recovery action when the connected catalog fails", () => {
    state.mode = "error";
    render(<ShopPage />);
    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
