// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AiStudioPreview from "./AiStudioPreview";

vi.mock("wouter", () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));

describe("SURA AI Studio preview", () => {
  it("shows the private-assistance structure without using an image, brief, or live request", () => {
    render(<AiStudioPreview />);
    expect(screen.getByText(/Preview-only/i)).toBeTruthy();
    expect(screen.getByText(/No upload/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Upload disabled/i })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: /Create my private direction/i })).toHaveProperty("disabled", true);
    expect(screen.getByRole("link", { name: /Go to secure account access/i }).getAttribute("href")).toBe("/join");
  });

  it("changes the previewed journey while retaining consent and no-request boundaries", () => {
    render(<AiStudioPreview />);
    const footwear = screen.getAllByRole("tab").find((tab) => tab.textContent?.startsWith("Footwear"));
    expect(footwear).toBeTruthy();
    fireEvent.click(footwear!);
    expect(footwear!.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/private footwear plan/i)).toBeTruthy();
    expect(screen.getAllByText(/Preview mode cannot submit or record consent/i).length).toBeGreaterThan(0);
  });
});
