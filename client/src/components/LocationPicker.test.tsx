// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocationPicker } from "./LocationPicker";

const setCity = vi.fn();
const requestLocation = vi.fn();

vi.mock("@/contexts/KenyaLocationContext", () => ({
  useKenyaLocation: () => ({ county: null, isLocating: false, message: null, requestLocation, setCity }),
}));

afterEach(() => { cleanup(); setCity.mockReset(); requestLocation.mockReset(); });

describe("SURA county finder", () => {
  it("opens an accessible all-county finder, filters by county seat, and stores the chosen county", () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { name: /find your county/i }));
    expect(screen.getByRole("listbox", { name: /all kenyan counties/i })).toBeTruthy();
    expect(screen.getAllByText(/47 counties/i)).toHaveLength(2);
    fireEvent.change(screen.getByRole("textbox", { name: /search kenyan counties/i }), { target: { value: "Kerugoya" } });
    fireEvent.click(screen.getByRole("option", { name: /Kirinyaga County/i }));
    expect(setCity).toHaveBeenCalledWith("Kirinyaga");
  });

  it("keeps browser geolocation explicit and optional", () => {
    render(<LocationPicker compact />);
    fireEvent.click(screen.getByRole("button", { name: /find your county/i }));
    fireEvent.click(screen.getByRole("button", { name: /use my location/i }));
    expect(requestLocation).toHaveBeenCalledTimes(1);
  });
});
