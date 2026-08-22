import { ArrowUpRight, MapPin } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href || (href === "/discover" && location.startsWith("/vendors"));
  return <Link href={href} className={`vb-focus text-sm transition-colors ${isActive ? "text-[#1f1b17]" : "text-[#75695b] hover:text-[#1f1b17]"}`}>{children}</Link>;
}

export function VibeLayout({ children, dark = false }: VibeLayoutProps) {
  return (
    <div className={`min-h-screen ${dark ? "vb-ink text-[#f6f1e9]" : "vb-paper"}`}>
      <header className={`sticky top-0 z-40 border-b ${dark ? "border-white/15 bg-[#1d1b18]/92" : "vb-rule bg-[#f4f0e9]/92"} backdrop-blur-md`}>
        <div className="container flex h-[4.7rem] items-center justify-between gap-4">
          <Link href="/" className={`vb-focus group inline-flex items-center gap-2 ${dark ? "text-[#f6f1e9]" : "text-[#1d1b18]"}`} aria-label="VibeBuild home">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-current text-xs font-bold tracking-[-0.1em]">VB</span>
            <span className="text-[0.95rem] font-bold tracking-[-0.045em]">VibeBuild <span className="font-medium text-[#b56f33]">Kenya</span></span>
          </Link>
          <nav className="hidden items-center gap-7 sm:flex" aria-label="Primary navigation">
            <NavLink href="/brief">Build your edit</NavLink>
            <NavLink href="/discover">Find vendors</NavLink>
            <NavLink href="/board">My board</NavLink>
          </nav>
          <Link href="/brief" className="vb-button vb-focus inline-flex items-center gap-1.5 rounded-full bg-[#1d1b18] px-4 py-2 text-xs font-semibold text-[#f6f1e9] shadow-sm hover:bg-[#504638] sm:px-5 sm:text-sm">
            Start with a budget <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>
      {children}
      <footer className={`border-t ${dark ? "border-white/15" : "vb-rule"}`}>
        <div className="container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-md">
            <p className="vb-serif text-2xl leading-none">Make the budget work beautifully.</p>
            <p className={`mt-3 text-sm leading-6 ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}>VibeBuild is a local build-planning platform. All vendors, prices, and builds currently shown are clearly labelled demonstration data for the MVP.</p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${dark ? "text-[#c9beb1]" : "text-[#746858]"}`}><MapPin className="h-3.5 w-3.5 text-[#b77835]" /> Nairobi · Kenya</div>
        </div>
      </footer>
    </div>
  );
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
