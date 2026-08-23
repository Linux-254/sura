import { Check, Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { COOKIE_CONSENT_EVENT, getCookieConsent, setCookieConsent, type CookieConsent } from "@/lib/privacy";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent | undefined>(() => getCookieConsent());
  const [open, setOpen] = useState(() => !getCookieConsent());

  useEffect(() => {
    const syncConsent = () => {
      const next = getCookieConsent();
      setConsent(next);
      setOpen(!next);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent);
  }, []);

  if (!open || consent) return null;

  const choose = (next: CookieConsent) => {
    setCookieConsent(next);
    setConsent(next);
    setOpen(false);
  };

  return <aside role="dialog" aria-label="Cookie preferences" aria-describedby="cookie-preferences-copy" className="fixed inset-x-3 bottom-3 z-[70] rounded-[1.35rem] border border-[#d8cbbb] bg-[#fffaf2] p-4 text-[#2a2119] shadow-[0_18px_55px_rgba(31,24,15,0.2)] dark:border-[#47503c] dark:bg-[#1e221a] dark:text-[#f4efe6] sm:inset-x-auto sm:right-5 sm:w-[26rem] sm:p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--sura-soft)] text-[var(--sura-accent)]"><Cookie className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="vb-kicker text-[var(--sura-accent)]">Your privacy, your choice</p><h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-[#211d18] dark:text-[#f4efe6]">Save your Sura preferences?</h2></div><button onClick={() => choose("declined")} className="vb-focus rounded-lg p-1.5 text-[#806f5f] hover:bg-[var(--sura-soft)] dark:text-[#b6b8ac]" aria-label="Decline optional cookies"><X className="h-4 w-4" /></button></div><p id="cookie-preferences-copy" className="mt-2 text-xs font-medium leading-5 text-[#6d5b49] dark:text-[#c4c8bb]">Sura always uses a required session cookie for sign-in. With your permission, optional cookies remember your light, dark, system, and visual-direction preferences on this device.</p><div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={() => choose("accepted")} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[var(--sura-primary)] px-4 py-2.5 text-xs font-black text-[var(--sura-paper)]"><Check className="h-3.5 w-3.5" />Accept preferences</button><button onClick={() => choose("declined")} className="vb-focus rounded-full border border-[#d8cbbb] px-4 py-2.5 text-xs font-bold text-[#2a2119] dark:border-[#47503c] dark:text-[#f4efe6]">Decline optional</button><Link href="/privacy" className="vb-focus ml-auto text-[0.68rem] font-bold text-[var(--sura-accent)] underline underline-offset-2">Privacy details</Link></div></div></div></aside>;
}
