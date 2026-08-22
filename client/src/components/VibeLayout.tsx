import { ArrowUpRight, MapPin } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { LocationPicker } from "./LocationPicker";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href || (href === "/discover" && location.startsWith("/vendors"));
  return <Link href={href} className={`vb-focus text-sm transition-colors ${isActive ? "text-[#1f1b17]" : "text-[#75695b] hover:text-[#1f1b17]"}`}>{children}</Link>;
}

export function VibeLayout({ children, dark = false }: VibeLayoutProps) {
  const { city } = useKenyaLocation();
  return (
    <div className={`min-h-screen ${dark ? "vb-ink text-[#f6f1e9]" : "vb-paper"}`}>
      <header className={`sticky top-0 z-40 border-b ${dark ? "border-white/15 bg-[#1d1b18]/92" : "vb-rule bg-[#f4f0e9]/92"} backdrop-blur-md`}>
        <div className="container flex h-[4.7rem] items-center justify-between gap-4">
          <Link href="/" className={`vb-focus group inline-flex items-center gap-2.5 ${dark ? "text-[#f6f1e9]" : "text-[#1d1b18]"}`} aria-label="SURA home">
            <img src="/manus-storage/sura-packaging-mark_299d54bf.svg" alt="" className="h-8 w-8 rounded-[0.55rem] shadow-sm" />
            <span className="flex flex-col leading-none"><span className="text-[0.83rem] font-extrabold tracking-[0.16em]">SURA</span><span className="mt-1 text-[0.48rem] font-bold tracking-[0.16em] text-[#a66a35]">LOCAL FORM</span></span>
          </Link>
          <nav className="hidden items-center gap-7 sm:flex" aria-label="Primary navigation">
            <NavLink href="/brief">Shape a plan</NavLink>
            <NavLink href="/discover">Find local form</NavLink>
            <NavLink href="/board">My board</NavLink>
          </nav>
          <div className="flex items-center gap-2"><div className="lg:hidden"><LocationPicker compact /></div><LocationPicker /><Link href="/brief" className="vb-button vb-focus inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1d1b18] px-3 py-2 text-xs font-semibold text-[#f6f1e9] shadow-sm hover:bg-[#504638] sm:px-5 sm:text-sm">
            <span className="sm:hidden">Start</span><span className="hidden sm:inline">Start with a budget</span><ArrowUpRight className="h-3.5 w-3.5" />
          </Link></div>
        </div>
      </header>
      {children}
      <footer className={`border-t ${dark ? "border-white/15" : "vb-rule"}`}>
        <div className="container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-md">
            <p className="vb-serif text-2xl leading-none">Make the budget take form.</p>
            <p className={`mt-3 text-sm leading-6 ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}>SURA turns a real budget into a considered local plan. All vendors, prices, and builds currently shown are clearly labelled demonstration data for the MVP.</p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}><MapPin className="h-3.5 w-3.5 text-[#b77835]" /> {city ? `${city} · Kenya` : "Kenya"}</div>
        </div>
      </footer>
    </div>
  );
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
