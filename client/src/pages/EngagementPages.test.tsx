// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "@/components/NotificationCenter";
import { MembershipPage } from "./EngagementPages";

const toast = vi.hoisted(() => vi.fn());
const markRead = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const refetch = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({ toast }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { role: "user" } }) }));
vi.mock("@/contexts/AestheticThemeContext", () => ({
  useAestheticTheme: () => ({ aesthetic: "Soft Power", palette: { primary: "#1d1b18", paper: "#fbf8f2", accent: "#a96834", border: "#ded1bf", ink: "#221e1a" } }),
}));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    membership: { mine: { useQuery: () => ({ data: { planKey: "sura_free" }, isLoading: false }) } },
    notifications: {
      feed: { useQuery: () => ({ data: { notifications: [{ id: 4, title: "Studio update", body: "Your company review is ready.", isRead: false, isDismissed: false, linkUrl: null }], announcements: [{ id: 2, title: "New local offers", body: "Approved offers are ready to explore.", linkUrl: null }] }, refetch }) },
      markRead: { useMutation: () => markRead },
    },
  },
}));

afterEach(() => { cleanup(); toast.mockReset(); markRead.mutate.mockReset(); refetch.mockReset(); });

describe("SURA engagement surfaces", () => {
  it("keeps the SURA Free tier clear of payment collection", () => {
    render(<MembershipPage />);
    expect(screen.getByText("SURA Free")).toBeTruthy();
    expect(screen.getByText(/KES 0 · active by design/i)).toBeTruthy();
    expect(screen.getByText(/never be asked for an M-Pesa PIN/i)).toBeTruthy();
  });

  it("surfaces private notifications and lets a member dismiss only their own feed item", () => {
    render(<NotificationCenter />);
    expect(toast).toHaveBeenCalledWith("Studio update", expect.objectContaining({ description: "Your company review is ready." }));
    expect(toast).toHaveBeenCalledWith("New local offers", expect.objectContaining({ description: "Approved offers are ready to explore." }));
    fireEvent.click(screen.getByRole("button", { name: /open notifications/i }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(markRead.mutate).toHaveBeenCalledWith({ notificationId: 4, dismissed: true });
  });
});
