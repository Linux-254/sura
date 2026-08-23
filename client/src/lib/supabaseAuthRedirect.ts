export const SURA_PRODUCTION_JOIN_URL = "https://vibekenya-wbvg4xgc.manus.space/join";

/** Keeps preview and deployed callback links on the canonical SURA domain; localhost is explicit development support only. */
export function getSupabaseEmailRedirect(origin = window.location.origin) {
  try {
    const candidate = new URL(origin);
    if (candidate.protocol === "http:" && (candidate.hostname === "localhost" || candidate.hostname === "127.0.0.1") && candidate.port === "3000") return `${candidate.origin}/join`;
  } catch {
    // Use the canonical production callback if a browser origin is unavailable or malformed.
  }
  return SURA_PRODUCTION_JOIN_URL;
}
