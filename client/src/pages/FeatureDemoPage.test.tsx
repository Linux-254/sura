// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import FeatureDemoPage from "./FeatureDemoPage";

afterEach(() => cleanup());

describe("Sura public all-features demo", () => {
  it("renders the complete feature tour without requiring authentication", () => {
    render(<FeatureDemoPage />);
    expect(screen.getByRole("heading", { name: /Every feature/i })).toBeTruthy();
    expect(screen.getAllByText(/Live Signal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sura Shelf/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Company Studio/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Commerce \+ handoff/i)).toBeTruthy();
    expect(screen.getByText(/Notifications \+ operations/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Enter real Sura/i }).getAttribute("href")).toBe("/join");
  });

  it("keeps demo curation, search, showroom, and checkout interactions local", () => {
    render(<FeatureDemoPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /Curate$/i })[0]);
    expect(screen.getByText(/Curated to your demo Shelf/i)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Search a signal/i), { target: { value: "Kijani" } });
    expect(screen.getAllByText("Kijani Objects").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Mara Textile Lab/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Angle" }));
    expect(screen.getByAltText(/Angle view of a SURA STUDIO object/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Continue to verification/i }));
    expect(screen.getAllByText(/Payment verification/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/payment is not collected here/i)).toBeTruthy();
  });
});
