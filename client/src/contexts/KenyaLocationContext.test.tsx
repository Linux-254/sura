/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KenyaLocationProvider, useKenyaLocation } from "./KenyaLocationContext";

function LocationProbe() {
  const { city, message, requestLocation, setCity, status } = useKenyaLocation();
  return <div>
    <output data-testid="city">{city ?? "none"}</output>
    <output data-testid="status">{status}</output>
    <output data-testid="message">{message ?? "none"}</output>
    <button onClick={() => setCity("Kisumu")}>Choose Kisumu</button>
    <button onClick={requestLocation}>Use location</button>
  </div>;
}

function renderProbe() {
  return render(<KenyaLocationProvider><LocationProbe /></KenyaLocationProvider>);
}

const originalGeolocation = navigator.geolocation;

function mockGeolocation(getCurrentPosition: (success: PositionCallback, error: PositionErrorCallback) => void) {
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: originalGeolocation });
  vi.restoreAllMocks();
});

describe("KenyaLocationProvider", () => {
  it("persists a manually selected Kenyan city", () => {
    renderProbe();
    fireEvent.click(screen.getByText("Choose Kisumu"));
    expect(screen.getByTestId("city").textContent).toContain("Kisumu");
    expect(screen.getByTestId("status").textContent).toContain("manual");
    expect(window.localStorage.getItem("vibebuild-kenya-city")).toBe("Kisumu");
  });

  it("provides a manual-city fallback when browser location is unavailable", () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });
    renderProbe();
    fireEvent.click(screen.getByText("Use location"));
    expect(screen.getByTestId("status").textContent).toContain("unsupported");
    expect(screen.getByTestId("message").textContent).toContain("Choose your city instead");
  });

  it("handles denied permission and outside-Kenya coordinates without storing a location", () => {
    mockGeolocation((_success, error) => error({ code: 1 } as GeolocationPositionError));
    const { unmount } = renderProbe();
    fireEvent.click(screen.getByText("Use location"));
    expect(screen.getByTestId("status").textContent).toContain("denied");
    expect(screen.getByTestId("message").textContent).toContain("optional");
    unmount();

    mockGeolocation((success) => success({ coords: { latitude: -6.7924, longitude: 39.2083 } } as GeolocationPosition));
    renderProbe();
    fireEvent.click(screen.getByText("Use location"));
    expect(screen.getByTestId("status").textContent).toContain("outside_kenya");
    expect(screen.getByTestId("city").textContent).toContain("none");
  });
});
