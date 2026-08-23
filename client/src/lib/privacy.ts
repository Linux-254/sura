export type CookieConsent = "accepted" | "declined";

export const COOKIE_CONSENT_COOKIE = "sura_cookie_consent";
export const THEME_MODE_COOKIE = "sura_theme_mode";
export const AESTHETIC_THEME_COOKIE = "sura_aesthetic_theme";
export const AESTHETIC_MIX_COOKIE = "sura_aesthetic_mix";
export const SIDEBAR_PREFERENCE_COOKIE = "sidebar_state";
export const COOKIE_CONSENT_EVENT = "sura-cookie-consent-changed";
const OPTIONAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const OPTIONAL_COOKIE_NAMES = [THEME_MODE_COOKIE, AESTHETIC_THEME_COOKIE, AESTHETIC_MIX_COOKIE, SIDEBAR_PREFERENCE_COOKIE];

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function parseCookies() {
  if (!isBrowser()) return new Map<string, string>();
  return new Map(document.cookie.split(";").map((part) => part.trim().split("=")).filter(([name]) => Boolean(name)).map(([name, ...value]) => [name, decodeURIComponent(value.join("="))]));
}

export function getCookieConsent(): CookieConsent | undefined {
  const value = parseCookies().get(COOKIE_CONSENT_COOKIE);
  return value === "accepted" || value === "declined" ? value : undefined;
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function removeCookie(name: string) {
  writeCookie(name, "", 0);
}

export function setCookieConsent(consent: CookieConsent) {
  writeCookie(COOKIE_CONSENT_COOKIE, consent, OPTIONAL_COOKIE_MAX_AGE);
  if (consent === "declined") clearOptionalPreferences();
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function canUseOptionalPreferences() {
  return getCookieConsent() === "accepted";
}

export function readPreferenceCookie(name: string) {
  return canUseOptionalPreferences() ? parseCookies().get(name) : undefined;
}

export function writePreferenceCookie(name: string, value: string) {
  if (canUseOptionalPreferences()) writeCookie(name, value, OPTIONAL_COOKIE_MAX_AGE);
}

export function clearOptionalPreferences() {
  OPTIONAL_COOKIE_NAMES.forEach(removeCookie);
  if (!isBrowser()) return;
  try {
    ["theme", "sura-aesthetic-theme", "sura-aesthetic-preferences"].forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in privacy mode; the current session still works.
  }
}
