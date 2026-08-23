import React, { useState, type ReactNode } from "react";
import { ArrowUpRight, Compass, Instagram, MapPin, Menu, Sparkles, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { AestheticPicker } from "./AestheticPicker";
import { NotificationCenter } from "./NotificationCenter";
import { LocationPicker } from "./LocationPicker";
import { SuraMonogram } from "./SuraMonogram";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };

const publicLinks = [
  { href: "/brief", label: "Shape a plan" },
  { href: "/ai-studio", label: "AI studio" },
  { href: "/discover", label: "Discover companies" },
  { href: "/board", label: "My board" },
];

function NavLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href || (href === "/discover" && location.startsWith("/vendors"));

  return (
    <Link
      onClick={onClick}
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`vb-focus relative rounded-full px-3 py-2 text-xs font-bold transition ${
        isActive ? "bg-[#29211b] text-[#fffaf1] shadow-sm" : "text-[#75695b] hover:bg-[#f1e7d9] hover:text-[#1f1b17]"
      }`}
    >
      {children}
    </Link>
  );
}

export function VibeLayout({ children, dark = false }: VibeLayoutProps) {
  const { county } = useKenyaLocation();
  const { isAuthenticated } = useAuth();
  const { palette } = useAestheticTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountHref = isAuthenticated ? "/account" : "/join";
  const accountLabel = isAuthenticated ? "My account" : "Join SURA";

  return (
    <div
      style={!dark ? { backgroundColor: palette.page, color: palette.ink } : undefined}
      className={`min-h-screen ${dark ? "vb-ink text-[#f6f1e9]" : "vb-paper"}`}
    >
      <header
        style={!dark ? { backgroundColor: `${palette.page}f2`, borderColor: palette.border } : undefined}
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${dark ? "border-white/15 bg-[#1d1b18]/92" : "vb-rule"}`}
      >
        <div className="container flex min-h-[5.15rem] items-center justify-between gap-3 py-3">
          <Link
            href="/"
            style={!dark ? { color: palette.ink } : undefined}
            className={`vb-focus group inline-flex shrink-0 items-center gap-2.5 ${dark ? "text-[#f6f1e9]" : ""}`}
            aria-label="SURA home"
          >
            <span className="relative">
              <SuraMonogram className="h-9 w-9 drop-shadow-[0_6px_16px_rgba(42,28,15,0.16)]" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--sura-paper)] bg-[#bd7b3c]" />
            </span>
            <span className="hidden flex-col leading-none min-[390px]:flex">
              <span className="text-[0.85rem] font-extrabold tracking-[0.17em]">SURA</span>
              <span style={!dark ? { color: palette.accent } : undefined} className="mt-1 text-[0.48rem] font-bold tracking-[0.17em]">
                LOCAL EDITS
              </span>
            </span>
          </Link>

          <nav className="hidden items-center rounded-full border border-[#ded1bf] bg-[#fbf8f2]/90 p-1 shadow-[0_7px_20px_rgba(69,47,26,0.06)] xl:flex" aria-label="Primary navigation">
            {publicLinks.map((item) => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}
            <NavLink href={accountHref}>{accountLabel}</NavLink>
          </nav>

          <div className="flex items-center justify-end gap-1.5">
            <div className="hidden xl:block"><LocationPicker /></div>
            <div className="hidden 2xl:block"><AestheticPicker compact /></div>
            <div className="hidden sm:flex items-center rounded-full border border-[#ded1bf] bg-[#fbf8f2]/90 p-1 shadow-[0_7px_20px_rgba(69,47,26,0.06)]"><NotificationCenter /></div>
            <div className="xl:hidden"><LocationPicker compact /></div>
            <Link
              href="/brief"
              style={{ backgroundColor: palette.primary, color: palette.paper }}
              className="vb-button vb-focus inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-bold shadow-[0_8px_18px_rgba(43,30,18,0.16)] sm:px-4"
            >
              <Compass className="h-3.5 w-3.5 text-[#e5b77a]" />
              <span className="hidden min-[540px]:inline">Build an edit</span>
              <span className="min-[540px]:hidden">Start</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              style={{ backgroundColor: palette.paper, borderColor: palette.border, color: palette.ink }}
              className="vb-focus grid h-10 w-10 place-items-center rounded-full border shadow-sm xl:hidden"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ backgroundColor: palette.page, borderColor: palette.border }} className="border-t px-4 py-4 shadow-[0_18px_34px_rgba(59,41,22,0.10)] xl:hidden">
            <nav className="container" aria-label="Mobile navigation">
              <div className="rounded-[1.4rem] border border-[#ded1bf] bg-[#fbf8f2] p-3 shadow-[0_8px_20px_rgba(69,47,26,0.05)]">
                <div className="flex items-center justify-between gap-3 border-b border-[#eadfce] pb-3">
                  <div>
                    <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-[#aa6635]">SURA / EXPLORE</p>
                    <p className="mt-1 text-sm font-bold text-[#33271f]">Shape your next local edit.</p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eee0c7] text-[#9b5e2e]"><Sparkles className="h-4 w-4" /></span>
                </div>
                <div className="mt-3 grid gap-1.5">
                  {publicLinks.map((item, index) => (
                    <NavLink key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center justify-between">
                        <span><span className="mr-2 text-[0.6rem] text-[#a78462]">0{index + 1}</span>{item.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                      </span>
                    </NavLink>
                  ))}
                  <NavLink href={accountHref} onClick={() => setMobileOpen(false)}>
                    <span className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2"><UserRound className="h-3.5 w-3.5" />{accountLabel}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </span>
                  </NavLink>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#eadfce] pt-3">
                  <AestheticPicker compact />
                  <div className="flex gap-4 text-[0.68rem] font-bold text-[#806e5b]">
                    <Link href="/terms" onClick={() => setMobileOpen(false)} className="vb-focus">Terms</Link>
                    <Link href="/privacy" onClick={() => setMobileOpen(false)} className="vb-focus">Privacy</Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className={`border-t ${dark ? "border-white/15" : "vb-rule"}`}>
        <div className="container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-md">
            <p className="vb-serif text-2xl leading-none">Local living, composed with care.</p>
            <p className={`mt-3 text-sm leading-6 ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}>SURA helps you shape a considered local plan—bringing personal direction, local discovery, and informed company connections into one protected space.</p>
            <div className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold ${dark ? "text-[#d6c8b8]" : "text-[#735f4c]"}`}>
              <Link href="/terms" className="vb-focus underline underline-offset-4">Terms</Link>
              <Link href="/privacy" className="vb-focus underline underline-offset-4">Privacy</Link>
              <Link href={accountHref} className="vb-focus underline underline-offset-4">Secure email account</Link>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" title="SURA Instagram handle to be confirmed" className="vb-focus inline-flex items-center gap-1 underline underline-offset-4"><Instagram className="h-3.5 w-3.5" />Instagram</a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" title="SURA X handle to be confirmed" className="vb-focus inline-flex items-center gap-1 underline underline-offset-4"><span aria-hidden="true" className="text-[0.9rem] leading-none">𝕏</span>X</a>
            </div>
            <p className={`mt-3 text-[0.68rem] leading-5 ${dark ? "text-[#a89b8c]" : "text-[#8a7967]"}`}>Social profile handles will be linked here once confirmed by SURA.</p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}><MapPin className="h-3.5 w-3.5 text-[#b77835]" /> {county ? `${county} County · Kenya` : "Kenya"}</div>
        </div>
      </footer>
    </div>
  );
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
