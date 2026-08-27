import {
  Bookmark,
  Compass,
  Home,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { AestheticPicker } from "./AestheticPicker";
import { NotificationCenter } from "./NotificationCenter";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };

type AppNavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: typeof Home;
  exact?: boolean;
};

const appNav: AppNavItem[] = [
  { href: "/", label: "Live Signal", mobileLabel: "Live", icon: Home, exact: true },
  { href: "/discover", label: "Explore", mobileLabel: "Explore", icon: Compass },
  { href: "/brief", label: "Make a Signal", mobileLabel: "Make", icon: Plus },
  { href: "/board", label: "Saved Shelf", mobileLabel: "Shelf", icon: Bookmark },
  { href: "/ai-studio", label: "AI Studio", mobileLabel: "Studio", icon: Sparkles },
];

function isNavActive(location: string, item: AppNavItem) {
  return item.exact ? location === item.href : location === item.href || location.startsWith(`${item.href}/`);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`vb-focus flex items-center ${compact ? "justify-center" : "gap-3"}`} aria-label="SURA home">
      <img src="/sura-mark-neon.svg" alt="" className={`${compact ? "h-9 w-9" : "h-10 w-10"} rounded-lg`} />
      {!compact && (
        <span className="leading-none">
          <span className="sura-wordmark block text-[1.2rem] text-[var(--sura-ink)]">SURA</span>
          <span className="mt-1 block text-[0.54rem] font-bold uppercase tracking-[0.14em] text-[var(--sura-accent)]">Visual network</span>
        </span>
      )}
    </Link>
  );
}

function PlatformNav({ dark, location, onNavigate, collapsed = false }: { dark: boolean; location: string; onNavigate?: () => void; collapsed?: boolean }) {
  return (
    <nav className="space-y-1.5" aria-label="Primary navigation">
      {appNav.map(({ href, label, icon: Icon, exact }) => {
        const active = isNavActive(location, { href, label, mobileLabel: label, icon: Icon, exact });
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`vb-focus group flex items-center gap-3 rounded-md py-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${collapsed ? "justify-center px-2" : "px-3.5"} ${
              active
                ? dark
                  ? "bg-[#caff32] text-[#293500]"
                  : "bg-[#1d211b] text-[#f3f1ec]"
                : dark
                  ? "text-[#c5c9af] hover:bg-white/[0.07] hover:text-[#e3e3dc]"
                  : "text-[#6c7062] hover:bg-black/[0.05] hover:text-[#1d211b]"
            }`}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={active ? 2.4 : 1.9} />
            <span className={collapsed ? "sr-only" : ""}>{label}</span>
            {label === "Make a Signal" && !collapsed && <span className="ml-auto rounded-sm bg-[#ffb4ab] px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] text-[#690005]">New</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function VibeLayout({ children, dark: forcedDark = false }: VibeLayoutProps) {
  const [location] = useLocation();
  const { city } = useKenyaLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { palette } = useAestheticTheme();
  const { resolvedTheme } = useTheme();
  const dark = forcedDark || resolvedTheme === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const surface = dark ? "bg-[#1e201c]" : "bg-[#faf9f5]";
  const border = dark ? "border-white/[0.1]" : "border-[#d5d8cc]";
  const muted = dark ? "text-[#c5c9af]" : "text-[#6c7062]";

  return (
    <div
      style={!dark ? { backgroundColor: palette.page, color: palette.ink } : undefined}
      className={`sura-outer-stage min-h-screen ${dark ? "bg-[#121410] text-[#e3e3dc]" : "bg-[#f3f1ec]"}`}
    >
      <aside className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r py-6 lg:flex ${railCollapsed ? "w-[4.75rem] px-3" : "w-[15rem] px-5"} ${dark ? "border-white/[0.1] bg-[#0d0f0b]" : "border-[#d5d8cc] bg-[#ecece6]"}`}>
        <Brand compact={railCollapsed} />
        {!railCollapsed && <div className={`mt-2 pl-[3.15rem] text-[0.56rem] font-bold uppercase tracking-[0.16em] ${dark ? "text-[#caff32]" : "text-[#6d8310]"}`}>Local signal</div>}
        <button onClick={() => setRailCollapsed((collapsed) => !collapsed)} className={`vb-focus mt-7 grid h-9 w-full place-items-center rounded-md border ${dark ? "border-white/[0.12] text-[#c5c9af] hover:bg-white/[0.07]" : "border-[#d5d8cc] text-[#6c7062] hover:bg-black/[0.05]"}`} aria-label={railCollapsed ? "Expand Sura navigation" : "Minimize Sura navigation"} title={railCollapsed ? "Expand navigation" : "Minimize navigation"}>{railCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>

        <div className="mt-7"><PlatformNav dark={dark} location={location} collapsed={railCollapsed} /></div>

        <div className="mt-auto space-y-4">
          <div className={`border ${railCollapsed ? "grid h-12 place-items-center p-2" : "p-4"} ${dark ? "border-white/[0.1] bg-[#1e201c]" : "border-[#d5d8cc] bg-[#faf9f5]"}`} title={railCollapsed ? `${city || "Nairobi"} · Kenya` : undefined}>
            {railCollapsed ? <MapPin className={`h-4 w-4 ${dark ? "text-[#caff32]" : "text-[#6d8310]"}`} aria-label={`${city || "Nairobi"} · Kenya`} /> : <><div className="flex items-center gap-2 text-xs font-semibold"><MapPin className={`h-3.5 w-3.5 ${dark ? "text-[#caff32]" : "text-[#6d8310]"}`} /><span className={muted}>{city || "Nairobi"} · Kenya</span></div><p className={`mt-3 text-xs leading-5 ${muted}`}>A local lens for work, places, objects, and directions worth carrying.</p></>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={isAuthenticated ? "/account" : "/join"} className={`vb-focus flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-xs font-bold ${railCollapsed ? "justify-center" : ""} ${dark ? "text-[#e3e3dc] hover:bg-white/[0.07]" : "text-[#52604a] hover:bg-black/[0.05]"}`}>
              <UserRound className="h-4 w-4 shrink-0" />
              <span className={railCollapsed ? "sr-only" : "truncate"}>{isAuthenticated ? user?.name || "Your Shelf" : "Enter Sura"}</span>
            </Link>
            {!railCollapsed && <Link href="/account" aria-label="Account settings" className={`vb-focus rounded-md p-2 ${dark ? "text-[#c5c9af] hover:bg-white/[0.07] hover:text-white" : "text-[#6c7062] hover:bg-black/[0.05]"}`}><Settings2 className="h-4 w-4" /></Link>}
          </div>
        </div>
      </aside>

      <div className={railCollapsed ? "lg:pl-[4.75rem]" : "lg:pl-[15rem]"}>
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${dark ? "border-white/[0.1] bg-[#121410]/92" : "border-[#d5d8cc] bg-[#f3f1ec]/92"}`}>
          <div className="mx-auto flex h-[4.25rem] max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen((open) => !open)} className={`vb-focus grid h-10 w-10 place-items-center rounded-md border lg:hidden ${dark ? "border-white/[0.12] bg-white/[0.04] text-[#e3e3dc]" : "border-[#d5d8cc] bg-[#faf9f5] text-[#1d211b]"}`} aria-label="Open Sura navigation">
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <Link href="/" className="vb-focus lg:hidden" aria-label="SURA home"><img src="/sura-wordmark.svg" alt="SURA" className="h-8 w-auto" /></Link>
              <p className={`hidden text-sm font-semibold sm:block ${muted}`}>{location === "/" ? "Live Signal" : appNav.find((item) => isNavActive(location, item))?.label || "Sura"}</p>
              <Link href="/discover" className={`vb-focus hidden items-center gap-2 rounded-md border px-3 py-2 text-xs md:flex ${dark ? "border-white/[0.1] bg-white/[0.04] text-[#c5c9af] hover:border-[#caff32] hover:text-[#e3e3dc]" : "border-[#d5d8cc] bg-[#faf9f5] text-[#6c7062] hover:border-[#9bbd15]"}`}>
                <Search className="h-3.5 w-3.5" />
                <span>Search the signal</span>
                <span className={`ml-7 rounded-sm px-1.5 py-0.5 text-[0.58rem] ${dark ? "bg-white/[0.08] text-[#c5c9af]" : "bg-[#e3e5dc] text-[#6c7062]"}`}>/</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block"><AestheticPicker compact /></div>
              <NotificationCenter />
              {isAuthenticated ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link href="/account" className={`vb-focus flex max-w-[10rem] items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold ${dark ? "text-[#e3e3dc] hover:bg-white/[0.06]" : "text-[#52604a] hover:bg-black/[0.05]"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[0.68rem] font-black ${dark ? "bg-[#caff32] text-[#293500]" : "bg-[#1d211b] text-[#f3f1ec]"}`}>{(user?.name || "S").slice(0, 1).toUpperCase()}</span>
                    <span className="truncate">{user?.name || "Shelf"}</span>
                  </Link>
                  <button onClick={() => logout()} className={`vb-focus rounded-md px-2 py-2 text-xs font-bold ${dark ? "text-[#c5c9af] hover:bg-white/[0.06] hover:text-[#ffb4ab]" : "text-[#6c7062] hover:bg-black/[0.05] hover:text-[#b6453e]"}`}>Sign out</button>
                </div>
              ) : (
                <Link href="/join" className={`vb-button vb-focus inline-flex items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold ${dark ? "bg-[#caff32] text-[#293500] hover:bg-[#afd520]" : "bg-[#1d211b] text-[#f3f1ec] hover:bg-[#39402f]"}`}><span className="hidden min-[420px]:inline">Enter Sura</span><UserRound className="h-4 w-4 min-[420px]:hidden" /></Link>
              )}
            </div>
          </div>
          {mobileOpen && <div className={`border-t px-4 py-3 lg:hidden ${dark ? "border-white/[0.1] bg-[#0d0f0b]" : "border-[#d5d8cc] bg-[#ecece6]"}`}><div className="mb-3 flex justify-end"><AestheticPicker compact /></div><PlatformNav dark={dark} location={location} onNavigate={() => setMobileOpen(false)} /></div>}
        </header>

        <div className={`mx-auto min-h-[calc(100vh-4.25rem)] max-w-[1180px] ${surface}`}>
          {children}
        </div>

        <nav className={`sura-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 lg:hidden`} aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {appNav.map(({ href, label, mobileLabel, icon: Icon, exact }) => {
              const active = isNavActive(location, { href, label, mobileLabel, icon: Icon, exact });
              return <Link key={href} href={href} className={`vb-focus flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[0.62rem] font-semibold ${active ? "text-[#caff32]" : "text-[#c5c9af]"}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.8} /><span>{mobileLabel}</span></Link>;
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
