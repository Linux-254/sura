import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
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
import { getSupabase } from "./lib/supabase";

const LazyDiscoverView = lazy(() => import("./lazy-views").then((module) => ({ default: module.DiscoverView })));
const LazyDashboardView = lazy(() => import("./lazy-views").then((module) => ({ default: module.DashboardView })));
const LazyAuthModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.AuthModal })));
const LazyOnboardingModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.OnboardingModal })));
const LazyCheckoutModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.CheckoutModal })));

type View = "home" | "discover" | "dashboard";
type AuthMode = "signin" | "signup";
type OnboardingRole = "member" | "creator" | "business_owner";
type BootPhase = "in" | "out" | "done";
type Notice = { tone: "good" | "bad"; text: string } | null;
type OnboardingForm = { displayName: string; handle: string; county: string; city: string; bio: string; businessName: string; businessType: string; businessDescription: string; businessEmail: string; businessPhone: string };
type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };

function getMotionProfile() {
  const browser = navigator as NavigatorHints;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const connection = browser.connection;
  const lowPower = mobile
    || browser.hardwareConcurrency <= 4
    || (typeof browser.deviceMemory === "number" && browser.deviceMemory <= 4)
    || connection?.saveData === true
    || connection?.effectiveType === "slow-2g"
    || connection?.effectiveType === "2g";
  return { reduced, lowPower };
}

type GsapInstance = typeof import("gsap")["default"];
let gsapPromise: Promise<GsapInstance> | null = null;
type ScrollTriggerInstance = typeof import("gsap/ScrollTrigger")["ScrollTrigger"];
let scrollMotionPromise: Promise<{ gsap: GsapInstance; ScrollTrigger: ScrollTriggerInstance }> | null = null;

function loadGsap() {
  gsapPromise ??= import("gsap").then((module) => module.default);
  return gsapPromise;
}

function loadScrollMotion() {
  scrollMotionPromise ??= Promise.all([loadGsap(), import("gsap/ScrollTrigger")]).then(([gsap, module]) => ({ gsap, ScrollTrigger: module.ScrollTrigger }));
  return scrollMotionPromise;
}

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
const FIELD_STAGES = [
  { label: "Wear / personal style", body: "Fit, repeat-wear, detail and the point of view you carry outside.", tone: "lime" },
  { label: "Space / interiors", body: "Material, light, arrangement and the rooms that hold your everyday.", tone: "paper" },
  { label: "Make / craft", body: "Objects with a hand in them, from useful to quietly ceremonial.", tone: "clay" },
  { label: "Beauty / body art", body: "Consent-led rituals, grooming and expression without body judgement.", tone: "mineral" },
  { label: "Culture / creative life", body: "Music, image, gathering and the signals that become a scene.", tone: "lime" },
];
const STACKED_VISUALS = [
  { asset: "hero", kicker: "01 / street signal", title: "A point of view has a place." },
  { asset: "interior", kicker: "02 / room study", title: "Make the room answer back." },
  { asset: "street", kicker: "03 / movement", title: "Let the everyday carry some voltage." },
  { asset: "hero", kicker: "04 / the edit", title: "See it. Shape it. Source it." },
] as const;
const RESPONSIVE_ASSETS = { hero: "sura-auth-hero", interior: "sura-auth-interior", street: "sura-auth-street" } as const;
type VisualAsset = keyof typeof RESPONSIVE_ASSETS;

type ResponsiveImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & { asset: VisualAsset };
function ResponsiveImage({ asset, sizes = "(max-width: 767px) 100vw, 50vw", ...props }: ResponsiveImageProps) {
  const base = RESPONSIVE_ASSETS[asset];
  return <picture><source type="image/webp" srcSet={`/assets/${base}-480.webp 480w, /assets/${base}-900.webp 900w`} sizes={sizes} /><img {...props} src={`/assets/${base}.jpg`} sizes={sizes} /></picture>;
}

function formatKes(amount: number | null | undefined) {
  return `KES ${(amount ?? 0).toLocaleString("en-KE")}`;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <a href="#top" className="sura-focus inline-flex items-center gap-3" aria-label="SURA home"><img src="/sura-mark-signal.svg?v=3" alt="" className={`sura-logo-mark ${compact ? "h-8 w-8" : "h-9 w-9"}`} /><span className="font-display text-xl font-bold tracking-[-.08em] text-paper">SURA</span></a>;
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
    const profile = getMotionProfile();
    if (!root || profile.reduced || profile.lowPower) return;
    let cancelled = false;
    let revert = () => {};
    void loadGsap().then((gsap) => {
      if (cancelled) return;
      const context = gsap.context(() => {
        gsap.from(".sura-loading-pattern__line", { opacity: 0, scale: 0.72, transformOrigin: "50% 50%", stagger: 0.05, duration: 1.05, ease: "power3.out" });
        gsap.from(".sura-loading-orbit", { scale: 0.55, opacity: 0, duration: 1.1, ease: "back.out(1.5)" });
        gsap.from(".sura-loading-mark", { scale: 0.55, rotate: -8, opacity: 0, duration: 0.85, ease: "back.out(1.7)" });
        gsap.from(".sura-loading-wordmark, .sura-loading-kicker, .sura-loading-caption", { y: 12, opacity: 0, stagger: 0.08, duration: 0.55, delay: 0.18, ease: "power3.out" });
      }, root);
      revert = () => context.revert();
    });
    return () => { cancelled = true; revert(); };
  }, []);

  return <div ref={loadingRef} className={`sura-loading-screen ${phase === "out" ? "is-exiting" : ""}`} role="status" aria-label="Opening SURA">
    <div className="sura-loading-pattern" aria-hidden="true"><svg className="sura-loading-pattern__svg" viewBox="0 0 640 640" fill="none"><path className="sura-loading-pattern__line" d="M0 80 80 0l80 80-80 80L0 80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 240l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 400l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 560l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Z" /><path className="sura-loading-pattern__line" d="M80 0v640M240 0v640M400 0v640M560 0v640" /><path className="sura-loading-pattern__line" d="M0 160h640M0 320h640M0 480h640" /></svg></div>
    <div className="sura-loading-orbit" aria-hidden="true" />
    <div className="sura-loading-lockup"><img className="sura-loading-mark" src="/sura-mark-signal.svg?v=3" alt="" /><span className="sura-loading-wordmark font-display">SURA</span><span className="sura-loading-kicker sura-meta">Nairobi / Kenya</span></div>
    <span className="sura-loading-caption sura-meta">Make the feeling findable</span>
  </div>;
}

function App() {
  const initialMotion = getMotionProfile();
  const shellRef = useRef<HTMLDivElement>(null);
  const [bootPhase, setBootPhase] = useState<BootPhase>(() => initialMotion.lowPower ? "done" : "in");
  const [lowPower, setLowPower] = useState(() => initialMotion.lowPower);
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
    setLowPower(getMotionProfile().lowPower);
  }, []);

  useEffect(() => {
    const { reduced } = getMotionProfile();
    if (lowPower) { setBootPhase("done"); return; }
    const exitDelay = reduced ? 120 : lowPower ? 180 : 900;
    const doneDelay = reduced ? 260 : lowPower ? 360 : 1350;
    const exitTimer = window.setTimeout(() => setBootPhase("out"), exitDelay);
    const doneTimer = window.setTimeout(() => setBootPhase("done"), doneDelay);
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(doneTimer); };
  }, [lowPower]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      void getSupabase().then((client) => {
        if (!client || cancelled) return;
        void client.auth.getSession().then(({ data }) => { if (!cancelled) setSession(data.session); });
        const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
          if (!cancelled) setSession(nextSession);
        });
        unsubscribe = () => listener.subscription.unsubscribe();
      });
    };
    const timer = window.setTimeout(start, 8000);
    window.addEventListener("pointerdown", start, { passive: true });
    window.addEventListener("scroll", start, { passive: true, once: true });
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener("pointerdown", start); window.removeEventListener("scroll", start); unsubscribe(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    const load = () => {
      void loadPublicNetwork().then((nextNetwork) => { if (!cancelled) setNetwork(nextNetwork); }).catch((error: unknown) => {
        if (!cancelled) setNotice({ tone: "bad", text: error instanceof Error ? error.message : "The public signal is still warming up." });
      }).finally(() => { if (!cancelled) setNetworkLoading(false); });
    };
    const start = () => { if (started || cancelled) return; started = true; load(); };
    const timer = window.setTimeout(start, 8000);
    window.addEventListener("pointerdown", start, { passive: true });
    window.addEventListener("scroll", start, { passive: true, once: true });
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener("pointerdown", start); window.removeEventListener("scroll", start); };
  }, []);

  useEffect(() => {
    if (!session) { setMe(null); return; }
    void loadMe().then(setMe).catch(() => setMe(null));
  }, [session]);

  useEffect(() => {
    const root = shellRef.current;
    const profile = getMotionProfile();
    if (!root || profile.reduced || profile.lowPower) return;
    let cancelled = false;
    let revert = () => {};
    void loadGsap().then((gsap) => {
      if (cancelled) return;
      gsap.ticker.lagSmoothing(1000, 33);
      const context = gsap.context(() => {
        gsap.from(".sura-site-header", { y: -16, duration: 0.7, ease: "power3.out", clearProps: "transform" });
        gsap.from(".sura-mobile-nav", { y: 28, scale: 0.96, duration: 0.75, delay: 0.18, ease: "back.out(1.4)", clearProps: "transform" });
      }, root);
      revert = () => context.revert();
    });
    return () => { cancelled = true; revert(); };
  }, []);

  const domainNames = network.domains.length ? network.domains.map((domain) => domain.name) : FALLBACK_DOMAINS;
  const styles = network.nodes.filter((node) => node.node_type === "style" || node.node_type === "category").slice(0, 12);
  const styleCards = styles.length ? styles.map((node, index) => ({ slug: node.slug, name: node.name, body: node.kenya_relevance ?? "A direction with room for your own interpretation.", tone: ["lime", "clay", "mineral", "paper"][index % 4] })) : FALLBACK_STYLES;

  const openAuth = (mode: AuthMode = "signup") => { setAuthMode(mode); setNotice(null); setAuthOpen(true); };
  const openOnboarding = () => { if (!session) { openAuth("signup"); return; } setOnboardingOpen(true); setOnboardingStep(1); setNotice(null); };
  const navigate = (nextView: View) => { setView(nextView); setMobileNav(false); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10); };
  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    const client = await getSupabase();
    if (!client) { setNotice({ tone: "bad", text: "Add the new SURA Supabase URL and publishable key to this deployment first." }); return; }
    if (authPassword.length < 8) { setNotice({ tone: "bad", text: "Use at least 8 characters for your password." }); return; }
    setAuthBusy(true); setNotice(null);
    try {
      const response = authMode === "signup"
        ? await client.auth.signUp({ email: authEmail.trim().toLowerCase(), password: authPassword, options: { emailRedirectTo: `${window.location.origin}/` } })
        : await client.auth.signInWithPassword({ email: authEmail.trim().toLowerCase(), password: authPassword });
      if (response.error) throw response.error;
      if (authMode === "signup" && !response.data.session) {
        setNotice({ tone: "good", text: "Confirmation email sent. Open it, then return to enter the signal." });
      } else {
        setAuthOpen(false); setView("dashboard"); setNotice({ tone: "good", text: "Your private SURA space is open." });
      }
    } catch (error) { setNotice({ tone: "bad", text: error instanceof Error ? error.message : "That sign-in did not complete." }); }
    finally { setAuthBusy(false); }
  };
  const handleSignOut = async () => { const client = await getSupabase(); await client?.auth.signOut(); setView("home"); setNotice({ tone: "good", text: "You are signed out." }); };
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

  return <div ref={shellRef} id="top" className={`sura-shell ${lowPower ? "sura-low-power" : ""}`}>
    {bootPhase !== "done" && <LoadingScreen phase={bootPhase} />}
    <Header view={view} session={session} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openAuth={openAuth} openDashboard={() => session ? navigate("dashboard") : openAuth("signin")} />
    <div key={view} className="sura-view-shell">
      {view === "home" && <HomeView domainNames={domainNames} styleCards={styleCards} businesses={network.businesses} networkLoading={networkLoading} openAuth={openAuth} openOnboarding={openOnboarding} setSelectedOffer={setSelectedOffer} navigate={navigate} />}
      <Suspense fallback={null}>
        {view === "discover" && <LazyDiscoverView domains={domainNames} nodes={network.nodes} businesses={network.businesses} loading={networkLoading} setSelectedOffer={setSelectedOffer} openOnboarding={openOnboarding} />}
        {view === "dashboard" && <LazyDashboardView me={me} session={session} openOnboarding={openOnboarding} navigate={navigate} openAuth={openAuth} signOut={handleSignOut} />}
      </Suspense>
    </div>
    {notice && <NoticeBar notice={notice} onClose={() => setNotice(null)} />}
    <Suspense fallback={null}>
      {authOpen && <LazyAuthModal mode={authMode} setMode={setAuthMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} busy={authBusy} notice={notice} onSubmit={handleAuth} onClose={() => setAuthOpen(false)} />}
      {onboardingOpen && <LazyOnboardingModal step={onboardingStep} setStep={setOnboardingStep} role={onboardingRole} setRole={setOnboardingRole} form={onboardingForm} setForm={setOnboardingForm} styles={styleCards} selected={selectedAesthetics} setSelected={setSelectedAesthetics} busy={onboardingBusy} onFinish={finishOnboarding} onClose={() => setOnboardingOpen(false)} />}
      {selectedOffer && <LazyCheckoutModal offer={selectedOffer} form={checkoutForm} setForm={setCheckoutForm} busy={checkoutBusy} done={checkoutDone} submit={submitOrder} onClose={() => { setSelectedOffer(null); setCheckoutDone(null); }} />}
    </Suspense>
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
  const landingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = landingRef.current;
    const profile = getMotionProfile();
    if (!root || profile.reduced || profile.lowPower || !window.matchMedia("(min-width: 768px)").matches) return;
    let cancelled = false;
    let revert = () => {};
    void loadScrollMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        const horizontal = root.querySelector<HTMLElement>(".sura-horizontal-section");
        const track = root.querySelector<HTMLElement>(".sura-horizontal-track");
        if (horizontal && track) {
          const distance = () => Math.max(0, track.scrollWidth - horizontal.clientWidth + 24);
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: horizontal,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.5}`,
              pin: true,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        gsap.to(".sura-hero-pattern__svg", {
          y: 120,
          rotate: 12,
          ease: "none",
          scrollTrigger: { trigger: ".sura-hero-visual", start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
        gsap.to(".sura-hero-card", {
          y: (index) => (index % 2 ? -28 : 22),
          rotate: (index) => (index % 2 ? -2 : 1.5),
          ease: "none",
          stagger: 0.06,
          scrollTrigger: { trigger: ".sura-hero-visual", start: "top bottom", end: "bottom top", scrub: 1.1 },
        });

        gsap.utils.toArray<HTMLElement>(".sura-stack-card").forEach((card, index) => {
          gsap.fromTo(card, { y: index === 0 ? 0 : 92 + index * 18, rotate: index % 2 ? 2.8 : -2.8 }, {
            y: 0,
            rotate: index % 2 ? -1.1 : 1.1,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom-=8%", end: "top 26%", scrub: 0.8 },
          });
        });
        window.setTimeout(() => ScrollTrigger.refresh(), 160);
      }, root);
      revert = () => context.revert();
    });
    return () => { cancelled = true; revert(); };
  }, []);

  return <main ref={landingRef} className="sura-landing">
    <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:px-14 lg:pt-20"><div className="pointer-events-none absolute right-[-16rem] top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-lime/10 blur-[110px]" /><div className="pointer-events-none absolute bottom-[-10rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-clay/10 blur-[100px]" /><div className="relative mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-end"><div className="max-w-3xl"><div className="mb-7 flex items-center gap-3"><span className="h-px w-12 bg-lime" /><Meta>Visual network / 001</Meta></div><h1 className="sura-display max-w-4xl text-[clamp(3.5rem,8vw,8rem)] font-bold text-paper">Make the <span className="text-lime">feeling</span> findable.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-paper/62 sm:text-xl">SURA connects the way you want life to feel with the people, businesses, objects, spaces and next steps that can make it real.</p><div className="mt-9 flex flex-wrap gap-3"><Button onClick={openOnboarding}>Start your direction <ArrowUpRight className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => navigate("discover")}>See the field <ArrowRight className="h-4 w-4" /></Button></div><div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-paper/45"><span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-lime" />Nairobi first, Kenya wide</span><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-lime" />Budget without the shame</span></div></div><HeroVisual /></div><div className="relative mx-auto mt-16 grid max-w-[1320px] gap-4 border-y border-white/10 py-4 sm:grid-cols-4"><div className="sm:col-span-1"><Meta>See → shape → source</Meta></div><div className="sm:col-span-3 grid gap-3 text-sm text-paper/55 sm:grid-cols-3"><span>Choose a direction.</span><span>Meet a point of view.</span><span>Move when it feels right.</span></div></div></section>
    <section id="about" className="sura-paper px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><Meta dark>What SURA sees</Meta><h2 className="sura-display mt-5 text-5xl font-bold sm:text-6xl">Aesthetics are a network.</h2></div><div className="grid gap-10 sm:grid-cols-2"><p className="text-lg leading-8 text-ink/65">Not just fashion. The room, the ride, the table, the salon, the studio, the object, the pet, the place and the small ritual that keeps showing up.</p><div><div className="mb-4 flex items-center gap-2"><Layers3 className="h-4 w-4 text-ink/50" /><Meta dark>Eight fields to start</Meta></div><div className="flex flex-wrap gap-2">{domainNames.slice(0, 8).map((domain) => <span key={domain} className="border border-ink/15 px-3 py-2 text-xs font-bold">{domain}</span>)}</div></div></div></div></section>
    <HorizontalField />
    <StackingGallery />
    <section id="pockets" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Meta>Your pocket is a design input</Meta><h2 className="sura-display mt-4 max-w-2xl text-5xl font-bold sm:text-6xl">Taste, with a route to reality.</h2></div><p className="max-w-sm text-sm leading-6 text-paper/50">SURA never turns price into a ranking. It uses it to make the next step honest.</p></div><div className="mt-10 grid border-y border-white/10 sm:grid-cols-2 lg:grid-cols-4">{POCKETS.map((pocket, index) => <article key={pocket.label} className="border-b border-white/10 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"><div className="mb-12 flex items-center justify-between"><span className="h-3 w-3 rounded-full" style={{ background: pocket.color }} /><Meta>{String(index + 1).padStart(2, "0")}</Meta></div><h3 className="font-display text-2xl font-bold">{pocket.label}</h3><p className="mt-2 text-xs font-bold text-lime">{pocket.range}</p><p className="mt-5 text-sm leading-6 text-paper/50">{pocket.body}</p></article>)}</div></div></section>
    <section id="signals" className="sura-paper px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Meta dark>Current directions</Meta><h2 className="sura-display mt-4 text-5xl font-bold sm:text-6xl">Find your mix.</h2></div><button onClick={() => navigate("discover")} className="sura-focus inline-flex items-center gap-2 self-start text-xs font-bold text-ink/60 hover:text-ink sm:self-auto">Open the whole taxonomy <ArrowUpRight className="h-4 w-4" /></button></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{styleCards.slice(0, 6).map((style, index) => <article key={style.slug} className={`group relative min-h-[260px] overflow-hidden p-5 ${index === 0 ? "bg-ink text-paper" : index === 1 ? "bg-clay text-ink" : index === 2 ? "bg-mineral text-ink" : "bg-soft-paper text-ink"}`}><div className="flex items-start justify-between"><span className="font-display text-3xl font-bold">{String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-5 w-5 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><div className="absolute inset-x-5 bottom-5"><h3 className="font-display text-3xl font-bold tracking-[-.06em]">{style.name}</h3><p className="mt-2 max-w-xs text-sm opacity-70">{style.body}</p></div></article>)}</div></div></section>
    <BusinessSignals businesses={businesses} loading={networkLoading} setSelectedOffer={setSelectedOffer} openAuth={openAuth} />
    <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-14"><div className="sura-grid mx-auto grid max-w-[1320px] gap-10 border border-white/12 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:p-14"><div><Meta>Build with the network</Meta><h2 className="sura-display mt-5 max-w-3xl text-5xl font-bold text-paper sm:text-7xl">The moodboard is only the beginning.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-paper/58">Save a direction. Brief a business. Keep the budget visible. Let payment and receipts have a proper handoff when it is time to move.</p></div><div className="flex flex-col justify-end gap-3 lg:items-end"><Button onClick={openOnboarding}>Create your SURA space <ArrowRight className="h-4 w-4" /></Button><p className="max-w-xs text-right text-xs leading-5 text-paper/40">Supabase Auth, role-based access and RLS-backed records keep the private layer private.</p></div></div></section>
  </main>;
}

function HeroVisual() {
  return <div className="sura-hero-visual relative min-h-[420px] lg:min-h-[520px]"><div className="sura-hero-pattern absolute inset-[-12%] z-0 opacity-75" aria-hidden="true"><svg className="sura-hero-pattern__svg h-full w-full" viewBox="0 0 640 520" fill="none"><path d="M0 80 80 0l80 80-80 80L0 80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 240l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 400l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Z" stroke="#CAFF32" strokeWidth="1.2" opacity=".24" /><path d="M0 0h640M0 160h640M0 320h640M0 480h640M80 0v520M240 0v520M400 0v520M560 0v520" stroke="#F3F0E7" strokeWidth="1" opacity=".12" /></svg></div><div className="sura-hero-card absolute left-[6%] top-[9%] z-10 w-[48%] rotate-[-5deg] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:left-[8%]"><ResponsiveImage asset="hero" alt="A street-level SURA visual signal" width="760" height="1000" loading="lazy" decoding="async" sizes="(max-width: 767px) 48vw, 24vw" className="sura-image aspect-[.76] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>01 / street</Meta><span className="h-2 w-2 rounded-full bg-lime" /></div></div><div className="sura-hero-card absolute right-[3%] top-0 w-[55%] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:right-[5%]"><ResponsiveImage asset="interior" alt="A warm interior material study" width="860" height="800" loading="lazy" decoding="async" sizes="(max-width: 767px) 55vw, 30vw" className="sura-image aspect-[1.08] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>02 / interior</Meta><span className="text-[10px] text-paper/45">soft utility</span></div></div><div className="sura-hero-card absolute bottom-[3%] right-[9%] z-20 w-[43%] rotate-[4deg] overflow-hidden border border-lime/40 bg-lime p-2 text-ink shadow-2xl"><ResponsiveImage asset="street" alt="A moving street detail" width="760" height="660" loading="lazy" decoding="async" sizes="(max-width: 767px) 43vw, 24vw" className="sura-image aspect-[1.15] w-full object-cover grayscale-[.1]" /><div className="flex items-center justify-between px-1 py-3"><Meta dark>03 / movement</Meta><ArrowUpRight className="h-4 w-4" /></div></div><div className="sura-hero-card absolute bottom-[12%] left-0 z-30 hidden rotate-[-12deg] border border-white/20 bg-paper px-4 py-3 text-ink shadow-2xl sm:block"><span className="sura-meta text-[10px] font-bold">Make it yours.</span></div></div>;
}

function HorizontalField() {
  return <section className="sura-horizontal-section sura-pattern-surface overflow-hidden" aria-labelledby="field-title"><div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><Meta>Scroll the field / 002</Meta><h2 id="field-title" className="sura-display mt-5 text-5xl font-bold text-paper sm:text-7xl">Five doors.<br /><span className="text-lime">Infinite mixes.</span></h2></div><div className="max-w-sm"><p className="text-sm leading-6 text-paper/55">On desktop, vertical scroll becomes a horizontal walk through the network. On touch screens, the same field becomes a native swipe rail.</p><div className="sura-scroll-cue mt-5"><span className="sura-scroll-cue__line" /> scroll / drag →</div></div></div></div><div className="sura-horizontal-viewport"><div className="sura-horizontal-track">{FIELD_STAGES.map((stage, index) => <article key={stage.label} className={`sura-horizontal-panel sura-tone-${stage.tone}`}><div className="flex items-start justify-between"><span className="sura-pattern-glyph" aria-hidden="true"><span /><span /><span /></span><Meta dark>{String(index + 1).padStart(2, "0")} / 05</Meta></div><div className="mt-auto"><p className="sura-meta text-[10px] opacity-60">Aesthetic field</p><h3 className="mt-4 max-w-[15ch] font-display text-4xl font-bold leading-[.92] tracking-[-.07em]">{stage.label}</h3><p className="mt-5 max-w-xs text-sm leading-6 opacity-70">{stage.body}</p></div><span className="sura-panel-index" aria-hidden="true">0{index + 1}</span></article>)}</div></div><div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 pb-8 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-paper/35 sm:px-8 lg:px-14"><span>Scroll to compose your mix</span><span>01 — 05</span></div><div className="sura-marquee" aria-hidden="true"><div className="sura-marquee__track"><span>MAKE THE FEELING FINDABLE</span><i>◆</i><span>NAIROBI / KENYA</span><i>◆</i><span>SEE → SHAPE → SOURCE</span><i>◆</i><span>MAKE THE FEELING FINDABLE</span><i>◆</i><span>NAIROBI / KENYA</span><i>◆</i><span>SEE → SHAPE → SOURCE</span><i>◆</i></div></div></section>;
}

function StackingGallery() {
  return <section className="sura-stack-section sura-paper px-5 py-16 sm:px-8 sm:py-24 lg:px-14" aria-labelledby="stack-title"><div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20"><div className="sura-stack-intro lg:sticky lg:top-32 lg:h-fit"><Meta dark>Signal studies / 003</Meta><h2 id="stack-title" className="sura-display mt-5 max-w-xl text-5xl font-bold sm:text-7xl">A moodboard that <span className="text-clay">moves.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-ink/60">The feeling is not flat. Scroll through the layers until one starts to feel like yours.</p><div className="sura-stack-rule mt-10"><span /> <span /> <span /></div></div><div className="sura-stack-stage">{STACKED_VISUALS.map((visual, index) => <figure key={`${visual.kicker}-${index}`} className="sura-stack-card" style={{ "--stack-index": index } as React.CSSProperties}><div className="sura-stack-card__image"><ResponsiveImage asset={visual.asset} alt={visual.title} width="960" height="720" loading={index === 0 ? "eager" : "lazy"} decoding="async" sizes="(max-width: 767px) 100vw, 62vw" /></div><figcaption className="flex items-end justify-between gap-5 p-5 sm:p-7"><div><span className="sura-meta text-[10px] text-ink/45">{visual.kicker}</span><h3 className="mt-3 max-w-sm font-display text-3xl font-bold leading-none tracking-[-.06em] sm:text-5xl">{visual.title}</h3></div><span className="sura-meta hidden text-[10px] text-ink/45 sm:block">SURA / field note</span></figcaption></figure>)}</div></div></section>;
}

function BusinessCard({ business, setSelectedOffer }: { business: Business; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void }) {
  const offer = business.catalog?.[0];
  return <article className="sura-card group overflow-hidden"><div className="relative aspect-[1.3] overflow-hidden bg-field"><ResponsiveImage asset={(["hero", "interior", "street"] as const)[business.display_name.length % 3]} alt="" width="900" height="1200" loading="lazy" decoding="async" sizes="(max-width: 767px) 100vw, 33vw" className="sura-image h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" /><div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-lime"><BadgeCheck className="h-3 w-3" /> Verified</div><h3 className="font-display text-2xl font-bold text-paper">{business.display_name}</h3></div><ArrowUpRight className="h-5 w-5 text-paper/70" /></div></div><div className="p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-paper/70">{business.business_type}</p><span className="flex items-center gap-1 text-[10px] font-bold text-paper/45"><MapPin className="h-3 w-3" />{business.city ?? business.county ?? "Kenya"}</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-paper/50">{business.description || "A verified local point of view, ready to be explored."}</p>{offer && <button onClick={() => setSelectedOffer({ business, item: offer })} className="sura-focus mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-left text-xs font-bold text-lime">{offer.name} <span>{formatKes(offer.price_min_kes)} <ArrowRight className="ml-1 inline h-3 w-3" /></span></button>}</div></article>;
}


function BusinessSignals({ businesses, loading, setSelectedOffer, openAuth }: { businesses: Business[]; loading: boolean; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void; openAuth: (mode?: AuthMode) => void }) {
  return <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-14"><div className="mx-auto max-w-[1320px]"><div className="flex items-center justify-between gap-4"><div><Meta>Verified business signal</Meta><h2 className="sura-display mt-4 text-5xl font-bold sm:text-6xl">The people behind the feeling.</h2></div><Store className="hidden h-10 w-10 text-lime sm:block" /></div>{loading ? <div className="sura-business-surface mt-10 border border-white/10 p-6"><div className="h-3 w-28 animate-pulse bg-white/10" /><div className="mt-7 h-9 max-w-sm animate-pulse bg-white/10" /><div className="mt-5 h-16 max-w-xl animate-pulse bg-white/5" /><div className="mt-8 h-10 max-w-xs animate-pulse bg-white/5" /></div> : businesses.length ? <div className="sura-business-surface mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{businesses.slice(0, 6).map((business) => <BusinessCard key={business.id} business={business} setSelectedOffer={setSelectedOffer} />)}</div> : <div className="sura-business-surface mt-10 grid gap-4 border border-dashed border-white/20 p-6 sm:grid-cols-[1.2fr_.8fr] sm:p-10"><div><BadgeCheck className="h-8 w-8 text-lime" /><h3 className="sura-display mt-7 text-4xl font-bold">The field is opening.</h3><p className="mt-4 max-w-lg text-sm leading-6 text-paper/55">Verified studios and catalogues will appear here as they are approved. If you are a maker, stylist, shop, venue or creative business, your point of view can be one of the first signals in the room.</p></div><div className="flex flex-col justify-end gap-3 border-t border-white/10 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"><Meta>For businesses</Meta><button onClick={() => openAuth("signup")} className="sura-focus flex items-center justify-between border-b border-white/20 py-4 text-left text-sm font-bold hover:border-lime">Put your point of view to work <ArrowRight className="h-4 w-4 text-lime" /></button></div></div>}</div></section>;
}

function NoticeBar({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  if (!notice) return null;
  return <div className={`fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 border px-4 py-3 shadow-2xl backdrop-blur-xl ${notice.tone === "good" ? "border-lime/35 bg-field/95 text-paper" : "border-clay/50 bg-[#291914]/95 text-paper"}`} role="status"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.tone === "good" ? "bg-lime" : "bg-clay"}`} /><p className="flex-1 text-sm leading-5">{notice.text}</p><button onClick={onClose} className="sura-focus text-paper/50"><X className="h-4 w-4" /></button></div>;
}

export default App;
