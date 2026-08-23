// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AiStudioPage from "./AiStudioPage";

const mutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false, isError: false, reset: vi.fn(), data: undefined as any }));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { role: "user" } }) }));
vi.mock("@/contexts/KenyaLocationContext", () => ({ useKenyaLocation: () => ({ city: "Nairobi" }) }));
vi.mock("@/contexts/AestheticThemeContext", () => ({
  AESTHETIC_THEMES: { "Soft Power": {}, "Tangerine Social": {}, "Comfort Official": {} },
  useAestheticTheme: () => ({ aesthetic: "Soft Power", preferenceMix: ["Soft Power"], palette: { primary: "#1d1b18", accent: "#a96834" } }),
}));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    account: { aestheticPreferences: { useQuery: () => ({ data: { aesthetics: ["Tangerine Social", "Comfort Official"], onboardingComplete: true } }) } },
    commerce: { aiAssist: { useMutation: () => mutation } },
  },
}));

afterEach(() => { mutation.mutate.mockReset(); mutation.data = undefined; });

describe("SURA AI Studio preference-aware assist", () => {
  it("submits saved account aesthetics as a bounded creative lens only after user consent", () => {
    render(<AiStudioPage />);
    expect(screen.getByText(/Your saved mix gives the AI a creative lens/i)).toBeTruthy();
    expect(screen.getByText("Tangerine Social")).toBeTruthy();
    expect(screen.getByText("Comfort Official")).toBeTruthy();
    fireEvent.change(document.querySelector("textarea")!, { target: { value: "A warm, welcoming living room for hosting friends after work." } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Create my AI concept/i }));
    expect(mutation.mutate).toHaveBeenCalledWith(expect.objectContaining({
      purposeConsent: true,
      aestheticMix: ["Tangerine Social", "Comfort Official"],
    }));
  });

  it("shows transparent connected price, delivery, commission, and seller-settlement lines only for returned verified listings", () => {
    mutation.data = { generatedImageUrl: "https://images.example/concept.jpg", plan: { title: "Quiet room edit", designDirection: "A composed, warm direction.", priorities: ["Light"], recommendedCategories: ["Accent light"], shoppingLens: "Use one focal glow.", safetyNote: "Consult qualified professionals for electrical work." }, connectedProducts: [{ product: { id: 1, name: "Table lamp" }, company: { name: "SURA Studio", city: "Nairobi" }, merchandiseSubtotalKes: 5000, deliveryKes: 450, commissionKes: 1500, commissionRatePct: 30, sellerSettlementKes: 3500, customerTotalKes: 5450 }] };
    render(<AiStudioPage />);
    expect(screen.getByText(/Connected product signals/i)).toBeTruthy();
    expect(screen.getByText("Table lamp")).toBeTruthy();
    expect(screen.getByText("KES 5,000")).toBeTruthy();
    expect(screen.getByText("KES 450")).toBeTruthy();
    expect(screen.getByText(/KES 1,500 · 30%/i)).toBeTruthy();
    expect(screen.getByText("KES 3,500")).toBeTruthy();
  });
});
