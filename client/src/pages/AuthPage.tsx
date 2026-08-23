import { ArrowRight, Check, ChevronLeft, ChevronRight, LockKeyhole, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const fallbackFrames = [
  { image: "/assets/sura-auth-hero.jpg", label: "A point of view", meta: "Nairobi · after five" },
  { image: "/assets/sura-auth-street.jpg", label: "A way forward", meta: "Local edit · in motion" },
  { image: "/assets/sura-auth-interior.jpg", label: "A place to make", meta: "Home studio · considered" },
];

export default function AuthPage() {
  const { isAuthenticated, loading } = useAuth();
  const visualSet = trpc.public.authVisuals.useQuery();
  const frames = useMemo(() => { const activeSet = visualSet.data; return activeSet?.imageUrls?.length ? activeSet.imageUrls.map((image, index) => ({ image, label: `Sura visual ${index + 1}`, meta: activeSet.title })) : fallbackFrames; }, [visualSet.data]);
  const [activeFrame, setActiveFrame] = useState(0);
  const [authNotice, setAuthNotice] = useState("");
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const hasSupabaseConfig = isSupabaseConfigured && Boolean(supabase);
  const hasOAuthConfig = Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID);
  const exchangeSupabaseSession = trpc.auth.exchangeSupabaseSession.useMutation();

  useEffect(() => {
    setActiveFrame(0);
    const timer = window.setInterval(() => setActiveFrame((current) => (current + 1) % frames.length), 5500);
    return () => window.clearInterval(timer);
  }, [frames.length]);

  useEffect(() => {
    if (!supabase) return;
    let exchanged = false;
    const exchangeSession = async (accessToken: string) => {
      if (exchanged) return;
      exchanged = true;
      try {
        await exchangeSupabaseSession.mutateAsync({ accessToken });
        window.location.replace("/");
      } catch (error) {
        exchanged = false;
        setAuthNotice(error instanceof Error ? error.message : "We could not finish your secure sign-in. Please request a new link.");
      }
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) void exchangeSession(data.session.access_token);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) void exchangeSession(session.access_token);
    });
    return () => listener.subscription.unsubscribe();
  }, [exchangeSupabaseSession]);

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthNotice("");
    setMagicLinkSent(false);
    if (!supabase) {
      if (!startLogin()) setAuthNotice("Email sign-in is not configured on this deployment yet. Add the public Supabase URL and publishable key, then try again.");
      return;
    }
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;
    setIsSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/join` },
    });
    setIsSendingLink(false);
    if (error) {
      setAuthNotice(error.message);
      return;
    }
    setMagicLinkSent(true);
  };

  const moveFrame = (direction: number) => setActiveFrame((current) => (current + direction + frames.length) % frames.length);
  const secondaryFrame = frames[(activeFrame + 1) % frames.length];
  const tertiaryFrame = frames[(activeFrame + 2) % frames.length];

  return <main className="min-h-screen bg-[#11130f] text-[#f7f3eb] lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(25rem,0.82fr)]">
    <section className="relative min-h-[30rem] overflow-hidden bg-[#151713] sm:min-h-[38rem] lg:min-h-screen">
      <div className="absolute inset-0 grid grid-cols-12 gap-2 p-3 sm:gap-3 sm:p-5 lg:p-6">
        <div className="relative col-span-7 row-span-12 overflow-hidden rounded-[1.35rem] sm:rounded-[1.8rem]"><img src={frames[activeFrame].image} alt={frames[activeFrame].label} className="h-full w-full object-cover transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#11130f]/75 via-transparent to-[#11130f]/5" /></div>
        <div className="relative col-span-5 row-span-7 overflow-hidden rounded-[1.35rem] sm:rounded-[1.8rem]"><img src={secondaryFrame.image} alt={secondaryFrame.label} className="h-full w-full object-cover transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#11130f]/60 to-transparent" /></div>
        <div className="relative col-span-5 row-span-5 overflow-hidden rounded-[1.35rem] bg-[#302d25] sm:rounded-[1.8rem]"><img src={tertiaryFrame.image} alt={tertiaryFrame.label} className="h-full w-full object-cover opacity-85 transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#11130f]/70 to-transparent" /></div>
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 sm:px-9 sm:py-8"><Link href="/" className="vb-focus flex items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#11130f]"><img src="/sura-mark.svg" alt="Sura" className="h-full w-full" /></span><span className="leading-none"><span className="block text-sm font-black tracking-[0.22em]">SURA</span><span className="mt-1 block text-[0.5rem] font-bold tracking-[0.17em] text-[#d7ff4d]">LOCAL NETWORK</span></span></Link><span className="rounded-full border border-white/20 bg-[#11130f]/35 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#ece6da] backdrop-blur">Nairobi · Kenya</span></div>
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 sm:inset-x-9 sm:bottom-9"><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#d7ff4d]">SURA / LOCAL NETWORK</p><h1 className="mt-3 max-w-lg text-4xl font-black leading-[0.92] tracking-[-0.065em] sm:text-6xl">Good ideas find a way here.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-[#d7d3c8]">Discover people, places, products, and plans worth keeping close.</p><div className="mt-5 flex items-center gap-2"><button onClick={() => moveFrame(-1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-[#11130f]/45 text-white backdrop-blur" aria-label="Previous visual"><ChevronLeft className="h-4 w-4" /></button>{frames.map((frame, index) => <button key={frame.image} onClick={() => setActiveFrame(index)} className={`vb-focus h-1.5 rounded-full transition-all ${activeFrame === index ? "w-8 bg-[#d7ff4d]" : "w-3 bg-white/45"}`} aria-label={`Show ${frame.label}`} aria-pressed={activeFrame === index} />)}<button onClick={() => moveFrame(1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-[#11130f]/45 text-white backdrop-blur" aria-label="Next visual"><ChevronRight className="h-4 w-4" /></button></div></div><span className="hidden rounded-full border border-white/20 bg-[#11130f]/45 px-3 py-2 text-[0.62rem] font-semibold text-[#e8e2d7] backdrop-blur sm:inline-flex">{frames[activeFrame].meta}</span></div>
    </section>

    <section className="relative flex min-h-[34rem] flex-col justify-start overflow-hidden bg-[#ece7df] px-5 pt-7 pb-8 text-[#211d18] sm:px-10 sm:pt-10 sm:pb-10 lg:min-h-screen lg:px-14 lg:pt-16 xl:px-20"><div className="relative z-10 mx-auto w-full max-w-[34rem]"><div className="mb-4"><div className="mb-2 flex items-center justify-between text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#8a7a68]"><span>Visual sequence</span><span>{activeFrame + 1} / {frames.length}</span></div><div className="grid grid-cols-3 gap-2">{[activeFrame, (activeFrame + 1) % frames.length, (activeFrame + 2) % frames.length].map((frameIndex, index) => <button key={`${frames[frameIndex].image}-${index}`} onClick={() => setActiveFrame(frameIndex)} className={`vb-focus relative h-16 overflow-hidden rounded-xl sm:h-20 ${index === 0 ? "ring-2 ring-[#a66231] ring-offset-2 ring-offset-[#ece7df]" : "opacity-75 hover:opacity-100"}`} aria-label={`Show visual ${frameIndex + 1}`} aria-pressed={frameIndex === activeFrame}><img src={frames[frameIndex].image} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#11130f]/70 px-1.5 py-0.5 text-[0.52rem] font-bold text-white">{index === 0 ? "Now" : `0${frameIndex + 1}`}</span></button>)}</div></div><div className="flex items-center justify-between"><span className="vb-kicker text-[#a66231]">SURA / ACCOUNT</span><span className="inline-flex items-center gap-1.5 text-[0.63rem] font-bold uppercase tracking-[0.1em] text-[#665442]"><LockKeyhole className="h-3.5 w-3.5" /> Secure access</span></div><h2 className="mt-5 max-w-md text-4xl font-black leading-[0.94] tracking-[-0.06em] text-[#211d18] sm:text-5xl">Keep your direction moving.</h2><p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#5d4c3d]">Sign in to pick up your saved edits, local briefs, and company discoveries wherever you left them.</p><div className="mt-6 border-y border-[#ddd3c5] py-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-[#11130f]"><img src="/sura-mark.svg" alt="" className="h-full w-full" /></span><div><p className="text-sm font-black text-[#2b211a]">Your Sura space</p><p className="mt-1 text-xs font-medium text-[#6d5b49]">One secure session for every local edit.</p></div></div><div className="mt-5 space-y-3 text-xs font-medium leading-5 text-[#5d4c3d]"><p className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a66231]" />Save the good things that feel like you.</p><p className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a66231]" />Keep your private space private.</p><p className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a66231]" />Start local. Stay close.</p></div></div>{isAuthenticated ? <Link href="/account" className="vb-button vb-focus mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b1e16] px-5 py-3.5 text-sm font-black text-[#f7f3eb]">Open my Sura space <ArrowRight className="h-4 w-4" /></Link> : <div className="mt-6"><form onSubmit={sendMagicLink} className="space-y-3"><label htmlFor="sura-email" className="block text-xs font-black uppercase tracking-[0.12em] text-[#6d5b49]">Email address</label><input id="sura-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" className="vb-focus w-full rounded-xl border border-[#cfc2b2] bg-[#fffaf3] px-4 py-3.5 text-sm font-semibold text-[#211d18] outline-none placeholder:text-[#9a8977]" /><button type="submit" disabled={loading || isSendingLink || exchangeSupabaseSession.isPending} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b1e16] px-5 py-3.5 text-sm font-black text-[#f7f3eb] hover:bg-[#33382a] disabled:cursor-wait disabled:opacity-60">{isSendingLink ? "Sending your link…" : exchangeSupabaseSession.isPending ? "Opening your Sura space…" : "Send secure sign-in link"}<ArrowRight className="h-4 w-4" /></button></form>{magicLinkSent && <p className="mt-3 rounded-xl border border-[#b7cb82] bg-[#f3f8df] px-4 py-3 text-center text-xs font-semibold leading-5 text-[#43511e]" role="status">Check your inbox. Your private Sura session will open when you use the link.</p>}{authNotice && <p className="mt-3 rounded-xl border border-[#d2a87a] bg-[#fff6e7] px-4 py-3 text-center text-xs font-semibold leading-5 text-[#5d3b1e]" role="alert">{authNotice}</p>}{!hasSupabaseConfig && hasOAuthConfig && <button type="button" onClick={() => startLogin()} className="vb-focus mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#cfc2b2] px-5 py-3 text-xs font-bold text-[#5d4c3d]">Use Sura OAuth instead</button>}{!hasSupabaseConfig && !hasOAuthConfig && !authNotice && <p className="mt-3 rounded-xl border border-[#d2a87a] bg-[#fff6e7] px-4 py-3 text-center text-xs font-semibold leading-5 text-[#5d3b1e]" role="status">Email sign-in is waiting for this deployment’s public Supabase settings.</p>}</div>}<p className="mt-5 text-center text-xs font-medium leading-5 text-[#6d5b49]">No card, mobile-money PIN, or sensitive payment credential is requested here.</p><div className="mt-8 flex items-center justify-between gap-3 border-t border-[#ddd3c5] pt-5 text-xs font-medium text-[#6d5b49]"><span>By continuing, you accept our <Link href="/terms" className="font-bold text-[#a66231] underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="font-bold text-[#a66231] underline underline-offset-2">Privacy Policy</Link>.</span><Check className="h-4 w-4 shrink-0 text-[#a66231]" /></div></div></section>
  </main>;
}
