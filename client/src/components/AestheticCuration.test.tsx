// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AestheticThemeProvider } from "@/contexts/AestheticThemeContext";
import { AestheticCuration } from "./AestheticCuration";

const queryState = vi.hoisted(() => ({
  data: { aesthetics: [] as string[], onboardingComplete: false },
  refetch: vi.fn(),
}));
const mutationState = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false, isError: false }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    account: {
      aestheticPreferences: { useQuery: () => ({ ...queryState, isLoading: false, isError: false }) },
      setAestheticPreferences: { useMutation: () => mutationState },
    },
  },
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  queryState.data = { aesthetics: [], onboardingComplete: false };
  mutationState.mutateAsync.mockReset();
});

describe("SURA expression board", () => {
  it("keeps the save action visible and stops selection at five directions", () => {
    render(<AestheticThemeProvider><AestheticCuration alwaysVisible /></AestheticThemeProvider>);
    ["Thrift Remix", "Heritage Modern", "Comfort Official", "Coastal Ease", "Savanna Atelier", "Ink & Ivory"].forEach((name) => fireEvent.click(screen.getByRole("button", { name: new RegExp(name) })));
    expect(screen.getByText("5 of 5 selected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save my aesthetic mix" })).toBeTruthy();
  });

  it("keeps all directions and its one-column mobile-first card grid available at mobile width", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    const { container } = render(<AestheticThemeProvider><AestheticCuration alwaysVisible /></AestheticThemeProvider>);
    expect(screen.getByText("Thermal Bloom")).toBeTruthy();
    expect(screen.getByText("Tangerine Social")).toBeTruthy();
    expect(container.querySelector(".grid.sm\\:grid-cols-2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save my aesthetic mix" })).toBeTruthy();
  });
});
