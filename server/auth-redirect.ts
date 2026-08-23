export const SURA_PRODUCTION_ORIGIN = "https://vibekenya-wbvg4xgc.manus.space";
export const SURA_PRODUCTION_JOIN_URL = `${SURA_PRODUCTION_ORIGIN}/join`;

function isJoinPath(url: URL) {
  return url.pathname === "/join" && !url.search && !url.hash;
}

function isLocalDevelopmentJoinUrl(url: URL) {
  return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1") && url.port === "3000" && isJoinPath(url);
}

/** Returns only a trusted join callback; caller-provided preview or arbitrary origins fall back to production. */
export function resolveSupabaseEmailRedirect(requestedRedirect?: string) {
  if (!requestedRedirect) return SURA_PRODUCTION_JOIN_URL;
  try {
    const candidate = new URL(requestedRedirect);
    if (candidate.href === SURA_PRODUCTION_JOIN_URL) return SURA_PRODUCTION_JOIN_URL;
    if (process.env.NODE_ENV !== "production" && isLocalDevelopmentJoinUrl(candidate)) return candidate.href;
  } catch {
    // An invalid callback must never prevent the server from using its trusted production fallback.
  }
  return SURA_PRODUCTION_JOIN_URL;
}
