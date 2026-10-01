import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
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
  X,
} from "lucide-react";
import { apiRequest, loadMe, loadPublicNetwork, type Business, type CatalogItem, type MeBundle, type TaxonomyDomain, type TaxonomyNode } from "./lib/api";
import { getSupabase } from "./lib/supabase";

const LazyDiscoverView = lazy(() => import("./lazy-views").then((module) => ({ default: module.DiscoverView })));
const LazyDashboardView = lazy(() => import("./lazy-views").then((module) => ({ default: module.DashboardView })));
const LazyAuthModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.AuthModal })));
const LazyOnboardingModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.OnboardingModal })));
const LazyCheckoutModal = lazy(() => import("./lazy-views").then((module) => ({ default: module.CheckoutModal })));
const LazyBelowFoldHome = lazy(() => import("./lazy-views").then((module) => ({ default: module.BelowFoldHome })));

function warmLazyViews() {
  void import("./lazy-views");
}

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
function loadGsap() {
  gsapPromise ??= import("gsap").then((module) => module.default);
  return gsapPromise;
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
const RESPONSIVE_ASSETS = { hero: "sura-auth-hero", interior: "sura-auth-interior", street: "sura-auth-street" } as const;
type VisualAsset = keyof typeof RESPONSIVE_ASSETS;

type ResponsiveImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & { asset: VisualAsset };
function ResponsiveImage({ asset, sizes = "(max-width: 767px) 100vw, 50vw", ...props }: ResponsiveImageProps) {
  const base = RESPONSIVE_ASSETS[asset];
  return <picture><source type="image/webp" srcSet={`/assets/${base}-480.webp 480w, /assets/${base}-900.webp 900w`} sizes={sizes} /><img {...props} src={`/assets/${base}.jpg`} sizes={sizes} /></picture>;
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
  const [requestedRole, setRequestedRole] = useState<OnboardingRole | null>(() => {
    const pending = window.localStorage.getItem("sura.pendingRole");
    return pending === "creator" || pending === "business_owner" || pending === "member" ? pending : null;
  });
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
    if (!session || !requestedRole) return;
    window.localStorage.removeItem("sura.pendingRole");
    setRequestedRole(null);
    setOnboardingRole(requestedRole);
    setOnboardingStep(1);
    setOnboardingOpen(true);
  }, [session, requestedRole]);

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
  const openOnboarding = (role: OnboardingRole = "member") => {
    if (!session) {
      setRequestedRole(role);
      window.localStorage.setItem("sura.pendingRole", role);
      openAuth("signup");
      return;
    }
    setOnboardingRole(role); setOnboardingOpen(true); setOnboardingStep(1); setNotice(null);
  };
  const navigate = (nextView: View) => { setView(nextView); setMobileNav(false); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10); };
  const openPocket = () => {
    setMobileNav(false);
    setView("home");
    window.setTimeout(() => {
      window.dispatchEvent(new Event("sura:load-belowfold"));
      const started = Date.now();
      const seek = (behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") => {
        const target = document.getElementById("pockets");
        if (target) { const top = target.getBoundingClientRect().top + window.scrollY - 88; window.scrollTo({ top: Math.max(0, top), behavior }); if (Date.now() - started < 1500) window.setTimeout(() => seek("auto"), 220); return; }
        if (Date.now() - started < 1800) window.requestAnimationFrame(() => seek());
      };
      seek();
    }, 24);
  };
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
        setNotice({ tone: "good", text: requestedRole === "business_owner" ? "Confirmation email sent. After confirming, SURA will open business-owner onboarding." : "Confirmation email sent. Open it, then return to enter the signal." });
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
    <Header view={view} session={session} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openAuth={openAuth} openPocket={openPocket} openDashboard={() => session ? navigate("dashboard") : openAuth("signin")} />
    <div key={view} className="sura-view-shell">
      {view === "home" && <HomeView domainNames={domainNames} styleCards={styleCards} businesses={network.businesses} networkLoading={networkLoading} openAuth={openAuth} openOnboarding={openOnboarding} setSelectedOffer={setSelectedOffer} navigate={navigate} />}
      <Suspense fallback={null}>
        {view === "discover" && <LazyDiscoverView domains={domainNames} nodes={network.nodes} businesses={network.businesses} loading={networkLoading} setSelectedOffer={setSelectedOffer} openOnboarding={openOnboarding} />}
        {view === "dashboard" && <LazyDashboardView me={me} session={session} openOnboarding={openOnboarding} navigate={navigate} openAuth={openAuth} signOut={handleSignOut} />}
      </Suspense>
    </div>
    {notice && <NoticeBar notice={notice} onClose={() => setNotice(null)} />}
    <Suspense fallback={null}>
      {authOpen && <LazyAuthModal mode={authMode} setMode={setAuthMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} busy={authBusy} notice={notice} onSubmit={handleAuth} onClose={() => setAuthOpen(false)} onBusinessJoin={() => { setRequestedRole("business_owner"); window.localStorage.setItem("sura.pendingRole", "business_owner"); setAuthMode("signup"); setNotice(null); }} />}
      {onboardingOpen && <LazyOnboardingModal step={onboardingStep} setStep={setOnboardingStep} role={onboardingRole} setRole={setOnboardingRole} form={onboardingForm} setForm={setOnboardingForm} styles={styleCards} selected={selectedAesthetics} setSelected={setSelectedAesthetics} busy={onboardingBusy} onFinish={finishOnboarding} onClose={() => setOnboardingOpen(false)} />}
      {selectedOffer && <LazyCheckoutModal offer={selectedOffer} form={checkoutForm} setForm={setCheckoutForm} busy={checkoutBusy} done={checkoutDone} submit={submitOrder} onClose={() => { setSelectedOffer(null); setCheckoutDone(null); }} />}
    </Suspense>
    <MobileNav view={view} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openDashboard={() => session ? navigate("dashboard") : openAuth("signin")} />
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8 lg:px-14"><div className="mx-auto flex max-w-[1320px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><Logo compact /><p className="mt-4 max-w-sm text-sm leading-6 text-paper/50">Africa’s visual network for the things people see, wear, touch, arrange, drive, live with and carry.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-paper/55"><a href="#about" className="sura-focus hover:text-lime">About</a><button className="sura-focus hover:text-lime" onClick={openPocket}>Pocket ladder</button><a href="#signals" className="sura-focus hover:text-lime">Signals</a><button className="sura-focus hover:text-lime" onClick={() => openAuth("signin")}>Private space</button></div></div></footer>
  </div>;
}

function Header({ view, session, mobileNav, setMobileNav, navigate, openAuth, openPocket, openDashboard }: { view: View; session: Session | null; mobileNav: boolean; setMobileNav: (value: boolean) => void; navigate: (view: View) => void; openAuth: (mode?: AuthMode) => void; openPocket: () => void; openDashboard: () => void }) {
  return <header className="sura-site-header sticky top-0 z-30 border-b border-white/10 px-5 py-4 sm:px-8 lg:px-14"><div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-6"><Logo /><nav className={`sura-header-nav ${mobileNav ? "is-open" : ""} items-center gap-1`}><button onClick={() => navigate("home")} className={`sura-focus px-3 py-2 text-xs font-bold ${view === "home" ? "text-lime" : "text-paper/60 hover:text-paper"}`}>The signal</button><button onClick={() => navigate("discover")} className={`sura-focus px-3 py-2 text-xs font-bold ${view === "discover" ? "text-lime" : "text-paper/60 hover:text-paper"}`}>Explore</button><button onClick={openPocket} className="sura-focus px-3 py-2 text-xs font-bold text-paper/60 hover:text-paper">Your pocket</button></nav><div className="flex items-center gap-2"><Meta>NAI / KE</Meta>{session ? <button onClick={openDashboard} className="sura-focus hidden items-center gap-2 border border-white/15 px-3 py-2 text-xs font-bold text-paper sm:inline-flex"><CircleDot className="h-3 w-3 text-lime" /> My SURA</button> : <button onClick={() => openAuth("signin")} className="sura-focus hidden px-3 py-2 text-xs font-bold text-paper/70 hover:text-lime sm:inline-flex">Sign in</button>}<button onClick={() => session ? openDashboard() : openAuth("signup")} className="sura-focus sura-button sura-button-primary min-h-10 px-3 text-[10px]">{session ? "Open space" : "Enter signal"}</button><button onClick={() => setMobileNav(!mobileNav)} className="sura-focus grid h-10 w-10 place-items-center border border-white/15 sm:hidden" aria-label="Toggle navigation" aria-expanded={mobileNav}>{mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div></div></header>;
}

function MobileNav({ view, mobileNav, setMobileNav, navigate, openDashboard }: { view: View; mobileNav: boolean; setMobileNav: (value: boolean) => void; navigate: (view: View) => void; openDashboard: () => void }) {
  const items: Array<{ id: View; label: string; Icon: typeof CircleDot }> = [
    { id: "home", label: "Signal", Icon: CircleDot },
    { id: "discover", label: "Explore", Icon: Compass },
    { id: "dashboard", label: "Pocket", Icon: Palette },
  ];
  return <nav className="sura-mobile-nav" aria-label="Primary mobile navigation" onPointerDown={warmLazyViews}><div className="sura-mobile-nav__track">
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
  return <main ref={landingRef} className="sura-landing">
    <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:px-14 lg:pt-20"><div className="pointer-events-none absolute right-[-16rem] top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-lime/10 blur-[110px]" /><div className="pointer-events-none absolute bottom-[-10rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-clay/10 blur-[100px]" /><div className="relative mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-end"><div className="max-w-3xl"><div className="mb-7 flex items-center gap-3"><span className="h-px w-12 bg-lime" /><Meta>Africa / visual network / 001</Meta></div><h1 className="sura-display max-w-4xl text-[clamp(3.5rem,8vw,8rem)] font-bold text-paper">Make the <span className="text-lime">feeling</span> findable.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-paper/62 sm:text-xl">SURA connects people, businesses, objects, spaces and next steps across Africa to the way you want life to feel.</p><div className="mt-9 flex flex-wrap gap-3"><Button onClick={openOnboarding}>Start your direction <ArrowUpRight className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => navigate("discover")}>See the field <ArrowRight className="h-4 w-4" /></Button></div><div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-paper/45"><span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-lime" />Nairobi first, Africa wide</span><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-lime" />Budget without the shame</span></div></div><HeroVisual /></div><div className="relative mx-auto mt-16 grid max-w-[1320px] gap-4 border-y border-white/10 py-4 sm:grid-cols-4"><div className="sm:col-span-1"><Meta>See → shape → source</Meta></div><div className="sm:col-span-3 grid gap-3 text-sm text-paper/55 sm:grid-cols-3"><span>Choose a direction.</span><span>Meet a point of view.</span><span>Move when it feels right.</span></div></div></section>
    <DeferredHomeSections landingRef={landingRef} domainNames={domainNames} styleCards={styleCards} businesses={businesses} networkLoading={networkLoading} openAuth={openAuth} openOnboarding={openOnboarding} setSelectedOffer={setSelectedOffer} navigate={navigate} />
  </main>;
}

function DeferredHomeSections({ landingRef, domainNames, styleCards, businesses, networkLoading, openAuth, openOnboarding, setSelectedOffer, navigate }: { landingRef: React.RefObject<HTMLElement | null>; domainNames: string[]; styleCards: Array<{ slug: string; name: string; body: string; tone: string }>; businesses: Business[]; networkLoading: boolean; openAuth: (mode?: AuthMode) => void; openOnboarding: () => void; setSelectedOffer: (offer: { business: Business; item: CatalogItem }) => void; navigate: (view: View) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let started = false;
    const start = () => { if (started) return; started = true; setReady(true); };
    const timer = window.setTimeout(start, 8000);
    window.addEventListener("sura:load-belowfold", start);
    window.addEventListener("pointerdown", start, { passive: true });
    window.addEventListener("scroll", start, { passive: true, once: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("sura:load-belowfold", start); window.removeEventListener("pointerdown", start); window.removeEventListener("scroll", start); };
  }, []);
  if (!ready) return null;
  return <Suspense fallback={null}><LazyBelowFoldHome landingRef={landingRef} domainNames={domainNames} styleCards={styleCards} businesses={businesses} networkLoading={networkLoading} openAuth={openAuth} openOnboarding={openOnboarding} setSelectedOffer={setSelectedOffer} navigate={navigate} /></Suspense>;
}
function HeroVisual() {
  return <div className="sura-hero-visual relative min-h-[420px] lg:min-h-[520px]"><div className="sura-hero-pattern absolute inset-[-12%] z-0 opacity-75" aria-hidden="true"><svg className="sura-hero-pattern__svg h-full w-full" viewBox="0 0 640 520" fill="none"><path d="M0 80 80 0l80 80-80 80L0 80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 240l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80ZM0 400l80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Zm160 0 80-80 80 80-80 80-80-80Z" stroke="#CAFF32" strokeWidth="1.2" opacity=".24" /><path d="M0 0h640M0 160h640M0 320h640M0 480h640M80 0v520M240 0v520M400 0v520M560 0v520" stroke="#F3F0E7" strokeWidth="1" opacity=".12" /></svg></div><div className="sura-hero-card absolute left-[6%] top-[9%] z-10 w-[48%] rotate-[-5deg] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:left-[8%]"><ResponsiveImage asset="hero" alt="A street-level SURA visual signal" width="760" height="1000" loading="lazy" decoding="async" sizes="(max-width: 767px) 48vw, 24vw" className="sura-image aspect-[.76] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>01 / street</Meta><span className="h-2 w-2 rounded-full bg-lime" /></div></div><div className="sura-hero-card absolute right-[3%] top-0 w-[55%] overflow-hidden border border-white/20 bg-field p-2 shadow-2xl sm:right-[5%]"><ResponsiveImage asset="interior" alt="A warm interior material study" width="860" height="800" loading="lazy" decoding="async" sizes="(max-width: 767px) 55vw, 30vw" className="sura-image aspect-[1.08] w-full object-cover" /><div className="flex items-center justify-between px-1 py-3"><Meta>02 / interior</Meta><span className="text-[10px] text-paper/45">soft utility</span></div></div><div className="sura-hero-card absolute bottom-[3%] right-[9%] z-20 w-[43%] rotate-[4deg] overflow-hidden border border-lime/40 bg-lime p-2 text-ink shadow-2xl"><ResponsiveImage asset="street" alt="A moving street detail" width="760" height="660" loading="lazy" decoding="async" sizes="(max-width: 767px) 43vw, 24vw" className="sura-image aspect-[1.15] w-full object-cover grayscale-[.1]" /><div className="flex items-center justify-between px-1 py-3"><Meta dark>03 / movement</Meta><ArrowUpRight className="h-4 w-4" /></div></div><div className="sura-hero-card absolute bottom-[12%] left-0 z-30 hidden rotate-[-12deg] border border-white/20 bg-paper px-4 py-3 text-ink shadow-2xl sm:block"><span className="sura-meta text-[10px] font-bold">Make it yours.</span></div></div>;
}

function NoticeBar({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  if (!notice) return null;
  return <div className={`fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 border px-4 py-3 shadow-2xl backdrop-blur-xl ${notice.tone === "good" ? "border-lime/35 bg-field/95 text-paper" : "border-clay/50 bg-[#291914]/95 text-paper"}`} role="status"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.tone === "good" ? "bg-lime" : "bg-clay"}`} /><p className="flex-1 text-sm leading-5">{notice.text}</p><button onClick={onClose} className="sura-focus text-paper/50"><X className="h-4 w-4" /></button></div>;
}

export default App;
