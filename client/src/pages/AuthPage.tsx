import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const fallbackFrames = [
  { image: "/assets/stitch/join-architecture.jpg", label: "A point of view", meta: "Sura · local signal" },
  { image: "/assets/stitch/landing-street.jpg", label: "A way forward", meta: "Local edit · in motion" },
  { image: "/assets/stitch/showroom-concrete.jpg", label: "A place to make", meta: "Studio · considered" },
];

type AuthMode = "signin" | "signup";
type FlowStatus = "idle" | "submitting" | "sent" | "exchanging" | "error";
type Notice = { kind: "success" | "error"; text: string } | null;

const AUTH_REQUEST_TIMEOUT_MS = 15000;
const SESSION_CHECK_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = AUTH_REQUEST_TIMEOUT_MS) {
  let timeoutId: number | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  });
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export default function AuthPage() {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const visualSet = trpc.public.authVisuals.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { mutateAsync: exchangeSupabaseSession, isPending: exchangeIsPending } = trpc.auth.exchangeSupabaseSession.useMutation();
  const frames = useMemo(() => {
    const activeSet = visualSet.data;
    return activeSet?.imageUrls?.length
      ? activeSet.imageUrls.map((image, index) => ({
          image,
          label: `Sura visual ${index + 1}`,
          meta: activeSet.title,
        }))
      : fallbackFrames;
  }, [visualSet.data]);
  const [activeFrame, setActiveFrame] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState<"request" | "update" | null>(null);
  const [flowStatus, setFlowStatus] = useState<FlowStatus>("idle");
  const [notice, setNotice] = useState<Notice>(null);
  const [sessionStatus, setSessionStatus] = useState<"checking" | "ready" | "exchanging" | "error">("checking");
  const exchangeTokenRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const isCreateAccount = authMode === "signup";
  const hasSupabaseConfig = isSupabaseConfigured && Boolean(supabase);
  const hasOAuthConfig = Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setActiveFrame(0);
    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % frames.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [frames.length]);

  const exchangeSession = useCallback(async (session: Session | null) => {
    const accessToken = session?.access_token?.trim();
    if (!accessToken || !mountedRef.current) return;
    if (exchangeTokenRef.current === accessToken) return;

    exchangeTokenRef.current = accessToken;
    setSessionStatus("exchanging");
    setFlowStatus("exchanging");
    setNotice(null);

    try {
      const result = await withTimeout(
        exchangeSupabaseSession({ accessToken }),
        "Sura could not finish the secure session check. Please try again.",
      );
      if (!mountedRef.current) return;

      utils.auth.me.setData(undefined, result.user);
      window.history.replaceState({}, document.title, "/join");
      setSessionStatus("ready");
      setFlowStatus("idle");
      setNotice({ kind: "success", text: "Your private Sura space is ready. Opening it now…" });
      window.setTimeout(() => {
        if (mountedRef.current) setLocation("/");
      }, 40);
    } catch (error) {
      exchangeTokenRef.current = null;
      if (!mountedRef.current) return;
      setSessionStatus("error");
      setFlowStatus("error");
      setNotice({
        kind: "error",
        text: errorMessage(error, "Sura could not open your private session. Check the deployment settings and try again."),
      });
    }
  }, [exchangeSupabaseSession, setLocation, utils]);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setSessionStatus("ready");
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setSessionStatus((current) => current === "checking" ? "ready" : current);
    }, SESSION_CHECK_TIMEOUT_MS);

    const scheduleExchange = (session: Session | null) => {
      if (!session?.access_token) return;
      // Supabase invokes auth listeners under an internal lock. Deferring the
      // exchange prevents a callback-time deadlock that looks like a frozen UI.
      window.setTimeout(() => {
        if (!cancelled) void exchangeSession(session);
      }, 0);
    };

    const readSession = async () => {
      try {
        const response = await withTimeout(
          client.auth.getSession(),
          "Sura’s session check took too long. You can still try again below.",
          SESSION_CHECK_TIMEOUT_MS,
        );
        if (cancelled) return;
        if (response.error) throw response.error;
        if (response.data.session) {
          const recoveryCallback = new URLSearchParams(window.location.search).get("type") === "recovery" || window.location.hash.includes("type=recovery");
          if (recoveryCallback) {
            setResetMode("update");
            setSessionStatus("ready");
            setFlowStatus("idle");
            setNotice({ kind: "success", text: "Choose a new password for your Sura account." });
          } else {
            scheduleExchange(response.data.session);
          }
        } else {
          setSessionStatus("ready");
          const callbackError = new URLSearchParams(window.location.search).get("error_description");
          if (callbackError) setNotice({ kind: "error", text: callbackError });
        }
      } catch (error) {
        if (!cancelled) {
          setSessionStatus("ready");
          setNotice({ kind: "error", text: errorMessage(error, "Sura could not read this session. Try signing in again.") });
        }
      }
    };

    void readSession();
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setResetMode("update");
        setSessionStatus("ready");
        setFlowStatus("idle");
        setNotice({ kind: "success", text: "Choose a new password for your Sura account." });
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        scheduleExchange(session);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, [exchangeSession]);

  const setMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setPassword("");
    setConfirmPassword("");
    setResetMode(null);
    setFlowStatus("idle");
    setNotice(null);
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!supabase) {
      if (!startLogin()) {
        setNotice({ kind: "error", text: "Email authentication is not configured on this deployment yet." });
      }
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setNotice({ kind: "error", text: "Enter your email address to continue." });
      return;
    }
    if (password.length < 8) {
      setNotice({ kind: "error", text: "Use a password with at least 8 characters." });
      return;
    }
    if (isCreateAccount && password !== confirmPassword) {
      setNotice({ kind: "error", text: "Your passwords do not match." });
      return;
    }

    setFlowStatus("submitting");
    try {
      if (isCreateAccount) {
        const response = await withTimeout(
          supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: { emailRedirectTo: `${window.location.origin}/join` },
          }),
          "The account service took too long to respond. Please try again.",
        );
        if (response.error) throw response.error;
        if (response.data.session) {
          await exchangeSession(response.data.session);
          return;
        }
        setFlowStatus("sent");
        setNotice({ kind: "success", text: "Confirmation email sent. Open it to activate your Sura account, then return here." });
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const response = await withTimeout(
        supabase.auth.signInWithPassword({ email: normalizedEmail, password }),
        "The sign-in service took too long to respond. Please try again.",
      );
      if (response.error) throw response.error;
      if (!response.data.session) {
        throw new Error("Sura did not receive a valid session. Please confirm your email and try again.");
      }
      await exchangeSession(response.data.session);
    } catch (error) {
      setFlowStatus("error");
      setNotice({
        kind: "error",
        text: errorMessage(error, "We could not complete that request. Check your details and try again."),
      });
    }
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!supabase) {
      setNotice({ kind: "error", text: "Password recovery is not configured on this deployment yet." });
      return;
    }
    if (password.length < 8) {
      setNotice({ kind: "error", text: "Use a password with at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setNotice({ kind: "error", text: "Your passwords do not match." });
      return;
    }

    setFlowStatus("submitting");
    try {
      const response = await withTimeout(
        supabase.auth.updateUser({ password }),
        "The password update service took too long to respond. Please try again.",
      );
      if (response.error) throw response.error;
      const sessionResponse = await withTimeout(
        supabase.auth.getSession(),
        "Sura could not read the updated session. Please try again.",
        SESSION_CHECK_TIMEOUT_MS,
      );
      if (sessionResponse.error || !sessionResponse.data.session) {
        throw sessionResponse.error ?? new Error("Sura did not receive the updated session.");
      }
      setResetMode(null);
      setPassword("");
      setConfirmPassword("");
      await exchangeSession(sessionResponse.data.session);
    } catch (error) {
      setFlowStatus("error");
      setNotice({ kind: "error", text: errorMessage(error, "We could not update your password. Please request a fresh reset link.") });
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!supabase) {
      setNotice({ kind: "error", text: "Password recovery is not configured on this deployment yet." });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setNotice({ kind: "error", text: "Enter your email address so Supabase can send a reset link." });
      return;
    }

    setFlowStatus("submitting");
    try {
      const response = await withTimeout(
        supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/join`,
        }),
        "The password recovery service took too long to respond. Please try again.",
      );
      if (response.error) throw response.error;
      setFlowStatus("sent");
      setNotice({ kind: "success", text: "Password reset email sent. Follow the secure link, then return to Sura." });
    } catch (error) {
      setFlowStatus("error");
      setNotice({ kind: "error", text: errorMessage(error, "We could not send the reset email. Please try again.") });
    }
  };

  const handleLogout = async () => {
    setNotice(null);
    try {
      await logout();
      exchangeTokenRef.current = null;
      setSessionStatus("ready");
      setNotice({ kind: "success", text: "You are signed out of Sura." });
    } catch {
      setNotice({ kind: "error", text: "We could not finish signing out. Please try again." });
    }
  };

  const retrySession = () => {
    exchangeTokenRef.current = null;
    setNotice(null);
    setSessionStatus("checking");
    if (supabase) void supabase.auth.getSession().then(({ data }) => exchangeSession(data.session));
  };

  const moveFrame = (direction: number) => {
    setActiveFrame((current) => (current + direction + frames.length) % frames.length);
  };
  const secondaryFrame = frames[(activeFrame + 1) % frames.length];
  const tertiaryFrame = frames[(activeFrame + 2) % frames.length];
  const isBusy = flowStatus === "submitting" || flowStatus === "exchanging" || exchangeIsPending;

  return (
    <main className="sura-auth-shell relative min-h-screen bg-[#121410] text-[#e3e3dc] lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(25rem,0.82fr)]">
      <section className="sura-auth-visual relative min-h-[30rem] overflow-hidden bg-[#0d0f0b] sm:min-h-[38rem] lg:min-h-screen">
        <div className="absolute inset-0 grid grid-cols-12 gap-2 p-3 sm:gap-3 sm:p-5 lg:p-6">
          <div className="sura-auth-frame relative col-span-7 row-span-12 overflow-hidden rounded-[1.35rem] sm:rounded-[1.8rem]"><img key={frames[activeFrame].image} src={frames[activeFrame].image} alt={frames[activeFrame].label} className="sura-auth-image h-full w-full object-cover transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0b]/80 via-transparent to-[#11130f]/5" /></div>
          <div className="sura-auth-frame relative col-span-5 row-span-7 overflow-hidden rounded-[1.35rem] sm:rounded-[1.8rem]"><img key={secondaryFrame.image} src={secondaryFrame.image} alt={secondaryFrame.label} className="sura-auth-image sura-auth-image-secondary h-full w-full object-cover transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0b]/65 to-transparent" /></div>
          <div className="sura-auth-frame relative col-span-5 row-span-5 overflow-hidden rounded-[1.35rem] bg-[#1e201c] sm:rounded-[1.8rem]"><img key={tertiaryFrame.image} src={tertiaryFrame.image} alt={tertiaryFrame.label} className="sura-auth-image sura-auth-image-tertiary h-full w-full object-cover opacity-85 transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0b]/75 to-transparent" /></div>
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 sm:px-9 sm:py-8">
          <Link href="/" className="vb-focus flex items-center gap-3"><img src="/sura-wordmark.svg" alt="SURA" className="h-9 w-auto" /><span className="sr-only">Local visual network</span></Link>
          <span className="rounded-full border border-white/20 bg-[#0d0f0b]/75 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#e3e3dc] backdrop-blur">Nairobi · Kenya</span>
        </div>
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 sm:inset-x-9 sm:bottom-9">
          <div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#caff32]">SURA / LOCAL NETWORK</p><h1 className="mt-3 max-w-lg text-4xl font-black leading-[0.92] tracking-[-0.065em] sm:text-6xl">Good ideas find a way here.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-[#c5c9af]">Discover people, places, products, and plans worth keeping close.</p><div className="mt-5 flex items-center gap-2"><button onClick={() => moveFrame(-1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-[#0d0f0b]/75 text-white backdrop-blur" aria-label="Previous visual"><ChevronLeft className="h-4 w-4" /></button>{frames.map((frame, index) => <button key={frame.image} onClick={() => setActiveFrame(index)} className={`vb-focus h-1.5 rounded-full ${activeFrame === index ? "w-8 bg-[#caff32]" : "w-3 bg-white/55"}`} aria-label={`Show ${frame.label}`} aria-pressed={activeFrame === index} />)}<button onClick={() => moveFrame(1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-[#0d0f0b]/75 text-white backdrop-blur" aria-label="Next visual"><ChevronRight className="h-4 w-4" /></button></div></div>
          <span className="hidden rounded-full border border-white/20 bg-[#0d0f0b]/75 px-3 py-2 text-[0.62rem] font-semibold text-[#e3e3dc] backdrop-blur sm:inline-flex">{frames[activeFrame].meta}</span>
        </div>
      </section>

      <section className="sura-auth-panel relative flex min-h-[34rem] flex-col justify-start overflow-hidden bg-[#121410] px-5 pb-8 pt-7 text-[#e3e3dc] sm:px-10 sm:pb-10 sm:pt-10 lg:min-h-screen lg:px-14 lg:pt-16 xl:px-20">
        <div className="relative z-10 mx-auto w-full max-w-[34rem]">
          <div className="mb-4"><div className="mb-2 flex items-center justify-between text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#c5c9af]"><span>Visual sequence</span><span>{activeFrame + 1} / {frames.length}</span></div><div className="grid grid-cols-3 gap-2">{[activeFrame, (activeFrame + 1) % frames.length, (activeFrame + 2) % frames.length].map((frameIndex, index) => <button key={`${frames[frameIndex].image}-${index}`} onClick={() => setActiveFrame(frameIndex)} className={`sura-auth-thumb vb-focus relative h-16 overflow-hidden rounded-xl sm:h-20 ${index === 0 ? "ring-2 ring-[#caff32] ring-offset-2 ring-offset-[#121410]" : "opacity-80"}`} aria-label={`Show visual ${frameIndex + 1}`} aria-pressed={frameIndex === activeFrame}><img src={frames[frameIndex].image} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#11130f]/75 px-1.5 py-0.5 text-[0.52rem] font-bold text-white">{index === 0 ? "Now" : `0${frameIndex + 1}`}</span></button>)}</div></div>

          <div className="flex items-center justify-between"><span className="vb-kicker text-[#caff32]">SURA / ENTER YOUR EDIT</span><span className="inline-flex items-center gap-1.5 text-[0.66rem] font-black uppercase tracking-[0.1em] text-[#c5c9af]"><LockKeyhole className="h-3.5 w-3.5" /> Your private space</span></div>
          <h2 className="mt-5 max-w-md text-4xl font-black leading-[0.94] tracking-[-0.06em] text-[#e3e3dc] sm:text-5xl">{isCreateAccount ? "Start your signature here." : "Pick up your point of view."}</h2>
          <p className="mt-4 max-w-md text-[0.95rem] font-semibold leading-6 text-[#c5c9af]">{isCreateAccount ? "Sura is a visual space for the way you want to live—your rooms, wardrobe, objects, places, and details in one direction." : "Return to the visual direction you have been shaping across your spaces, style, places, and everyday finds."}</p>
          <div className="mt-6 grid grid-cols-3 gap-2 border-y border-[#454935] py-4"><div className="pr-2"><p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#caff32]">01</p><p className="mt-2 text-sm font-black leading-4 text-[#e3e3dc]">Choose a direction.</p><p className="mt-1 text-[0.7rem] font-semibold leading-4 text-[#8f937b]">Soft, bold, quiet, electric.</p></div><div className="border-l border-[#454935] px-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#caff32]">02</p><p className="mt-2 text-sm font-black leading-4 text-[#e3e3dc]">Make it recognisable.</p><p className="mt-1 text-[0.7rem] font-semibold leading-4 text-[#8f937b]">Carry it through the details.</p></div><div className="border-l border-[#454935] pl-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#caff32]">03</p><p className="mt-2 text-sm font-black leading-4 text-[#e3e3dc]">Make it yours.</p><p className="mt-1 text-[0.7rem] font-semibold leading-4 text-[#8f937b]">Let everyday life become the brand.</p></div></div>

          {isAuthenticated ? (
            <div className="mt-7 space-y-3"><Link href="/account" className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#caff32] px-5 py-3.5 text-sm font-black text-[#293500]">Open my Sura space <ArrowRight className="h-4 w-4" /></Link><button type="button" onClick={handleLogout} className="vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#454935] bg-transparent px-5 py-3.5 text-sm font-black text-[#e3e3dc]"><LogOut className="h-4 w-4" /> Sign out</button></div>
          ) : (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#454935] bg-[#1a1c18] p-1.5" role="tablist" aria-label="Account access mode"><button type="button" role="tab" aria-selected={authMode === "signin"} onClick={() => setMode("signin")} className={`sura-auth-tab vb-focus rounded-xl px-3 py-3 text-sm font-black ${authMode === "signin" ? "bg-[#caff32] text-[#293500]" : "text-[#c5c9af]"}`}>Sign in</button><button type="button" role="tab" aria-selected={authMode === "signup"} onClick={() => setMode("signup")} className={`sura-auth-tab vb-focus rounded-xl px-3 py-3 text-sm font-black ${authMode === "signup" ? "bg-[#caff32] text-[#293500]" : "text-[#c5c9af]"}`}>Create account</button></div>

              {resetMode === "update" ? (
                <form onSubmit={handlePasswordUpdate} className="sura-auth-form mt-5 space-y-3" data-auth-state={flowStatus === "error" ? "error" : flowStatus === "sent" ? "success" : isBusy ? "busy" : "idle"}><div><label htmlFor="sura-new-password" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">New password</label><div className="relative mt-2"><input id="sura-new-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className="vb-focus w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 pr-12 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="vb-focus absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#c5c9af]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div><label htmlFor="sura-new-password-confirm" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">Confirm new password</label><input id="sura-new-password-confirm" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} placeholder="Repeat your password" className="vb-focus mt-2 w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /></div><button type="submit" disabled={isBusy} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#caff32] px-5 py-3.5 text-sm font-black text-[#293500] disabled:cursor-wait disabled:opacity-60">{isBusy ? "Saving password…" : "Save new password"}<ArrowRight className="h-4 w-4" /></button></form>
              ) : resetMode === "request" ? (
                <form onSubmit={handleResetSubmit} className="sura-auth-form mt-5 space-y-3" data-auth-state={flowStatus === "error" ? "error" : flowStatus === "sent" ? "success" : isBusy ? "busy" : "idle"}><div><label htmlFor="sura-reset-email" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">Email for password recovery</label><input id="sura-reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" className="vb-focus mt-2 w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /></div><button type="submit" disabled={isBusy} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#caff32] px-5 py-3.5 text-sm font-black text-[#293500] disabled:cursor-wait disabled:opacity-60">{isBusy ? "Sending reset email…" : "Send reset email"}<ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => { setResetMode(null); setNotice(null); setFlowStatus("idle"); }} className="vb-focus inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-xs font-black text-[#c5c9af]"><RotateCcw className="h-3.5 w-3.5" /> Back to {authMode === "signin" ? "sign in" : "account creation"}</button></form>
              ) : (
                <form onSubmit={handleAuthSubmit} className="sura-auth-form mt-5 space-y-3" data-auth-state={flowStatus === "error" ? "error" : flowStatus === "sent" ? "success" : isBusy ? "busy" : "idle"}><div><label htmlFor="sura-email" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">Email address</label><input id="sura-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" className="vb-focus mt-2 w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /></div><div><label htmlFor="sura-password" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">Password</label><div className="relative mt-2"><input id="sura-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isCreateAccount ? "new-password" : "current-password"} required minLength={8} placeholder="At least 8 characters" className="vb-focus w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 pr-12 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="vb-focus absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#c5c9af]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>{isCreateAccount && <div><label htmlFor="sura-confirm-password" className="block text-xs font-black uppercase tracking-[0.12em] text-[#c5c9af]">Confirm password</label><input id="sura-confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} placeholder="Repeat your password" className="vb-focus mt-2 w-full rounded-xl border border-[#454935] bg-[#1a1c18] px-4 py-3.5 text-[0.95rem] font-semibold text-[#e3e3dc] outline-none placeholder:text-[#8f937b]" /></div>}<button type="submit" disabled={isBusy} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#caff32] px-5 py-3.5 text-sm font-black text-[#293500] disabled:cursor-wait disabled:opacity-60">{flowStatus === "exchanging" || exchangeIsPending
 ? "Opening your Sura space…" : flowStatus === "submitting" ? (isCreateAccount ? "Creating account…" : "Signing in…") : isCreateAccount ? "Create account" : "Sign in"}<ArrowRight className="h-4 w-4" /></button></form>
              )}

              {notice && <p key={`${notice.kind}:${notice.text}`} className={`sura-auth-notice mt-3 rounded-xl border px-4 py-3 text-center text-[0.8rem] font-bold leading-5 ${notice.kind === "success" ? "border-[#6d8310] bg-[#1a1c18] text-[#caff32]" : "border-[#8d4c4b] bg-[#2a1816] text-[#ffb4ab]"}`} role={notice.kind === "success" ? "status" : "alert"}>{notice.text}</p>}
              {!resetMode && !isCreateAccount && <button type="button" onClick={() => { setResetMode("request"); setNotice(null); setFlowStatus("idle"); }} className="vb-focus mt-3 block w-full text-center text-xs font-black text-[#caff32] underline underline-offset-2">Forgot password?</button>}
              {sessionStatus === "error" && <button type="button" onClick={retrySession} className="vb-focus mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#454935] px-5 py-3 text-xs font-black text-[#c5c9af]"><RotateCcw className="h-3.5 w-3.5" /> Try the secure session check again</button>}
              {!hasSupabaseConfig && hasOAuthConfig && <button type="button" onClick={() => startLogin()} className="vb-focus mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#454935] px-5 py-3 text-xs font-bold text-[#c5c9af]">Use Sura OAuth instead</button>}
              {!hasSupabaseConfig && !hasOAuthConfig && !notice && <p className="mt-3 rounded-xl border border-[#c58e67] bg-[#fff4e8] px-4 py-3 text-center text-[0.8rem] font-bold leading-5 text-[#5b321b]" role="status">Email authentication is waiting for this deployment’s public Supabase settings.</p>}
            </div>
          )}

          <div className="mt-6 space-y-2 text-[0.78rem] font-semibold leading-5 text-[#c5c9af]"><p className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#caff32]" />Save the good things that feel like you.</p><p className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#caff32]" />New accounts confirm their email with Supabase before access is completed.</p><p className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#caff32]" />Start local. Stay close.</p></div>
          <p className="mt-5 text-center text-xs font-semibold leading-5 text-[#c5c9af]">{isCreateAccount ? "Supabase will send a confirmation email. Open it to activate your account and enter your new Sura space." : "Use the email and password you set for Sura to return to your private space."}</p>
          <div className="mt-7 flex items-start justify-between gap-3 border-t border-[#454935] pt-5 text-xs font-semibold leading-5 text-[#c5c9af]"><span>By continuing, you accept our <Link href="/terms" className="font-black text-[#964c23] underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="font-black text-[#964c23] underline underline-offset-2">Privacy Policy</Link>.</span><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#caff32]" /></div>
        </div>
      </section>
    </main>
  );
}
