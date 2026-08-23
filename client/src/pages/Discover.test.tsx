// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Discover from "./Discover";

const vendorsQuery = vi.hoisted(() => ({
  data: [{ id: 1, name: "Nairobi Edit House" }] as Array<{ id: number; name: string }> | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@/components/VibeLayout", () => ({
  VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  labelize: (value: string) => value.replace(/_/g, " "),
}));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title, action }: { title: string; action?: React.ReactNode }) => <section><h2>{title}</h2>{action}</section>,
  SuraErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => <section><h2>{title}</h2>{onRetry && <button onClick={onRetry}>Retry directory</button>}</section>,
  SuraPageSkeleton: () => <div data-testid="directory-skeleton">Loading directory</div>,
}));
vi.mock("@/components/VendorCard", () => ({
  VendorCard: ({ vendor }: { vendor: { name: string } }) => <article>{vendor.name}</article>,
}));
vi.mock("@/contexts/KenyaLocationContext", () => ({
  useKenyaLocation: () => ({ city: "Nairobi", message: null, setCity: vi.fn() }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { vendors: { list: { useQuery: () => vendorsQuery } } },
}));

afterEach(() => {
  cleanup();
  vendorsQuery.data = [{ id: 1, name: "Nairobi Edit House" }];
  vendorsQuery.isLoading = false;
  vendorsQuery.isError = false;
  vendorsQuery.refetch.mockReset();
});

describe("SURA public discovery states", () => {
  it("keeps the search and filters visible while the directory is loading", () => {
    vendorsQuery.isLoading = true;
    render(<Discover />);

    expect(screen.getByText(/finding sources/i)).toBeTruthy();
    expect(screen.getByTestId("directory-skeleton")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "" })).toBeTruthy();
    expect(screen.getByLabelText("City")).toBeTruthy();
  });

  it("keeps filters visible and offers a recovery action when the directory query fails", () => {
    vendorsQuery.isError = true;
    render(<Discover />);

    expect(screen.getByText(/directory needs another moment/i)).toBeTruthy();
    expect(screen.getByLabelText("Category")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /retry directory/i }));
    expect(vendorsQuery.refetch).toHaveBeenCalledTimes(1);
  });

  it("offers filter recovery rather than inventing profiles when no company matches", () => {
    vendorsQuery.data = [];
    render(<Discover />);

    expect(screen.getByText(/nothing lands here yet/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /reset filters/i })).toBeTruthy();
  });

  it("renders only returned demonstration profiles when the directory is available", () => {
    render(<Discover />);

    expect(screen.getByText("Nairobi Edit House")).toBeTruthy();
    expect(screen.getByText(/demonstration profiles/i)).toBeTruthy();
  });
});
