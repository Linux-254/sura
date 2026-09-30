import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import gsap from "gsap";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleDot,
  Compass,
  CreditCard,
  Eye,
  Layers3,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  Palette,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { apiRequest, loadMe, loadPublicNetwork, type Business, type CatalogItem, type MeBundle, type TaxonomyDomain, type TaxonomyNode } from "./lib/api";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type View = "home" | "discover" | "dashboard";
type AuthMode = "signin" | "signup";
type OnboardingRole = "member" | "creator" | "business_owner";
type BootPhase = "in" | "out" | "done";
type Notice = { tone: "good" | "bad"; text: string } | null;
type OnboardingForm = { displayName: string; handle: string; county: string; city: string; bio: string; businessName: string; businessType: string; businessDescription: string; businessEmail: string; businessPhone: string };

const FALLBACK_DOMAINS = [
  "Personal style",
  "Home + living",
  "Spaces + places",
  "Food + hospitality",
  "Mobility + vehicles",
  "Digital + creative",
  "Objects + pets",
  "Events + occasions",
];
const FALLBACK_STYLES = [
  { slug: "soft-power", name: "Soft Power", body: "Warm, composed, quietly polished", tone: "lime" },
  { slug: "thrift-remix", name: "Thrift Remix", body: "Clever, layered, personal", tone: "clay" },
  { slug: "heritage-modern", name: "Heritage Modern", body: "Contemporary material intelligence", tone: "mineral" },
  { slug: "ink-ivory", name: "Ink & Ivory", body: "Gallery restraint, intentional space", tone: "paper" },
  { slug: "coastal-ease", name: "Coastal Ease", body: "Airy, sunlit, material-led", tone: "mineral" },
  { slug: "tangerine-social", name: "Tangerine Social", body: "Joyful, expressive, energetic", tone: "clay" },
];
const POCKETS = [
  { label: "Everyday edit", range: "Under KES 5k", body: "Small shifts, found objects, repeat-wear details.", color: "#caff32" },
  { label: "Considered edit", range: "KES 5k–40k", body: "A clearer object, service or room move with room to breathe.", color: "#b8d9e1" },
  { label: "Signature edit", range: "KES 40k–150k", body: "Fewer, stronger choices with a maker or studio in the loop.", color: "#e79b76" },
  { label: "Commissioned edit", range: "KES 150k+", body: "Brief-led work where fit, craft and delivery become the point.", color: "#f3f0e7" },
];
const VISUALS = [
  { src: "/assets/sura-auth-hero.jpg", label: "Street / signal", className: "hero-visual-tall" },
  { src: "/assets/sura-auth-interior.jpg", label: "Room / material", className: "hero-visual-wide" },
  { src: "/assets/sura-auth-street.jpg", label: "Movement / place", className: "hero-visual-small" },
];

function formatKes(amount: number | null | undefined) {
  return `KES ${(amount ?? 0).toLocaleString("en-KE")}`;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <a href="#top" className="sura-focus inline-flex items-center gap-3" aria-label="SURA home"><img src="/sura-mark-neon.svg" alt="" className={compact ? "h-8 w-8" : "h-9 w-9"} /><span className="font-display text-xl font-bold tracking-[-.08em] text-paper">SURA</span></a>;
}

function Meta({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <span className={`sura-meta text-[10px] font-medium ${dark ? "text-ink/55" : "text-paper/55"}`}>{children}</span>;
}

function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }: { children: React.ReactNode; variant?: "primary" | "ghost" | "paper"; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; className?: string }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`sura-focus sura-button ${variant === "primary" ? "sura-button-primary" : variant === "paper" ? "sura-button-paper" : "sura-button-ghost"} ${className}`}>{children}</button>;
}

function LoadingScreen({ phase }: { phase: Exclude<BootPhase, "done"> }) {
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = loadingRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(".sura-loading-pattern__line", { opacity: 0, scale: 0.72, transformOrigin: "50% 50%", stagger: 0.05, duration: 1.05, ease: "power3.out" });
      gsap.from(".sura-loading-orbit", { scale: 0.55, opacity: 0, duration: 1.1, ease: "back.out(1.5)" });
      gsap.from(".sura-loading-mark", { scale: 0.55, rotate: -8, opacity: 0, duration: 0.85, ease: "back.out(1.7)" });
      gsap.from(".sura-loading-wordmark, .sura-loading-kicker, .sura-loading-caption", { y: 12, opacity: 0, stagger: 0.08, duration: 0.55, delay: 0.18, ease: "power3.out" });
    }, root);
    return () => context.revert();
  }, []);

  return <div ref={loadingRef} className={`sura-loading-screen ${phase === "out" ? "is-exiting" : ""}`} role="status" aria-label="Opening SURA">
    <div className="sura-loading-pattern" aria-hidden="true"><svg className="sura-loading-pattern__svg" viewBox="0 0 640 640" fill="none"><path className="sura-loading-pattern__line" d="M0 80 80 0l80 80-80 80L0 80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 240l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 400l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 560l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Z" /><path className="sura-loading-pattern__line" d="M80 0v640M240 0v640M400 0v640M560 0v640" /><path className="sura-loading-pattern__line" d="M0 160h640M0 320h640M0 480h640" /></svg></div>
    <div className="sura-loading-orbit" aria-hidden="true" />
    <div className="sura-loading-lockup"><img className="sura-loading-mark" src="/sura-mark-neon.svg" alt="" /><span className="sura-loading-wordmark font-display">SURA</span><span className="sura-loading-kicker sura-meta">Nairobi / Kenya</span></div>
    <span className="sura-loading-caption sura-meta">Make the feeling findable</span>
  </div>;
}

function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [bootPhase, setBootPhase] = useState<BootPhase>("in");
  const [view, setView] = useState<View>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [network, setNetwork] = useState<{ domains: TaxonomyDomain[]; nodes: TaxonomyNode[]; businesses: Business[] }>({ domains: [], nodes: [], businesses: [] });
  const [networkLoading, setNetworkLoading] = useState(true);
  const [me, setMe] = useState<MeBundle | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>("member");
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({ displayName: "", handle: "", county: "Nairobi", city: "Nairobi", bio: "", businessName: "", businessType: "", businessDescription: "", businessEmail: "", businessPhone: "" });
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<{ business: Business; item: CatalogItem } | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState<{ status: string; orderId?: string; message: string } | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ county: "Nairobi", phone: "" });

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setBootPhase("out"), 900);
    const doneTimer = window.setTimeout(() => setBootPhase("done"), 1350);
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(doneTimer); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setNetworkLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => { if (!cancelled) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) setSession(nextSession);
    });
    return () => { cancelled = true; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    void loadPublicNetwork().then(setNetwork).catch((error: unknown) => {
      setNotice({ tone: "bad", text: error instanceof Error ? error.message : "The public signal is still warming up." });
    }).finally(() => setNetworkLoading(false));
  }, []);

  useEffect(() => {
    if (!session) { setMe(null); return; }
    void loadMe().then(setMe).catch(() => setMe(null));
  }, [session]);

  useEffect(() => {
    const root = shellRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(".sura-site-header", { y: -16, duration: 0.7, ease: "power3.out", clearProps: "transform" });
      gsap.from(".sura-mobile-nav", { y: 28, scale: 0.96, duration: 0.75, delay: 0.18, ease: "back.out(1.4)", clearProps: "transform" });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    const root = shellRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(".sura-view-shell", { y: 18, duration: 0.65, ease: "power3.out", clearProps: "transform" });
      gsap.from(".sura-mobile-nav__active", { scale: 0.72, duration: 0.45, ease: "back.out(1.7)", clearProps: "transform" });
      gsap.from(".sura-mobile-nav__item[data-active=\"true\"] .sura-mobile-nav__glyph", { y: 4, scale: 0.82, rotate: -8, duration: 0.5, ease: "back.out(2)", clearProps: "transform" });
    }, root);
    return () => context.revert();
  }, [view]);

  const domainNames = network.domains.length ? network.domains.map((domain) => domain.name) : FALLBACK_DOMAINS;
  const styles = network.nodes.filter((node) => node.node_type === "style" || node.node_type === "category").slice(0, 12);
  const styleCards = styles.length ? styles.map((node, index) => ({ slug: node.slug, name: node.name, body: node.kenya_relevance ?? "A direction with room for your own interpretation.", tone: ["lime", "clay", "mineral", "paper"][index % 4] })) : FALLBACK_STYLES;

  const openAuth = (mode: AuthMode = "signup") => { setAuthMode(mode); setNotice(null); setAuthOpen(true); };
  const openOnboarding = () => { if (!session) { openAuth("signup"); return; } setOnboardingOpen(true); setOnboardingStep(1); setNotice(null); };
  const navigate = (nextView: View) => { setView(nextView); setMobileNav(false); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10); };
  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { setNotice({ tone: "bad", text: "Add the new SURA Supabase URL and publishable key to this deployment first." }); return; }
    if (authPassword.length < 8) { setNotice({ tone: "bad", text: "Use at least 8 characters for your password." }); return; }
    setAuthBusy(true); setNotice(null);
    try {
      const response = authMode === "signup"
        ? await supabase.auth.signUp({ email: authEmail.trim().toLowerCase(), password: authPassword, options: { emailRedirectTo: `${window.location.origin}/` } })
        : await supabase.auth.signInWithPassword({ email: authEmail.trim().toLowerCase(), password: authPassword });
      if (response.error) throw response.error;
      if (authMode === "signup" && !response.data.session) {
        setNotice({ tone: "good", text: "Confirmation email sent. Open it, then return to enter the signal." });
      } else {
        setAuthOpen(false); setView("dashboard"); setNotice({ tone: "good", text: "Your private SURA space is open." });
      }
    } catch (error) { setNotice({ tone: "bad", text: error instanceof Error ? error.message : "That sign-in did not complete." }); }
    finally { setAuthBusy(false); }
  };
  const handleSignOut = async () => { await supabase?.auth.signOut(); setView("home"); setNotice({ tone: "good", text: "You are signed out." }); };
  const finishOnboarding = async () => {
    if (!session) return openAuth("signup");
    if (!onboardingForm.displayName || !onboardingForm.handle || !onboardingForm.county || !onboardingForm.city) { setNotice({ tone: "bad", text: "Add your name, handle, county and city to continue." }); return; }
    if (onboardingRole === "business_owner" && (!onboardingForm.businessName || !onboardingForm.businessType)) { setNotice({ tone: "bad", text: "Add your business name and type so the studio can be reviewed." }); return; }
    setOnboardingBusy(true); setNotice(null);
    try {
      await apiRequest("/api/v1/onboarding", { method: "POST", body: JSON.stringify({ displayName: onboardingForm.displayName, handle: onboardingForm.handle, county: onboardingForm.county, city: onboardingForm.city, bio: onboardingForm.bio, role: onboardingRole, aesthetics: selectedAesthetics, business: onboardingRole === "business_owner" ? { legalName: onboardingForm.businessName, displayName: onboardingForm.businessName, businessType: onboardingForm.businessType, description: onboardingForm.businessDescription, contactEmail: onboardingForm.businessEmail, phone: onboardingForm.businessPhone, aesthetics: selectedAesthetics } : undefined }) });
      setMe(await loadMe()); setOnboardingOpen(false); setView("dashboard"); setNotice({ tone: "good", text: onboardingRole === "business_owner" ? "Business studio submitted for review." : "Your SURA direction is ready." });
    } catch (error) { setNotice({ tone: "bad", text: error instanceof Error ? error.message : "Onboarding could not be saved." }); }
    finally { setOnboardingBusy(false); }
  };
  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOffer) return;
    if (!session) { setSelectedOffer(null); openAuth("signin"); return; }
    setCheckoutBusy(true); setCheckoutDone(null);
    try {
      const result = await apiRequest<{ order: { id: string; status: string; total_kes: number }; payment: { status: string } }>("/api/v1/orders", { method: "POST", body: JSON.stringify({ businessId: selectedOffer.business.id, catalogItemId: selectedOffer.item.id, quantity: 1, deliveryCounty: checkoutForm.county, deliveryKes: 0, phone: checkoutForm.phone }) });
      setCheckoutDone({ status: result.order.status, orderId: result.order.id, message: "Order prepared. The next step is a verified provider callback — no payment is marked complete from the browser." });
    } catch (error) { setCheckoutDone({ status: "error", message: error instanceof Error ? error.message : "Order setup failed." }); }
    finally { setCheckoutBusy(false); }
  };

  return <div ref={shellRef} id="top" className="sura-shell">
    {bootPhase !== "done" && <LoadingScreen phase={bootPhase} />}
    <Header view={view} session={session} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openAuth={openAuth} openDashboard={() => session ? navigate("dashboard") : openAuth("signin")} />
    <div key={view} className="sura-view-shell">
      {view === "home" && <HomeView domainNames={domainNames} styleCards={styleCards} businesses={network.businesses} networkLoading={networkLoading} openAuth={openAuth} openOnboarding={openOnboarding} setSelectedOffer={setSelectedOffer} navigate={navigate} />}
      {view === "discover" && <DiscoverView domains={domainNames} nodes={network.nodes} businesses={network.businesses} loading={networkLoading} setSelectedOffer={setSelectedOffer} openOnboarding={openOnboarding} />}
      {view === "dashboard" && <DashboardView me={me} session={session} openOnboarding={openOnboarding} navigate={navigate} openAuth={openAuth} signOut={handleSignOut} />}
    </div>
    {notice && <NoticeBar notice={notice} onClose={() => setNotice(null)} />}
    {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} busy={authBusy} notice={notice} onSubmit={handleAuth} onClose={() => setAuthOpen(false)} />}
    {onboardingOpen && <OnboardingModal step={onboardingStep} setStep={setOnboardingStep} role={onboardingRole} setRole={setOnboardingRole} form={onboardingForm} setForm={setOnboardingForm} styles={styleCards} selected={selectedAesthetics} setSelected={setSelectedAesthetics} busy={onboardingBusy} onFinish={finishOnboarding} onClose={() => setOnboardingOpen(false)} />}
    {selectedOffer && <CheckoutModal offer={selectedOffer} form={checkoutForm} setForm={setCheckoutForm} busy={checkoutBusy} done={checkoutDone} submit={submitOrder} onClose={() => { setSelectedOffer(null); setCheckoutDone(null); }} />}
    <MobileNav view={view} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openDashboard={() => session ? navigate("dashboard") : openAuth("signin")} />
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8 lg:px-14"><div className="mx-auto flex max-w-[1320px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><Logo compact /><p className="mt-4 max-w-sm text-sm leading-6 text-paper/50">A visual network for the things people see, wear, touch, arrange, drive, live with and carry.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-paper/55"><a href="#about" className="sura-focus hover:text-lime">About</a><a href="#pockets" className="sura-focus hover:text-lime">Pocket ladder</a><a href="#signals" className="sura-focus hover:text-lime">Signals</a><button className="sura-focus hover:text-lime" onClick={() => openAuth("signin")}>Private space</button></div></div></footer>
  </div>;
}

function Header({ view, session, mobileNav, setMobileNav, navigate, openAuth, openDashboard }: { view: View; session: Session | null; mobileNav: boolean; setMobileNav: (value: boolean) => void; navigate: (view: View) => void; openAuth: (mode?: AuthMode) => void; openDashboard: () => void }) {
  return <header className="sura-site-header sticky top-0 z-30 border-b border-white/10 px-5 py-4 sm:px-8 lg:px-14"><div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-6"><Logo /><nav className={`sura-header-nav ${mobileNav ? "is-open" : ""} items-center gap-1`}><button onClick={() => navigate("home")} className={`sura-focus px-3 py-2 text-xs font-bold ${view === "home" ? "text-lime" : "text-paper/60 hover:text-paper"}`}>The signal</button><button onClick={() => navigate("discover")} className={`sura-focus px-3 py-2 text-xs font-bold ${view === "discover" ? "text-lime" : "text-paper/60 hover:text-paper"}`}>Explore</button><a href="#pockets" onClick={() => setMobileNav(false)} className="sura-focus px-3 py-2 text-xs font-bold text-paper/60 hover:text-paper">Your pocket</a></nav><div className="flex items-center gap-2"><Meta>NAI / KE</Meta>{session ? <button onClick={openDashboard} className="sura-focus hidden items-center gap-2 border border-white/15 px-3 py-2 text-xs font-bold text-paper sm:inline-flex"><CircleDot className="h-3 w-3 text-lime" /> My SURA</button> : <button onClick={() => openAuth("signin")} className="sura-focus hidden px-3 py-2 text-xs font-bold text-paper/70 hover:text-lime sm:inline-flex">Sign in</button>}<button onClick={() => session ? openDashboard() : openAuth("signup")} className="sura-focus sura-button sura-button-primary min-h-10 px-3 text-[10px]">{session ? "Open space" : "Enter signal"}</button><button onClick={() => setMobileNav(!mobileNav)} className="sura-focus grid h-10 w-10 place-items-center border border-white/15 sm:hidden" aria-label="Toggle navigation" aria-expanded={mobileNav}>{mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div></div></header>;
}

function MobileNav({ view, mobileNav, setMobileNav, navigate, openDashboard }: { view: View; mobileNav: boolean; setMobileNav: (value: boolean) => void; navigate: (view: View) => void; openDashboard: () => void }) {
  const items: Array<{ id: View; label: string; Icon: typeof CircleDot }> = [
    { id: "home", label: "Signal", Icon: CircleDot },
    { id: "discover", label: "Explore", Icon: Compass },
    { id: "dashboard", label: "Pocket", Icon: Palette },
  ];
  return <nav className="sura-mobile-nav" aria-label="Primary mobile navigation"><div className="sura-mobile-nav__track">
    {items.map(({ id, label, Icon }) => {
      const active = view === id;
      return <button key={id} type="button" data-active={active} aria-current={active ? "page" : undefined} className="sura-focus sura-mobile-nav__item" onClick={() => { setMobileNav(false); id === "dashboard" ? openDashboard() : navigate(id); }}>
        {active && <span className="sura-mobile-nav__active" aria-hidden="true" />}
        <span className="sura-mobile-nav__glyph"><Icon className="h-[17px] w-[17px]" /></span><span>{label}</span>
      </button>;
    })}
    <button type="button" data-active={mobileNav} aria-expanded={mobileNav} className="sura-focus sura-mobile-nav__item" onClick={() => setMobileNav(!mobileNav)}>
      {mobileNav && <span className="sura-mobile-nav__active" aria-hidden="true" />}
      <span className="sura-mobile-nav__glyph">{mobileNav ? <X className="h-[17px] w-[17px]" /> : <Menu className="h-[17px] w-[17px]" />}</span><span>Menu</span>
    </button>
  </div></nav>;
}

function HomeView({ domainNames, styleCards, businesses, networkLoading, openAuth, openOnboarding, setSelectedOffer, navigate }: { domainNames: string[]; styleCards: Array<{ slug: string; name: string; body: string; tone: string }>; businesses: Business[]; networkLoading: boolean; openAuth: (mode?: AuthMode) => void; openOnboarding: () => void; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void; navigate: (view: View) => void }) {
  return <main>
    <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:px-14 lg:pt-20"><div className="pointer-events-none absolute right-[-16rem] top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-lime/10 blur-[110px]" /><div className="pointer-events-none absolute bottom-[-10rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-clay/10 blur-[100px]" /><div className="relative mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-end"><div className="max-w-3xl"><div className="mb-7 flex items-center gap-3"><span className="h-px w-12 bg-lime" /><Meta>Visual network / 001</Meta></div><h1 className="sura-display max-w-4xl text-[clamp(3.5rem,8vw,8rem)] font-bold text-paper">Make the <span className="text-lime">feeling</span> findable.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-paper/62 sm:text-xl">SURA connects the way you want life to feel with the people, businesses, objects, spaces and next steps that can make it real.</p><div className="mt-9 flex flex-wrap gap-3"><Button onClick={openOnboarding}>Start your direction <ArrowUpRight className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => navigate("discover")}>See the field <ArrowRight className="h-4 w-4" /></Button></div><div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-paper/45"><span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-lime" />Nairobi first, Kenya wide</span><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-lime" />Budget without the shame</span></div></div><HeroVisual /></div><div className="relative mx-auto mt-16 grid max-w-[1320px] gap-4 border-y border-white/10 py-4 sm:grid-cols-4"><div className="sm:col-span-1"><Meta>See → shape → source</Meta></div><div className="sm:col-span-3 grid gap-3 text-sm text-paper/55 sm:grid-cols-3"><span>Choose a direction.</span><span>Meet a point of view.</span><span>Move when it feels right.</span></div></div></section>
    <section id="about" className="sura-paper px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><Meta dark>What SURA sees</Meta><h2 className="sura-display mt-5 text-5xl font-bold sm:text-6xl">Aesthetics are a network.</h2></div><div className="grid gap-10 sm:grid-cols-2"><p className="text-lg leading-8 text-ink/65">Not just fashion. The room, the ride, the table, the salon, the studio, the object, the pet, the place and the small ritual that keeps showing up.</p><div><div className="mb-4 flex items-center gap-2"><Layers3 className="h-4 w-4 text-ink/50" /><Meta dark>Eight fields to start</Meta></div><div className="flex flex-wrap gap-2">{domainNames.slice(0, 8).map((domain) => <span key={domain} className="border border-ink/15 px-3 py-2 text-xs font-bold">{domain}</span>)}</div></div></div></div></section>
    <section id="pockets" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Meta>Your pocket is a design input</Meta><h2 className="sura-display mt-4 max-w-2xl text-5xl font-bold sm:text-6xl">Taste, with a route to reality.</h2></div><p className="max-w-sm text-sm leading-6 text-paper/50">SURA never turns price into a ranking. It uses it to make the next step honest.</p></div><div className="mt-10 grid border-y border-white/10 sm:grid-cols-2 lg:grid-cols-4">{POCKETS.map((pocket, index) => <article key={pocket.label} className="border-b border-white/10 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"><div className="mb-12 flex items-center justify-between"><span className="h-3 w-3 rounded-full" style={{ background: pocket.color }} /><Meta>{String(index + 1).padStart(2, "0")}</Meta></div><h3 className="font-display text-2xl font-bold">{pocket.label}</h3><p className="mt-2 text-xs font-bold text-lime">{pocket.range}</p><p className="mt-5 text-sm leading-6 text-paper/50">{pocket.body}</p></article>)}</div></div></section>
    <section id="signals" className="sura-paper px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Meta dark>Current directions</Meta><h2 className="sura-display mt-4 text-5xl font-bold sm:text-6xl">Find your mix.</h2></div><button onClick={() => navigate("discover")} className="sura-focus inline-flex items-center gap-2 self-start text-xs font-bold text-ink/60 hover:text-ink sm:self-auto">Open the whole taxonomy <ArrowUpRight className="h-4 w-4" /></button></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{styleCards.slice(0, 6).map((style, index) => <article key={style.slug} className={`group relative min-h-[260px] overflow-hidden p-5 ${index === 0 ? "bg-ink text-paper" : index === 1 ? "bg-clay text-ink" : index === 2 ? "bg-mineral text-ink" : "bg-soft-paper text-ink"}`}><div className="flex items-start justify-between"><span className="font-display text-3xl font-bold">{String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-5 w-5 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><div className="absolute inset-x-5 bottom-5"><h3 className="font-display text-3xl font-bold tracking-[-.06em]">{style.name}</h3><p className="mt-2 max-w-xs text-sm opacity-70">{style.body}</p></div></article>)}</div></div></section>
    <BusinessSignals businesses={businesses} loading={networkLoading} setSelectedOffer={setSelectedOffer} openAuth={openAuth} />
    <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-14"><div className="sura-grid mx-auto grid max-w-[1320px] gap-10 border border-white/12 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:p-14"><div><Meta>Build with the network</Meta><h2 className="sura-display mt-5 max-w-3xl text-5xl font-bold text-paper sm:text-7xl">The moodboard is only the beginning.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-paper/58">Save a direction. Brief a business. Keep the budget visible. Let payment and receipts have a proper handoff when it is time to move.</p></div><div className="flex flex-col justify-end gap-3 lg:items-end"><Button onClick={openOnboarding}>Create your SURA space <ArrowRight className="h-4 w-4" /></Button><p className="max-w-xs text-right text-xs leading-5 text-paper/40">Supabase Auth, role-based access and RLS-backed records keep the private layer private.</p></div></div></section>
  </main>;
}

function HeroVisual() {
  return <div className="relative min-h-[420px] lg:min-h-[520px]"><div className="absolute left-[6%] top-[9%] z-10 w-[48%] rotate-[-5deg] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:left-[8%]"><img src={VISUALS[0].src} alt="A street-level SURA visual signal" className="sura-image aspect-[.76] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>01 / street</Meta><span className="h-2 w-2 rounded-full bg-lime" /></div></div><div className="absolute right-[3%] top-0 w-[55%] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:right-[5%]"><img src={VISUALS[1].src} alt="A warm interior material study" className="sura-image aspect-[1.08] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>02 / interior</Meta><span className="text-[10px] text-paper/45">soft utility</span></div></div><div className="absolute bottom-[3%] right-[9%] z-20 w-[43%] rotate-[4deg] overflow-hidden border border-lime/40 bg-lime p-2 text-ink shadow-2xl"><img src={VISUALS[2].src} alt="A moving street detail" className="sura-image aspect-[1.15] w-full object-cover grayscale-[.1]" /><div className="flex items-center justify-between px-1 py-3"><Meta dark>03 / movement</Meta><ArrowUpRight className="h-4 w-4" /></div></div><div className="absolute bottom-[12%] left-0 z-30 hidden rotate-[-12deg] border border-white/20 bg-paper px-4 py-3 text-ink shadow-2xl sm:block"><span className="sura-meta text-[10px] font-bold">Make it yours.</span></div></div>;
}

function BusinessSignals({ businesses, loading, setSelectedOffer, openAuth }: { businesses: Business[]; loading: boolean; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void; openAuth: (mode?: AuthMode) => void }) {
  return <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex items-center justify-between gap-4"><div><Meta>Verified business signal</Meta><h2 className="sura-display mt-4 text-5xl font-bold sm:text-6xl">The people behind the feeling.</h2></div><Store className="hidden h-10 w-10 text-lime sm:block" /></div>{loading ? <div className="mt-10 grid gap-3 sm:grid-cols-3"><div className="h-64 animate-pulse bg-white/5" /><div className="h-64 animate-pulse bg-white/5" /><div className="h-64 animate-pulse bg-white/5" /></div> : businesses.length ? <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{businesses.slice(0, 6).map((business) => <BusinessCard key={business.id} business={business} setSelectedOffer={setSelectedOffer} />)}</div> : <div className="mt-10 grid gap-4 border border-dashed border-white/20 p-6 sm:grid-cols-[1.2fr_.8fr] sm:p-10"><div><BadgeCheck className="h-8 w-8 text-lime" /><h3 className="sura-display mt-7 text-4xl font-bold">The field is opening.</h3><p className="mt-4 max-w-lg text-sm leading-6 text-paper/55">Verified studios and catalogues will appear here as they are approved. If you are a maker, stylist, shop, venue or creative business, your point of view can be one of the first signals in the room.</p></div><div className="flex flex-col justify-end gap-3 border-t border-white/10 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"><Meta>For businesses</Meta><button onClick={() => openAuth("signup")} className="sura-focus flex items-center justify-between border-b border-white/20 py-4 text-left text-sm font-bold hover:border-lime">Put your point of view to work <ArrowRight className="h-4 w-4 text-lime" /></button></div></div>}</div></section>;
}

function BusinessCard({ business, setSelectedOffer }: { business: Business; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void }) {
  const offer = business.catalog?.[0];
  return <article className="sura-card group overflow-hidden"><div className="relative aspect-[1.3] overflow-hidden bg-field"><img src={VISUALS[business.display_name.length % VISUALS.length].src} alt="" className="sura-image h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" /><div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-lime"><BadgeCheck className="h-3 w-3" /> Verified</div><h3 className="font-display text-2xl font-bold text-paper">{business.display_name}</h3></div><ArrowUpRight className="h-5 w-5 text-paper/70" /></div></div><div className="p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-paper/70">{business.business_type}</p><span className="flex items-center gap-1 text-[10px] font-bold text-paper/45"><MapPin className="h-3 w-3" />{business.city ?? business.county ?? "Kenya"}</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-paper/50">{business.description || "A verified local point of view, ready to be explored."}</p>{offer && <button onClick={() => setSelectedOffer({ business, item: offer })} className="sura-focus mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-left text-xs font-bold text-lime">{offer.name} <span>{formatKes(offer.price_min_kes)} <ArrowRight className="ml-1 inline h-3 w-3" /></span></button>}</div></article>;
}

function DiscoverView({ domains, nodes, businesses, loading, setSelectedOffer, openOnboarding }: { domains: string[]; nodes: TaxonomyNode[]; businesses: Business[]; loading: boolean; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void; openOnboarding: () => void }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All fields");
  const filteredNodes = nodes.filter((node) => `${node.name} ${node.slug} ${node.node_type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 30);
  const filteredBusinesses = businesses.filter((business) => `${business.display_name} ${business.business_type} ${business.city}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="px-5 pb-20 pt-12 sm:px-8 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="max-w-3xl"><Meta>Explore the network</Meta><h1 className="sura-display mt-5 text-6xl font-bold text-paper sm:text-8xl">Find a <span className="text-lime">direction.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-paper/55">Search by the visible cues people use to make a place, product, service or business feel like theirs.</p></div><div className="mt-10 grid gap-3 lg:grid-cols-[1fr_auto]"><label className="flex items-center gap-3 border border-white/15 bg-white/[.04] px-4 py-3"><Search className="h-4 w-4 text-paper/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a style, material, service or place" className="min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-paper/35" /></label><button onClick={openOnboarding} className="sura-focus sura-button sura-button-primary"><Plus className="h-4 w-4" /> Add your signal</button></div><div className="mt-6 flex gap-2 overflow-x-auto pb-2">{["All fields", ...domains].map((item) => <button key={item} onClick={() => setDomain(item)} className={`sura-focus shrink-0 border px-3 py-2 text-xs font-bold ${domain === item ? "border-lime bg-lime text-ink" : "border-white/15 text-paper/55 hover:border-lime/60"}`}>{item}</button>)}</div><div className="mt-14 grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><section><div className="flex items-center justify-between"><div><Meta>Taxonomy / visible cues</Meta><h2 className="sura-display mt-3 text-4xl font-bold">The living index.</h2></div><span className="font-meta text-xs text-paper/40">{filteredNodes.length} nodes</span></div>{loading ? <p className="mt-7 text-sm text-paper/45">Loading the field…</p> : filteredNodes.length ? <div className="mt-7 grid gap-2 sm:grid-cols-2">{filteredNodes.map((node) => <article key={node.id} className="sura-card p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-bold text-paper">{node.name}</h3><span className="text-[10px] font-bold uppercase tracking-[.12em] text-lime">{node.affordability?.replace("_", " ") ?? "open edit"}</span></div><p className="mt-2 text-xs leading-5 text-paper/45">{node.node_type} · {node.slug.replaceAll("-", " ")}</p></article>)}</div> : <div className="mt-7 border border-dashed border-white/20 p-6 text-sm text-paper/45">No taxonomy cue matches that search yet.</div>}</section><section><div className="flex items-center justify-between"><div><Meta>Verified businesses</Meta><h2 className="sura-display mt-3 text-4xl font-bold">A route to real people.</h2></div><span className="font-meta text-xs text-paper/40">{filteredBusinesses.length} studios</span></div>{filteredBusinesses.length ? <div className="mt-7 space-y-3">{filteredBusinesses.map((business) => <BusinessCard key={business.id} business={business} setSelectedOffer={setSelectedOffer} />)}</div> : <div className="mt-7 border border-dashed border-white/20 p-6 text-sm leading-6 text-paper/45">No verified business matches that search yet. The network is designed to grow by niche, not by one generic storefront.</div>}</section></div></div></main>;
}

function DashboardView({ me, session, openOnboarding, navigate, openAuth, signOut }: { me: MeBundle | null; session: Session | null; openOnboarding: () => void; navigate: (view: View) => void; openAuth: (mode?: AuthMode) => void; signOut: () => void }) {
  if (!session) return <main className="grid min-h-[70vh] place-items-center px-5 py-20"><div className="max-w-md text-center"><LockKeyhole className="mx-auto h-10 w-10 text-lime" /><h1 className="sura-display mt-6 text-5xl font-bold">Your private space is waiting.</h1><p className="mt-4 text-sm leading-6 text-paper/55">Sign in to save directions, onboard a business, and keep order handoffs connected.</p><Button className="mt-8" onClick={() => openAuth("signin")}>Sign in <ArrowRight className="h-4 w-4" /></Button></div></main>;
  const hasProfile = Boolean(me?.profile);
  return <main className="px-5 pb-20 pt-12 sm:px-8 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><Meta>Private space / {session.user.email}</Meta><h1 className="sura-display mt-4 text-6xl font-bold text-paper sm:text-8xl">Your <span className="text-lime">direction.</span></h1></div><div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => navigate("discover")}>Explore field <Compass className="h-4 w-4" /></Button><Button onClick={hasProfile ? openOnboarding : openOnboarding}>{hasProfile ? "Edit profile" : "Start onboarding"} <ArrowRight className="h-4 w-4" /></Button></div></div>{!hasProfile && <div className="mt-8 border border-lime/35 bg-lime/10 p-5"><p className="font-meta text-[10px] uppercase tracking-[.14em] text-lime">One step to unlock SURA</p><p className="mt-2 text-sm leading-6 text-paper/70">Choose your role, place and aesthetic mix. Business owners can submit a studio for review.</p></div>}<div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><section className="sura-card p-6 sm:p-8"><div className="flex items-start justify-between"><div><Meta>Profile signal</Meta><h2 className="sura-display mt-4 text-4xl font-bold">{me?.profile?.display_name ?? "Not shaped yet"}</h2></div><div className="grid h-12 w-12 place-items-center bg-lime text-ink"><Palette className="h-5 w-5" /></div></div><p className="mt-5 text-sm leading-6 text-paper/55">{me?.profile?.bio || "Your SURA profile is where directions, places and useful obsessions begin to connect."}</p><div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">{[["Handle", me?.profile?.handle ? `@${me.profile.handle}` : "—"], ["City", me?.profile?.city || "—"], ["Roles", me?.roles.map((role) => role.role).join(" · ") || "member"]].map(([label, value]) => <div key={label} className="bg-ink p-4"><Meta>{label}</Meta><p className="mt-2 text-sm font-bold text-paper">{value}</p></div>)}</div></section><section className="sura-paper p-6 sm:p-8"><Meta dark>Role surfaces</Meta><h2 className="sura-display mt-4 text-4xl font-bold">Make it useful.</h2><div className="mt-7 space-y-3">{[{ Icon: Building2, title: "List a business", body: "Put a clear point of view in the field.", action: openOnboarding }, { Icon: PackageCheck, title: "Keep an order handoff", body: "Payment intent → provider callback → receipt.", action: () => navigate("discover") }, { Icon: Eye, title: "See your pocket", body: "Change the route without changing the feeling.", action: () => navigate("home") }].map(({ Icon, title, body, action }) => <button key={title} onClick={action} className="sura-focus flex w-full items-start gap-3 border-b border-ink/15 pb-4 text-left last:border-b-0"><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center bg-ink text-lime"><Icon className="h-4 w-4" /></span><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-ink/55">{body}</span></span><ArrowUpRight className="ml-auto mt-1 h-4 w-4 text-ink/40" /></button>)}</div></section></div><section className="mt-10"><div className="flex items-end justify-between"><div><Meta>Business studios</Meta><h2 className="sura-display mt-3 text-4xl font-bold">Your operating layer.</h2></div><button onClick={openOnboarding} className="sura-focus text-xs font-bold text-lime">+ Add studio</button></div>{me?.businesses.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{me.businesses.map((business) => <article key={business.id} className="sura-card p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-bold text-paper">{business.display_name}</h3><p className="mt-1 text-xs text-paper/45">{business.business_type} · {business.city}</p></div><span className="border border-lime/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-lime">{business.status.replace("_", " ")}</span></div><p className="mt-5 text-sm leading-6 text-paper/55">Your business review, catalog and future order handoffs live behind this studio boundary.</p></article>)}</div> : <div className="mt-6 border border-dashed border-white/20 p-6 text-sm leading-6 text-paper/45">No business studio yet. The same account can remain a member and add a business role later.</div>}</section><section className="mt-10"><Meta>Orders + receipts</Meta><h2 className="sura-display mt-3 text-4xl font-bold">The handoff stays visible.</h2>{me?.orders.length ? <div className="mt-6 space-y-2">{me.orders.map((order) => <div key={order.id} className="sura-card flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-meta text-[10px] uppercase tracking-[.12em] text-paper/45">{order.id.slice(0, 8)}</p><p className="mt-1 text-sm font-bold text-paper">{formatKes(order.total_kes)}</p></div><span className="text-xs font-bold text-lime">{order.status.replace("_", " ")}</span></div>)}</div> : <div className="mt-6 border border-dashed border-white/20 p-6 text-sm leading-6 text-paper/45">Your first order will show here with payment state, production handoff and receipt status separated clearly.</div>}</section><button onClick={signOut} className="sura-focus mt-10 inline-flex items-center gap-2 text-xs font-bold text-paper/45 hover:text-lime"><LogOut className="h-4 w-4" /> Sign out of SURA</button></div></main>;
}

function NoticeBar({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  if (!notice) return null;
  return <div className={`fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 border px-4 py-3 shadow-2xl backdrop-blur-xl ${notice.tone === "good" ? "border-lime/35 bg-field/95 text-paper" : "border-clay/50 bg-[#291914]/95 text-paper"}`} role="status"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.tone === "good" ? "bg-lime" : "bg-clay"}`} /><p className="flex-1 text-sm leading-5">{notice.text}</p><button onClick={onClose} className="sura-focus text-paper/50"><X className="h-4 w-4" /></button></div>;
}

function AuthModal({ mode, setMode, email, setEmail, password, setPassword, busy, notice, onSubmit, onClose }: { mode: AuthMode; setMode: (mode: AuthMode) => void; email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; busy: boolean; notice: Notice; onSubmit: (event: React.FormEvent) => void; onClose: () => void }) {
  return <div className="sura-modal-backdrop fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4"><div className="sura-modal relative grid w-full max-w-4xl overflow-hidden border border-white/15 bg-field shadow-2xl lg:grid-cols-[.9fr_1.1fr]"><button onClick={onClose} className="sura-focus absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center border border-white/15 text-paper/70"><X className="h-4 w-4" /></button><div className="relative hidden min-h-[570px] overflow-hidden lg:block"><img src="/assets/sura-auth-hero.jpg" alt="A SURA street visual" className="h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/5" /><div className="absolute inset-x-7 bottom-7"><Meta>SURA / enter your edit</Meta><h2 className="sura-display mt-4 text-5xl font-bold text-paper">Good ideas find a way here.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-paper/60">Your account is a private layer for directions, studios and handoffs.</p></div></div><div className="p-6 sm:p-10"><Meta>Supabase Auth / secure access</Meta><h2 className="sura-display mt-5 text-5xl font-bold text-paper">{mode === "signup" ? "Start your signature." : "Pick up your point of view."}</h2><p className="mt-4 text-sm leading-6 text-paper/55">Email and password are handled by your SURA Supabase project so the private layer stays with your own account.</p><div className="mt-8 grid grid-cols-2 border border-white/15 p-1"><button onClick={() => setMode("signin")} className={`sura-focus px-3 py-3 text-xs font-bold ${mode === "signin" ? "bg-lime text-ink" : "text-paper/55"}`}>Sign in</button><button onClick={() => setMode("signup")} className={`sura-focus px-3 py-3 text-xs font-bold ${mode === "signup" ? "bg-lime text-ink" : "text-paper/55"}`}>Create account</button></div><form onSubmit={onSubmit} className="mt-6 space-y-4"><label className="block"><Meta>Email address</Meta><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none placeholder:text-paper/30" /></label><label className="block"><Meta>Password</Meta><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none placeholder:text-paper/30" /></label><Button type="submit" disabled={busy} className="w-full">{busy ? "Opening secure space…" : mode === "signup" ? "Create account" : "Sign in"}<ArrowRight className="h-4 w-4" /></Button></form>{notice && <p className={`mt-4 border px-4 py-3 text-xs leading-5 ${notice.tone === "good" ? "border-lime/30 bg-lime/10 text-lime" : "border-clay/40 bg-clay/10 text-clay"}`}>{notice.text}</p>}<p className="mt-7 text-center text-[11px] leading-5 text-paper/35">By continuing, you accept the SURA terms and privacy rules. New accounts confirm their email before full access.</p></div></div></div>;
}

function OnboardingModal({ step, setStep, role, setRole, form, setForm, styles, selected, setSelected, busy, onFinish, onClose }: { step: number; setStep: (step: number) => void; role: OnboardingRole; setRole: (role: OnboardingRole) => void; form: OnboardingForm; setForm: (form: OnboardingForm) => void; styles: Array<{ slug: string; name: string; body: string; tone: string }>; selected: string[]; setSelected: (values: string[]) => void; busy: boolean; onFinish: () => void; onClose: () => void }) {
  const patch = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  const toggle = (slug: string) => setSelected(selected.includes(slug) ? selected.filter((value) => value !== slug) : selected.length >= 5 ? selected : [...selected, slug]);
  return <div className="sura-modal-backdrop fixed inset-0 z-[60] overflow-y-auto p-4"><div className="sura-modal mx-auto mt-6 w-full max-w-3xl overflow-hidden border border-white/15 bg-field shadow-2xl sm:mt-14"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8"><div><Meta>Onboarding / {String(step).padStart(2, "0")} of 03</Meta><div className="mt-3 flex gap-1"><span className={`h-1 w-16 ${step >= 1 ? "bg-lime" : "bg-white/15"}`} /><span className={`h-1 w-16 ${step >= 2 ? "bg-lime" : "bg-white/15"}`} /><span className={`h-1 w-16 ${step >= 3 ? "bg-lime" : "bg-white/15"}`} /></div></div><button onClick={onClose} className="sura-focus grid h-10 w-10 place-items-center border border-white/15 text-paper/70"><X className="h-4 w-4" /></button></div><div className="p-5 sm:p-8">{step === 1 && <div><Meta>Your role shapes the route</Meta><h2 className="sura-display mt-5 max-w-2xl text-5xl font-bold text-paper">How do you want to enter the field?</h2><p className="mt-4 max-w-xl text-sm leading-6 text-paper/55">You can change this later. The role only decides which tools appear first.</p><div className="mt-8 grid gap-3 md:grid-cols-3">{[["member", "I am exploring", "Save directions, follow businesses, make an order when it feels right.", Compass], ["creator", "I make things", "Build a public point of view and turn a brief into a useful next step.", Sparkles], ["business_owner", "I run a business", "Submit a verified studio, catalogue products or services and manage handoffs.", Building2]].map(([value, title, body, Icon]) => <button key={value as string} onClick={() => setRole(value as OnboardingRole)} className={`sura-focus border p-5 text-left ${role === value ? "border-lime bg-lime/10" : "border-white/15 bg-white/[.03] hover:border-lime/50"}`}><Icon className={`h-6 w-6 ${role === value ? "text-lime" : "text-paper/55"}`} /><h3 className="mt-8 font-display text-xl font-bold text-paper">{title as string}</h3><p className="mt-3 text-xs leading-5 text-paper/50">{body as string}</p></button>)}</div><div className="mt-8 flex justify-end"><Button onClick={() => setStep(2)}>Continue <ArrowRight className="h-4 w-4" /></Button></div></div>}{step === 2 && <div><Meta>Your place in the picture</Meta><h2 className="sura-display mt-5 max-w-2xl text-5xl font-bold text-paper">Give the direction a name.</h2><div className="mt-8 grid gap-4 sm:grid-cols-2"><label><Meta>Display name</Meta><input value={form.displayName} onChange={(event) => patch("displayName", event.target.value)} placeholder="Your name" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>Handle / lowercase</Meta><input value={form.handle} onChange={(event) => patch("handle", event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="your_signal" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>County</Meta><input value={form.county} onChange={(event) => patch("county", event.target.value)} className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>City / town</Meta><input value={form.city} onChange={(event) => patch("city", event.target.value)} className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label className="sm:col-span-2"><Meta>One-line bio (optional)</Meta><textarea value={form.bio} onChange={(event) => patch("bio", event.target.value)} rows={3} placeholder="The details I keep returning to…" className="sura-focus mt-2 w-full resize-none border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label></div><div className="mt-8 flex justify-between"><Button variant="ghost" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Next: choose a mix <ArrowRight className="h-4 w-4" /></Button></div></div>}{step === 3 && <div><Meta>Choose your mix</Meta><h2 className="sura-display mt-5 max-w-2xl text-5xl font-bold text-paper">What should SURA notice first?</h2><p className="mt-4 text-sm leading-6 text-paper/55">Choose up to five directions. SURA treats them as a mix, never a score.</p><div className="mt-7 grid gap-2 sm:grid-cols-2">{styles.slice(0, 10).map((style) => <button key={style.slug} onClick={() => toggle(style.slug)} className={`sura-focus flex items-start justify-between gap-3 border p-4 text-left ${selected.includes(style.slug) ? "border-lime bg-lime/10" : "border-white/15 bg-white/[.03]"}`}><span><strong className="block font-display text-lg text-paper">{style.name}</strong><span className="mt-1 block text-xs leading-5 text-paper/45">{style.body}</span></span>{selected.includes(style.slug) ? <Check className="mt-1 h-4 w-4 shrink-0 text-lime" /> : <span className="mt-1 h-4 w-4 shrink-0 border border-white/25" />}</button>)}</div>{role === "business_owner" && <div className="mt-8 border-t border-white/10 pt-8"><Meta>Business studio</Meta><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><Meta>Business / public name</Meta><input value={form.businessName} onChange={(event) => patch("businessName", event.target.value)} placeholder="Studio name" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>Business type</Meta><input value={form.businessType} onChange={(event) => patch("businessType", event.target.value)} placeholder="Furniture, salon, venue…" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>Contact email</Meta><input type="email" value={form.businessEmail} onChange={(event) => patch("businessEmail", event.target.value)} placeholder="studio@example.com" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>Phone</Meta><input value={form.businessPhone} onChange={(event) => patch("businessPhone", event.target.value)} placeholder="+254…" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label className="sm:col-span-2"><Meta>What do you make or offer?</Meta><textarea value={form.businessDescription} onChange={(event) => patch("businessDescription", event.target.value)} rows={3} placeholder="A clear, honest point of view…" className="sura-focus mt-2 w-full resize-none border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label></div></div>}<div className="mt-8 flex justify-between"><Button variant="ghost" onClick={() => setStep(2)}>Back</Button><Button onClick={onFinish} disabled={busy}>{busy ? "Saving your signal…" : role === "business_owner" ? "Submit studio for review" : "Open my SURA space"}<ArrowRight className="h-4 w-4" /></Button></div></div>}</div></div></div>;
}

function CheckoutModal({ offer, form, setForm, busy, done, submit, onClose }: { offer: { business: Business; item: CatalogItem }; form: { county: string; phone: string }; setForm: (form: { county: string; phone: string }) => void; busy: boolean; done: { status: string; orderId?: string; message: string } | null; submit: (event: React.FormEvent) => void; onClose: () => void }) {
  return <div className="sura-modal-backdrop fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4"><div className="sura-modal w-full max-w-xl border border-white/15 bg-field p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><Meta>Order handoff / 01</Meta><h2 className="sura-display mt-4 text-5xl font-bold text-paper">Move it into the world.</h2></div><button onClick={onClose} className="sura-focus grid h-10 w-10 place-items-center border border-white/15 text-paper/70"><X className="h-4 w-4" /></button></div><div className="mt-8 flex gap-4 border-y border-white/10 py-5"><div className="grid h-16 w-16 shrink-0 place-items-center bg-lime text-ink"><PackageCheck className="h-6 w-6" /></div><div><p className="font-display text-xl font-bold text-paper">{offer.item.name}</p><p className="mt-1 text-xs text-paper/45">{offer.business.display_name} · {offer.business.city}</p><p className="mt-3 text-sm font-bold text-lime">{formatKes(offer.item.price_min_kes ?? offer.item.price_max_kes)}</p></div></div>{done ? <div className={`mt-6 border p-5 ${done.status === "error" ? "border-clay/40 bg-clay/10" : "border-lime/30 bg-lime/10"}`}><p className="font-meta text-[10px] uppercase tracking-[.14em] text-lime">{done.status === "error" ? "Needs attention" : "Order prepared"}</p><p className="mt-3 text-sm leading-6 text-paper/75">{done.message}</p>{done.orderId && <p className="mt-3 font-meta text-[10px] text-paper/45">Order {done.orderId}</p>}<button onClick={onClose} className="sura-focus mt-5 text-xs font-bold text-lime">Close handoff</button></div> : <form onSubmit={submit} className="mt-6 space-y-4"><label><Meta>Delivery county</Meta><input required value={form.county} onChange={(event) => setForm({ ...form, county: event.target.value })} className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><label><Meta>Phone for provider handoff</Meta><input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+254…" className="sura-focus mt-2 w-full border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-paper outline-none" /></label><div className="border border-white/10 bg-white/[.03] p-4 text-xs leading-5 text-paper/50"><CreditCard className="mb-2 h-4 w-4 text-lime" />SURA creates the order and payment-intent record here. A verified M-Pesa/provider callback is the only path that marks payment as paid and issues a receipt.</div><Button type="submit" disabled={busy} className="w-full">{busy ? "Preparing handoff…" : "Prepare order"}<ArrowRight className="h-4 w-4" /></Button></form>}</div></div>;
}

export default App;
