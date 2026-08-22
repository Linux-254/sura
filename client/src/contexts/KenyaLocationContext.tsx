import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { isKenyanCity, KENYAN_CITIES, locationFallbackMessage, type KenyanCity, resolveKenyanLocation } from "@/lib/kenyaLocation";

type LocationStatus = "idle" | "locating" | "matched" | "manual" | "outside_kenya" | "unsupported" | "denied" | "unmatched" | "unavailable";

type KenyaLocationContextValue = {
  city: KenyanCity | null;
  status: LocationStatus;
  message: string | null;
  isLocating: boolean;
  setCity: (city: KenyanCity | null) => void;
  requestLocation: () => void;
  cities: readonly KenyanCity[];
};

const STORAGE_KEY = "vibebuild-kenya-city";
const KenyaLocationContext = createContext<KenyaLocationContextValue | null>(null);

export function KenyaLocationProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<KenyanCity | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isKenyanCity(saved)) {
        setCityState(saved as KenyanCity);
        setStatus("manual");
      }
    } catch {
      // The experience remains useful if local storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const qaState = new URLSearchParams(window.location.search).get("locationQA");
    if (qaState === "manual") {
      setCityState("Kisumu");
      setStatus("manual");
      setMessage("Using Kisumu for local recommendations.");
      return;
    }
    if (qaState === "unsupported" || qaState === "denied" || qaState === "outside_kenya" || qaState === "unmatched") {
      setCityState(null);
      setStatus(qaState);
      setMessage(locationFallbackMessage(qaState));
    }
  }, []);

  const setCity = (nextCity: KenyanCity | null) => {
    setCityState(nextCity);
    setStatus(nextCity ? "manual" : "idle");
    setMessage(nextCity ? `Using ${nextCity} for local recommendations.` : null);
    try {
      if (nextCity) window.localStorage.setItem(STORAGE_KEY, nextCity);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // City selection is kept for this session even if it cannot be persisted.
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setMessage(locationFallbackMessage("unsupported"));
      return;
    }
    setStatus("locating");
    setMessage("Checking your Kenyan city. Your coordinates are not stored.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const resolution = resolveKenyanLocation(position.coords.latitude, position.coords.longitude);
        if (!resolution.inKenya) {
          setStatus("outside_kenya");
          setMessage(locationFallbackMessage("outside_kenya"));
          return;
        }
        if (!resolution.city) {
          setStatus("unmatched");
          setMessage(locationFallbackMessage("unmatched"));
          return;
        }
        setCityState(resolution.city);
        setStatus("matched");
        setMessage(`Near ${resolution.city}${resolution.distanceKm ? ` · about ${resolution.distanceKm} km away` : ""}. We will use this city for your local plan.`);
        try { window.localStorage.setItem(STORAGE_KEY, resolution.city); } catch { /* Local preference is optional. */ }
      },
      (error) => {
        if (error.code === 1) {
          setStatus("denied");
          setMessage(locationFallbackMessage("denied"));
        } else {
          setStatus("unavailable");
          setMessage(locationFallbackMessage("unavailable"));
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const value = useMemo(() => ({ city, status, message, isLocating: status === "locating", setCity, requestLocation, cities: KENYAN_CITIES.map((candidate) => candidate.name) }), [city, status, message]);
  return <KenyaLocationContext.Provider value={value}>{children}</KenyaLocationContext.Provider>;
}

export function useKenyaLocation() {
  const context = useContext(KenyaLocationContext);
  if (!context) throw new Error("useKenyaLocation must be used inside KenyaLocationProvider");
  return context;
}
