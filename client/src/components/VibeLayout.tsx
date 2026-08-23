import {
  ArrowUpRight,
  Bookmark,
  Compass,
  Home,
  LogIn,
  MapPin,
  Menu,
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
import { startLogin } from "@/const";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { AestheticPicker } from "./AestheticPicker";
import { NotificationCenter } from "./NotificationCenter";

type VibeLayoutProps = { children: ReactNode; dark?: boolean };

type AppNavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const appNav: AppNavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/discover", label: "Explore", icon: Compass },
  { href: "/brief", label: "Create", icon: Plus },
  { href: "/board", label: "Saved board", icon: Bookmark },
  { href: "/ai-studio", label: "AI studio", icon: Sparkles },
];

function isNavActive(location: string, item: AppNavItem) {
  return item.exact ? location === item.href : location === item.href || location.startsWith(`${item.href}/`);
}

function PlatformNav({ dark, location, onNavigate }: { dark: boolean; location: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1.5" aria-label="Primary navigation">
      {appNav.map(({ href, label, icon: Icon, exact }) => {
        const active = isNavActive(location, { href, label, icon: Icon, exact });
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`vb-focus group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${
              active
                ? dark
                  ? "bg-[#d7ff4d] text-[#12130f]"
                  : "bg-[#1f1b17] text-[#fbf8f2]"
                : dark
                  ? "text-[#aaa89f] hover:bg-white/[0.07] hover:text-[#f6f0e6]"
                  : "text-[#6f6254] hover:bg-[#e9dfd1] hover:text-[#211c17]"
            }`}
          >
            <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={active ? 2.4 : 1.9} />
            <span>{label}</span>
            {label === "Create" && <span className="ml-auto rounded-full bg-[#ff765d] px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.08em] text-[#210f0b]">New</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function VibeLayout({ children, dark = false }: VibeLayoutProps) {
  const [location] = useLocation();
  const { city } = useKenyaLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { palette } = useAestheticTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const surface = dark ? "bg-[#151613]" : "bg-[#fbf8f2]";
  const border = dark ? "border-white/[0.09]" : "border-[#ded1bf]";
  const muted = dark ? "text-[#9e9d94]" : "text-[#75695b]";

  return (
    <div
      style={!dark ? { backgroundColor: palette.page, color: palette.ink } : undefined}
      className={`min-h-screen ${dark ? "bg-[#0f100e] text-[#f4efe6]" : "bg-[#f4f0e9]"}`}
    >
      <aside className={`fixed inset-y-0 left-0 z-50 hidden w-[15rem] flex-col border-r px-5 py-6 lg:flex ${dark ? "border-white/[0.09] bg-[#12130f]" : "border-[#ded1bf] bg-[#eee7dc]"}`}>
        <Link href="/" className={`vb-focus flex items-center gap-3 rounded-2xl px-2 py-1.5 ${dark ? "text-[#f6f0e6]" : "text-[#231e18]"}`} aria-label="SURA home">
          <span className="relative grid h-10 w-10 overflow-hidden rounded-xl bg-[#d7ff4d] shadow-sm"><img src="/assets/sura-auth-hero.jpg" alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-[#11130f]/35 text-sm font-black text-white">S</span></span>
          <span className="flex flex-col leading-none">
            <span className="text-[0.92rem] font-black tracking-[0.2em]">SURA</span>
            <span className={`mt-1 text-[0.51rem] font-bold tracking-[0.17em] ${dark ? "text-[#d7ff4d]" : "text-[#a66231]"}`}>LOCAL NETWORK</span>
          </span>
        </Link>

        <div className="mt-10"><PlatformNav dark={dark} location={location} /></div>

        <div className="mt-auto space-y-4">
          <div className={`rounded-2xl border p-4 ${dark ? "border-white/[0.09] bg-white/[0.045]" : "border-[#ded1bf] bg-[#f8f3eb]"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <MapPin className={`h-3.5 w-3.5 ${dark ? "text-[#d7ff4d]" : "text-[#a66231]"}`} />
              <span className={muted}>{city || "Nairobi"} · Kenya</span>
            </div>
            <p className={`mt-3 text-xs leading-5 ${muted}`}>Your local lens keeps recommendations close to where life is happening.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={isAuthenticated ? "/account" : "/join"} className={`vb-focus flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold ${dark ? "text-[#d8d5ca] hover:bg-white/[0.07]" : "text-[#695b4d] hover:bg-[#e5dacb]"}`}>
              <UserRound className="h-4 w-4 shrink-0" />
              <span className="truncate">{isAuthenticated ? user?.name || "Your account" : "Sign in to Sura"}</span>
            </Link>
            <Link href="/account" aria-label="Account settings" className={`vb-focus rounded-xl p-2 ${dark ? "text-[#8c8d83] hover:bg-white/[0.07] hover:text-white" : "text-[#7c6d5d] hover:bg-[#e5dacb]"}`}><Settings2 className="h-4 w-4" /></Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[15rem]">
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${dark ? "border-white/[0.09] bg-[#0f100e]/88" : "border-[#ded1bf] bg-[#f4f0e9]/88"}`}>
          <div className="mx-auto flex h-[4.55rem] max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen((open) => !open)} className={`vb-focus grid h-10 w-10 place-items-center rounded-xl border lg:hidden ${dark ? "border-white/[0.12] bg-white/[0.05] text-[#f4efe6]" : "border-[#d9cdbd] bg-[#fbf8f2] text-[#271f19]"}`} aria-label="Open Sura navigation">
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <p className={`hidden text-sm font-semibold sm:block ${muted}`}>{location === "/" ? "Home" : appNav.find((item) => isNavActive(location, item))?.label || "Sura"}</p>
              <Link href="/discover" className={`vb-focus hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs md:flex ${dark ? "border-white/[0.1] bg-white/[0.04] text-[#8f9088] hover:border-white/20 hover:text-white" : "border-[#d9cdbd] bg-[#fbf8f2] text-[#796b5c] hover:border-[#b9a88f]"}`}>
                <Search className="h-3.5 w-3.5" />
                <span>Search local edits</span>
                <span className={`ml-7 rounded-md px-1.5 py-0.5 text-[0.58rem] ${dark ? "bg-white/[0.08] text-[#77786f]" : "bg-[#eee6da] text-[#887967]"}`}>/</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block"><AestheticPicker compact /></div>
              <NotificationCenter />
              {isAuthenticated ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link href="/account" className={`vb-focus flex max-w-[10rem] items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold ${dark ? "text-[#d9d5cb] hover:bg-white/[0.06]" : "text-[#5f5143] hover:bg-[#e9dfd1]"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.68rem] font-black ${dark ? "bg-[#d7ff4d] text-[#12130f]" : "bg-[#1f1b17] text-[#fbf8f2]"}`}>{(user?.name || "S").slice(0, 1).toUpperCase()}</span>
                    <span className="truncate">{user?.name || "Account"}</span>
                  </Link>
                  <button onClick={() => logout()} className={`vb-focus rounded-xl px-2 py-2 text-xs font-bold ${dark ? "text-[#8f9088] hover:bg-white/[0.06] hover:text-[#ff8a75]" : "text-[#806f5f] hover:bg-[#e9dfd1] hover:text-[#8b3d2d]"}`}>Sign out</button>
                </div>
              ) : (
                <button onClick={() => startLogin()} className={`vb-button vb-focus inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${dark ? "bg-[#f4efe6] text-[#151613] hover:bg-[#d7ff4d]" : "bg-[#1f1b17] text-[#fbf8f2] hover:bg-[#4b4034]"}`}><LogIn className="h-3.5 w-3.5" /> <span className="hidden min-[420px]:inline">Sign in</span></button>
              )}
            </div>
          </div>
          {mobileOpen && <div className={`border-t px-4 py-3 lg:hidden ${dark ? "border-white/[0.09] bg-[#12130f]" : "border-[#ded1bf] bg-[#eee7dc]"}`}><PlatformNav dark={dark} location={location} onNavigate={() => setMobileOpen(false)} /></div>}
        </header>

        <div className={`mx-auto min-h-[calc(100vh-4.55rem)] max-w-[1100px] ${surface}`}>
          {children}
        </div>

        <nav className={`fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 lg:hidden ${dark ? "border-white/[0.1] bg-[#12130f]/95" : "border-[#ded1bf] bg-[#f4f0e9]/95"}`} aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {appNav.map(({ href, label, icon: Icon, exact }) => {
              const active = isNavActive(location, { href, label, icon: Icon, exact });
              return <Link key={href} href={href} className={`vb-focus flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.62rem] font-semibold ${active ? (dark ? "text-[#d7ff4d]" : "text-[#211c17]") : muted}`}><Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.8} /><span>{label === "Create" ? "Create" : label.replace("Saved board", "Saved").replace("AI studio", "AI")}</span></Link>;
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
export const labelize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
