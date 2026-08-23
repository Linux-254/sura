import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isKenyanCounty, KENYAN_COUNTIES, locationFallbackMessage, type KenyanCounty, resolveKenyanLocation } from "@/lib/kenyaLocation";

type LocationStatus = "idle" | "locating" | "matched" | "manual" | "outside_kenya" | "unsupported" | "denied" | "unmatched" | "unavailable";
type KenyaLocationContextValue = { city: KenyanCounty | null; county: KenyanCounty | null; status: LocationStatus; message: string | null; isLocating: boolean; setCity: (city: KenyanCounty | null) => void; requestLocation: () => void; cities: readonly KenyanCounty[]; counties: readonly KenyanCounty[] };
const STORAGE_KEY = "vibebuild-kenya-county";
const LEGACY_STORAGE_KEY = "vibebuild-kenya-city";
const KenyaLocationContext = createContext<KenyaLocationContextValue | null>(null);

export function KenyaLocationProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<KenyanCounty | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (isKenyanCounty(saved)) { setCityState(saved); setStatus("manual"); }
    } catch { /* The experience remains useful if local storage is unavailable. */ }
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const qaState = new URLSearchParams(window.location.search).get("locationQA");
    if (qaState === "manual") { setCityState("Kisumu"); setStatus("manual"); setMessage("Using Kisumu County for local recommendations."); return; }
    if (qaState === "unsupported" || qaState === "denied" || qaState === "outside_kenya" || qaState === "unmatched") { setCityState(null); setStatus(qaState); setMessage(locationFallbackMessage(qaState)); }
  }, []);

  const persistCounty = (county: KenyanCounty | null) => {
    try {
      if (county) { window.localStorage.setItem(STORAGE_KEY, county); window.localStorage.removeItem(LEGACY_STORAGE_KEY); }
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* County selection is kept for this session even if persistence is unavailable. */ }
  };
  const setCity = (nextCity: KenyanCounty | null) => { setCityState(nextCity); setStatus(nextCity ? "manual" : "idle"); setMessage(nextCity ? `Using ${nextCity} County for local recommendations.` : null); persistCounty(nextCity); };
  const requestLocation = () => {
    if (!navigator.geolocation) { setStatus("unsupported"); setMessage(locationFallbackMessage("unsupported")); return; }
    setStatus("locating"); setMessage("Checking your Kenyan county. Your coordinates are not stored.");
    navigator.geolocation.getCurrentPosition((position) => {
      const resolution = resolveKenyanLocation(position.coords.latitude, position.coords.longitude);
      if (!resolution.inKenya) { setStatus("outside_kenya"); setMessage(locationFallbackMessage("outside_kenya")); return; }
      if (!resolution.county) { setStatus("unmatched"); setMessage(locationFallbackMessage("unmatched")); return; }
      setCityState(resolution.county); setStatus("matched"); setMessage(`Near ${resolution.county} County${resolution.distanceKm ? ` · about ${resolution.distanceKm} km away` : ""}. We will use this for your local plan.`); persistCounty(resolution.county);
    }, (error) => { if (error.code === 1) { setStatus("denied"); setMessage(locationFallbackMessage("denied")); } else { setStatus("unavailable"); setMessage(locationFallbackMessage("unavailable")); } }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
  };
  const counties = useMemo(() => KENYAN_COUNTIES.map((candidate) => candidate.name), []);
  const value = useMemo(() => ({ city, county: city, status, message, isLocating: status === "locating", setCity, requestLocation, cities: counties, counties }), [city, status, message, counties]);
  return <KenyaLocationContext.Provider value={value}>{children}</KenyaLocationContext.Provider>;
}

export function useKenyaLocation() { const context = useContext(KenyaLocationContext); if (!context) throw new Error("useKenyaLocation must be used inside KenyaLocationProvider"); return context; }
