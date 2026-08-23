// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DemoAccessPage from "./DemoAccessPage";

vi.mock("wouter", () => ({ Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraWordmark", () => ({ SuraWordmark: () => <span>SURA</span> }));

describe("SURA demo access", () => {
  it("is explicit about read-only access and keeps private routes behind verified email", () => {
    render(<DemoAccessPage />);
    expect(screen.getByText(/public, read-only product tour/i)).toBeTruthy();
    expect(screen.getByText(/Private routes stay closed/i)).toBeTruthy();
    expect(screen.getByText(/No password, image, payment, or personal data is requested here/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Shape a local build/i }).getAttribute("href")).toBe("/brief");
    expect(screen.getByRole("link", { name: /Go to secure account access/i }).getAttribute("href")).toBe("/join");
  });
});

