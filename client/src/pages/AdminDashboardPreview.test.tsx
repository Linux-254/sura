// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPreview from "./AdminDashboardPreview";

vi.mock("wouter", () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));

describe("SURA administrator dashboard preview", () => {
  it("shows governance structure without exposing private records or activating live controls", () => {
    render(<AdminDashboardPreview />);
    expect(screen.getByText(/Privacy-safe preview/i)).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText(/No live metrics connected/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Open live overview/i })).toHaveProperty("disabled", true);
    expect(screen.getByRole("link", { name: /Go to secure account access/i }).getAttribute("href")).toBe("/join");
  });

  it("switches reporting windows and governance tabs without introducing live commercial values", () => {
    render(<AdminDashboardPreview />);
    const customDateButton = screen.getAllByRole("button").find((button) => button.textContent === "Custom date");
    expect(customDateButton).toBeTruthy();
    fireEvent.click(customDateButton!);
    expect(screen.getByLabelText("Custom preview date")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Custom preview date"), { target: { value: "2026-08-23" } });
    expect(screen.getAllByText(/Selected preview period:/i)[0].textContent).toContain("2026-08-23");
    const salesTab = screen.getAllByRole("tab").find((tab) => tab.textContent === "Sales & payouts");
    expect(salesTab).toBeTruthy();
    fireEvent.click(salesTab!);
    expect(screen.getByText(/No protected sales data is connected to this preview/i)).toBeTruthy();
    expect(salesTab!.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
