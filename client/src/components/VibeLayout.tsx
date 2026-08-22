import { ArrowUpRight, MapPin, Menu, UserRound, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { AestheticPicker } from "./AestheticPicker";
import { LocationPicker } from "./LocationPicker";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };
const publicLinks = [
  { href: "/brief", label: "Shape a plan" },
  { href: "/discover", label: "Find local form" },
  { href: "/board", label: "My board" },
];

function NavLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href || (href === "/discover" && location.startsWith("/vendors"));
  return <Link onClick={onClick} href={href} className={`vb-focus text-sm transition-colors ${isActive ? "text-[#1f1b17]" : "text-[#75695b] hover:text-[#1f1b17]"}`}>{children}</Link>;
}

export function VibeLayout({ children, dark = false }: VibeLayoutProps) {
  const { city } = useKenyaLocation();
  const { isAuthenticated } = useAuth();
  const { palette } = useAestheticTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div style={!dark ? { backgroundColor: palette.page, color: palette.ink } : undefined} className={`min-h-screen ${dark ? "vb-ink text-[#f6f1e9]" : "vb-paper"}`}>
    <header style={!dark ? { backgroundColor: `${palette.page}eb`, borderColor: palette.border } : undefined} className={`sticky top-0 z-40 border-b ${dark ? "border-white/15 bg-[#1d1b18]/92" : "vb-rule"} backdrop-blur-md`}>
      <div className="container flex h-[4.7rem] items-center justify-between gap-3">
        <Link href="/" style={!dark ? { color: palette.ink } : undefined} className={`vb-focus group inline-flex shrink-0 items-center gap-2.5 ${dark ? "text-[#f6f1e9]" : ""}`} aria-label="SURA home"><img src="/manus-storage/sura-packaging-mark_299d54bf.svg" alt="" className="h-8 w-8 rounded-[0.55rem] shadow-sm" /><span className="hidden flex-col leading-none min-[380px]:flex"><span className="text-[0.83rem] font-extrabold tracking-[0.16em]">SURA</span><span style={!dark ? { color: palette.accent } : undefined} className="mt-1 text-[0.48rem] font-bold tracking-[0.16em]">LOCAL FORM</span></span></Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">{publicLinks.map((item) => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}<NavLink href={isAuthenticated ? "/account" : "/join"}>{isAuthenticated ? "My account" : "Join SURA"}</NavLink></nav>
        <div className="flex items-center gap-2"><div className="hidden xl:block"><LocationPicker /></div><div className="hidden md:block"><AestheticPicker compact /></div><div className="lg:hidden"><LocationPicker compact /></div><Link href="/brief" style={{ backgroundColor: palette.primary, color: palette.paper }} className="vb-button vb-focus inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold shadow-sm sm:px-4"><span className="sm:hidden">Start</span><span className="hidden sm:inline">Start with a budget</span><ArrowUpRight className="h-3.5 w-3.5" /></Link><button onClick={() => setMobileOpen(!mobileOpen)} style={{ backgroundColor: palette.paper, borderColor: palette.border, color: palette.ink }} className="vb-focus grid h-9 w-9 place-items-center rounded-full border lg:hidden" aria-label="Open navigation">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
      </div>
      {mobileOpen && <div style={{ backgroundColor: palette.page, borderColor: palette.border }} className="border-t p-4 shadow-[0_16px_30px_rgba(59,41,22,0.08)] lg:hidden"><nav className="container grid gap-2" aria-label="Mobile navigation"><div className="mb-1 flex justify-end"><AestheticPicker /></div>{publicLinks.map((item) => <NavLink key={item.href} href={item.href} onClick={() => setMobileOpen(false)}><span style={{ backgroundColor: palette.paper, borderColor: palette.border, color: palette.ink }} className="flex items-center justify-between rounded-xl border px-4 py-3.5 font-semibold">{item.label}<ArrowUpRight style={{ color: palette.accent }} className="h-4 w-4" /></span></NavLink>)}<NavLink href={isAuthenticated ? "/account" : "/join"} onClick={() => setMobileOpen(false)}><span style={{ backgroundColor: palette.primary, color: palette.paper }} className="flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold">{isAuthenticated ? "Open my account" : "Join SURA"}<UserRound style={{ color: palette.accent }} className="h-4 w-4" /></span></NavLink><div className="mt-2 flex gap-4 px-1 text-xs font-semibold text-[#806e5b]"><Link href="/terms" onClick={() => setMobileOpen(false)}>Terms</Link><Link href="/privacy" onClick={() => setMobileOpen(false)}>Privacy</Link></div></nav></div>}
    </header>{children}<footer className={`border-t ${dark ? "border-white/15" : "vb-rule"}`}><div className="container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end"><div className="max-w-md"><p className="vb-serif text-2xl leading-none">Make the budget take form.</p><p className={`mt-3 text-sm leading-6 ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}>SURA turns a real budget into a considered local plan. All vendors, prices, and builds currently shown are clearly labelled demonstration data for the MVP.</p><div className={`mt-4 flex gap-4 text-xs font-bold ${dark ? "text-[#d6c8b8]" : "text-[#735f4c]"}`}><Link href="/terms" className="vb-focus underline underline-offset-4">Terms</Link><Link href="/privacy" className="vb-focus underline underline-offset-4">Privacy</Link><Link href={isAuthenticated ? "/account" : "/join"} className="vb-focus underline underline-offset-4">Secure account</Link></div></div><div className={`flex items-center gap-2 text-xs ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}><MapPin className="h-3.5 w-3.5 text-[#b77835]" /> {city ? `${city} · Kenya` : "Kenya"}</div></div></footer></div>;
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
