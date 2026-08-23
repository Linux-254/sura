// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPreview from "./AdminDashboardPreview";

vi.mock("wouter", () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));

describe("SURA administrator dashboard preview", () => {
  it("shows governance structure without exposing private records or activating live controls", () => {
    render(<AdminDashboardPreview />);
    expect(screen.getByText(/Privacy-safe preview/i)).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText(/No company records are shown in this preview/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Review queue/i })).toHaveProperty("disabled", true);
    expect(screen.getByRole("link", { name: /Go to secure account access/i }).getAttribute("href")).toBe("/join");
  });
});
