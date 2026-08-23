import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Keep legacy protected-route triggers on SURA's email-auth entry point.
// It remains an event-only navigation helper so render paths cannot redirect.
export const startLogin = () => {
  window.location.assign("/join");
};
