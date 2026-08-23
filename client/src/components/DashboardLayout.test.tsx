// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardLayout from "./DashboardLayout";

vi.mock("wouter", () => ({ Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => <a href={href} {...props}>{children}</a>, useLocation: () => ["/account", vi.fn()] }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: null, loading: false, logout: vi.fn() }) }));
vi.mock("@/contexts/AestheticThemeContext", () => ({ useAestheticTheme: () => ({ palette: { page: "#fff", border: "#ddd", paper: "#fafafa", primary: "#222", soft: "#eee", accent: "#a65", ink: "#111" } }) }));
vi.mock("./NotificationCenter", () => ({ NotificationCenter: () => null }));
vi.mock("./AestheticCuration", () => ({ AestheticCuration: () => null }));

afterEach(cleanup);

describe("SURA signed-out dashboard gate", () => {
  it("uses Supabase email-auth language and routes members to the email entry page", () => {
    render(<DashboardLayout title="Private" eyebrow="SURA" description="Private area"><div>Content</div></DashboardLayout>);
    expect(screen.getByText(/Use your email to enter a protected SURA space/i)).toBeTruthy();
    expect(screen.queryByText(/OAuth/i)).toBeNull();
    expect(screen.getByRole("link", { name: /Continue with email/i }).getAttribute("href")).toBe("/join");
  });
});
