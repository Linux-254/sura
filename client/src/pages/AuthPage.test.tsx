// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./AuthPage";
import { getSupabaseEmailRedirect } from "@/lib/supabaseAuthRedirect";

const signUp = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false, error: null as { message: string } | null }));
const signIn = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false, error: null as { message: string } | null }));
const recovery = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false, error: null as { message: string } | null }));
const link = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false, error: null as { message: string } | null }));

vi.mock("wouter", () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/components/VibeLayout", () => ({ VibeLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { auth: { emailSignUp: { useMutation: () => signUp }, emailSignIn: { useMutation: () => signIn }, emailPasswordRecovery: { useMutation: () => recovery }, emailLinkExistingAccount: { useMutation: () => link } } } }));

afterEach(() => {
  cleanup();
  signUp.mutateAsync.mockReset();
  signIn.mutateAsync.mockReset();
  recovery.mutateAsync.mockReset();
  link.mutateAsync.mockReset();
  signUp.error = null;
  signIn.error = null;
  recovery.error = null;
  link.error = null;
});

describe("SURA email authentication page", () => {
  it("submits email credentials through the Supabase sign-in contract without an OAuth trigger", async () => {
    signIn.mutateAsync.mockResolvedValue({ status: "account_link_required" });
    render(<AuthPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a-safe-password" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign in securely/i }));
    await waitFor(() => expect(signIn.mutateAsync).toHaveBeenCalledWith({ email: "member@example.com", password: "a-safe-password" }));
    expect(screen.getByText(/existing SURA account/i)).toBeTruthy();
  });

  it("uses the create-account view to request email verification", async () => {
    signUp.mutateAsync.mockResolvedValue({ status: "verification_required" });
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "another-safe-password" } });
    fireEvent.click(screen.getByRole("button", { name: /Create email account/i }));
    await waitFor(() => expect(signUp.mutateAsync).toHaveBeenCalledWith({ email: "new@example.com", password: "another-safe-password", redirectTo: getSupabaseEmailRedirect() }));
    expect(screen.getByText(/Check your inbox to verify/i)).toBeTruthy();
  });

  it("offers a transparent read-only demo without a demo credential or session", () => {
    render(<AuthPage />);
    const demoLink = screen.getByRole("link", { name: /Explore the read-only demo/i });
    expect(demoLink.getAttribute("href")).toBe("/demo");
    expect(screen.getByText(/No email, password, profile, saved item, payment, or private record is used/i)).toBeTruthy();
  });

  it("offers password recovery without asking for a current password", async () => {
    recovery.mutateAsync.mockResolvedValue({ status: "recovery_sent" });
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Recover" }));
    expect(screen.queryByLabelText("Password")).toBeNull();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Send recovery link/i }));
    await waitFor(() => expect(recovery.mutateAsync).toHaveBeenCalledWith({ email: "member@example.com", redirectTo: getSupabaseEmailRedirect() }));
  });

  it("requires an explicit consent confirmation before it links an existing account", async () => {
    signIn.mutateAsync.mockResolvedValue({ status: "account_link_required" });
    link.mutateAsync.mockResolvedValue({ status: "linked" });
    render(<AuthPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "member@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a-safe-password" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign in securely/i }));
    await waitFor(() => expect(screen.getByText(/I consent to link this verified email/i)).toBeTruthy());
    const linkButton = screen.getByRole("button", { name: /Confirm and link email/i });
    expect(linkButton).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(linkButton);
    await waitFor(() => expect(link.mutateAsync).toHaveBeenCalledWith({ email: "member@example.com", password: "a-safe-password", consent: true }));
  });

  it("turns an email rate limit into next-step guidance rather than exposing provider text", () => {
    recovery.error = { message: "email rate limit exceeded" };
    render(<AuthPage />);
    expect(screen.getByText("Email sending is temporarily paused.")).toBeTruthy();
    expect(screen.queryByText("email rate limit exceeded")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /return to sign in/i }));
    expect(screen.getByRole("tab", { name: "Sign in" }).getAttribute("aria-selected")).toBe("true");
  });

  it("keeps account creation selected when confirmation email delivery is rate-limited", () => {
    signUp.error = { message: "email rate limit exceeded" };
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    expect(screen.getByText("Confirmation email delivery is temporarily paused.")).toBeTruthy();
    expect(screen.getByText(/do not sign in until you have confirmed the email link/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /return to sign in/i })).toBeNull();
    expect(screen.getByRole("tab", { name: "Create account" }).getAttribute("aria-selected")).toBe("true");
  });

  it("keeps recovery selected when recovery email delivery is rate-limited", () => {
    recovery.error = { message: "email rate limit exceeded" };
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Recover" }));
    expect(screen.getByText("Recovery email delivery is temporarily paused.")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Recover" }).getAttribute("aria-selected")).toBe("true");
  });

  it("explains that an email must be confirmed before a SURA sign-in can proceed", () => {
    signIn.error = { message: "Verify your email before signing in to SURA." };
    render(<AuthPage />);
    expect(screen.getByText("Confirm your email before signing in.")).toBeTruthy();
    expect(screen.getByText(/Open the newest SURA verification email/i)).toBeTruthy();
    expect(screen.queryByText("Verify your email before signing in to SURA.")).toBeNull();
  });
});
