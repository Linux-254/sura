// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonalEditStudio from "./PersonalEditStudio";

const createCollection = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false, isError: false }));
const createItem = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false, isError: false }));
const invalidate = vi.hoisted(() => vi.fn());

const studioData = vi.hoisted(() => ({
  collections: [{ id: 7, editType: "wardrobe", title: "My wardrobe edit" }],
  items: [
    { id: 11, collectionId: 7, itemType: "wardrobe", title: "Indigo overshirt", note: "A clean layer for evening plans.", tags: JSON.stringify(["indigo", "layering"]), imageUrl: null },
    { id: 12, collectionId: 7, itemType: "wardrobe", title: "Cream tee", note: null, tags: JSON.stringify(["cream", "base"]), imageUrl: null },
  ],
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { role: "user" } }) }));
vi.mock("@/contexts/AestheticThemeContext", () => ({
  AESTHETIC_THEMES: { "Soft Power": {}, "Tangerine Social": {} },
  useAestheticTheme: () => ({ aesthetic: "Soft Power", preferenceMix: ["Soft Power"] }),
}));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/SuraStates", () => ({
  SuraEmptyState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraErrorState: ({ title }: { title: string }) => <p>{title}</p>,
  SuraPageSkeleton: () => <p>Loading studio</p>,
  SuraProcessing: ({ title }: { title: string }) => <p>{title}</p>,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ personalEdits: { collections: { invalidate }, items: { invalidate } } }),
    account: { aestheticPreferences: { useQuery: () => ({ data: { aesthetics: ["Tangerine Social"] } }) } },
    personalEdits: {
      collections: { useQuery: () => ({ data: studioData.collections, isLoading: false, isError: false, refetch: vi.fn() }) },
      items: { useQuery: () => ({ data: studioData.items, isLoading: false, isError: false, refetch: vi.fn() }) },
      createCollection: { useMutation: () => createCollection },
      createItem: { useMutation: () => createItem },
    },
  },
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  createCollection.mutate.mockReset();
  createItem.mutate.mockReset();
  studioData.collections = [{ id: 7, editType: "wardrobe", title: "My wardrobe edit" }];
  studioData.items = [
    { id: 11, collectionId: 7, itemType: "wardrobe", title: "Indigo overshirt", note: "A clean layer for evening plans.", tags: JSON.stringify(["indigo", "layering"]), imageUrl: null },
    { id: 12, collectionId: 7, itemType: "wardrobe", title: "Cream tee", note: null, tags: JSON.stringify(["cream", "base"]), imageUrl: null },
  ];
});

describe("SURA Personal Edit Studio", () => {
  it("uses explicit manual controls for the private edit rail and exposes a live current-reference status", () => {
    render(<PersonalEditStudio />);
    expect(screen.getByText("Indigo overshirt")).toBeTruthy();
    expect(screen.getByText("Reference 1 of 2")).toBeTruthy();
    expect(screen.getByText(/never advances by itself/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /show next private reference/i }));
    expect(screen.getByText("Cream tee")).toBeTruthy();
    expect(screen.getByText("Reference 2 of 2")).toBeTruthy();
  });

  it("saves a private text reference without claiming image analysis and preserves tattoo safety boundaries", () => {
    studioData.items = [];
    render(<PersonalEditStudio />);
    fireEvent.change(screen.getByLabelText(/Reference title/i), { target: { value: "Evening layer note" } });
    fireEvent.change(screen.getByLabelText(/Creative cues/i), { target: { value: "indigo, layering" } });
    fireEvent.click(screen.getByRole("button", { name: /save to my private edit/i }));
    expect(createItem.mutate).toHaveBeenCalledWith(expect.objectContaining({
      collectionId: 7,
      itemType: "wardrobe",
      title: "Evening layer note",
      tags: ["indigo", "layering"],
      analysisConsent: false,
    }));
    fireEvent.click(screen.getByRole("tab", { name: /Tattoo concept/i }));
    expect(screen.getByText(/Tattooing is permanent/i)).toBeTruthy();
  });

  it("keeps category controls and primary actions reachable at a mobile viewport", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    studioData.items = [];
    render(<PersonalEditStudio />);
    expect(screen.getByRole("tab", { name: /Lighting/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /save to my private edit/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: /Room/i }));
    expect(screen.getByText(/Choose one visual anchor/i)).toBeTruthy();
  });

  it("allows a member to choose a second private collection in the same category", () => {
    studioData.collections = [
      { id: 7, editType: "wardrobe", title: "My wardrobe edit" },
      { id: 8, editType: "wardrobe", title: "Weekend layers" },
    ];
    studioData.items = [
      { id: 11, collectionId: 7, itemType: "wardrobe", title: "Indigo overshirt", note: null, tags: "[]", imageUrl: null },
      { id: 21, collectionId: 8, itemType: "wardrobe", title: "Soft cardigan", note: null, tags: "[]", imageUrl: null },
    ];
    render(<PersonalEditStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Weekend layers" }));
    expect(screen.getByText("Soft cardigan")).toBeTruthy();
  });

  it("restores only the non-sensitive active-category preference from browser storage", () => {
    window.localStorage.setItem("sura.personal-edit.active-type", "lighting");
    render(<PersonalEditStudio />);
    expect(screen.getByRole("tab", { name: /Lighting/i }).getAttribute("aria-selected")).toBe("true");
    expect(window.localStorage.getItem("sura.personal-edit.active-type")).toBe("lighting");
    expect(window.localStorage.getItem("sura.personal-edit.items")).toBeNull();
    expect(window.localStorage.getItem("sura.personal-edit.collection-content")).toBeNull();
  });
});
