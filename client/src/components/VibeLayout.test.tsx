// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VibeLayout } from "./VibeLayout";

vi.mock("wouter", () => ({ Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a>, useLocation: () => ["/"] }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/contexts/AestheticThemeContext", () => ({ useAestheticTheme: () => ({ palette: { page: "#fbf8f2", ink: "#282019", accent: "#a56536", primary: "#29211b", paper: "#fffaf1", border: "#ded1bf" } }) }));
vi.mock("@/contexts/KenyaLocationContext", () => ({ useKenyaLocation: () => ({ county: "Nairobi" }) }));
vi.mock("./AestheticPicker", () => ({ AestheticPicker: ({ mobileInline }: { mobileInline?: boolean }) => <button data-mobile-inline={mobileInline ? "true" : "false"}>Theme control</button> }));
vi.mock("./NotificationCenter", () => ({ NotificationCenter: () => <button>Notifications</button> }));
vi.mock("./LocationPicker", () => ({ LocationPicker: () => <button>Find your county</button> }));

afterEach(cleanup);

describe("SURA editorial navigation", () => {
  it("groups primary destinations in a labelled navigation surface and preserves the account entry", () => {
    render(<VibeLayout><main>Page content</main></VibeLayout>);
    const navigation = screen.getByRole("navigation", { name: /primary navigation/i });
    expect(navigation.textContent).toMatch(/Shape a plan/);
    expect(navigation.textContent).toMatch(/Discover companies/);
    expect(screen.getAllByRole("link", { name: /join sura/i })[0]?.getAttribute("href")).toBe("/join");
    expect(screen.getByTestId("sura-monogram").tagName).toBe("svg");
    expect(screen.queryByAltText("SURA")).toBeNull();
  });

  it("opens a clearly labelled mobile exploration panel without hiding the local finder", () => {
    render(<VibeLayout><main>Page content</main></VibeLayout>);
    fireEvent.click(screen.getByRole("button", { name: /open navigation/i }));
    expect(screen.getByText(/SURA \/ EXPLORE/i)).toBeTruthy();
    expect(screen.getByText(/shape your next local edit/i)).toBeTruthy();
    expect(screen.getAllByText("Find your county").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("button", { name: "Theme control" }).length).toBeGreaterThanOrEqual(2);
  });
});
