import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, CheckCircle2, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { VibeLayout } from "@/components/VibeLayout";
import { trpc } from "@/lib/trpc";
import { getSupabaseEmailRedirect } from "@/lib/supabaseAuthRedirect";
import { getAuthErrorGuidance } from "@/lib/authErrorGuidance";

type Mode = "sign-in" | "sign-up" | "recovery" | "link";

const accountBenefits = [{ Icon: LockKeyhole, label: "Email protected" }, { Icon: ShieldCheck, label: "Private by default" }, { Icon: Sparkles, label: "Public when you choose" }];

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const signUp = trpc.auth.emailSignUp.useMutation();
  const signIn = trpc.auth.emailSignIn.useMutation();
  const recovery = trpc.auth.emailPasswordRecovery.useMutation();
  const link = trpc.auth.emailLinkExistingAccount.useMutation();
  const busy = signUp.isPending || signIn.isPending || recovery.isPending || link.isPending;
  const error = signUp.error?.message ?? signIn.error?.message ?? recovery.error?.message ?? link.error?.message;
  const errorGuidance = getAuthErrorGuidance(error);
  const redirectTo = getSupabaseEmailRedirect();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (mode === "sign-up") {
      await signUp.mutateAsync({ email, password, redirectTo });
      setMessage("Check your inbox to verify this email, then return here to sign in.");
      return;
    }
    if (mode === "recovery") {
      await recovery.mutateAsync({ email, redirectTo });
      setMessage("If this email has a SURA account, a recovery link is on its way.");
      return;
    }
    if (mode === "link") {
      const result = await link.mutateAsync({ email, password, consent: true });
      if (result.status === "linked") window.location.assign("/account");
      return;
    }
    const result = await signIn.mutateAsync({ email, password });
    if (result.status === "account_link_required") {
      setMode("link");
      setConsent(false);
      setMessage("This email belongs to a previous SURA account. Confirm that you want to link this verified email to that existing account; no duplicate profile will be created.");
      return;
    }
    window.location.assign("/account");
  }

  const heading = mode === "sign-up" ? "Create your email space." : mode === "recovery" ? "Recover access with care." : mode === "link" ? "Link your existing SURA space." : "Continue with your email.";
  const action = mode === "sign-up" ? "Create email account" : mode === "recovery" ? "Send recovery link" : mode === "link" ? "Confirm and link email" : "Sign in securely";

  return <VibeLayout><main className="container grid min-h-[calc(100vh-9rem)] items-center gap-10 py-10 lg:grid-cols-[0.86fr_1.14fr]"><div><p className="vb-kicker text-[#9d5b2d]">SURA / ACCOUNT</p><h1 className="vb-serif mt-5 max-w-lg text-5xl leading-[0.94] text-[#261f19] sm:text-6xl">A private space for what you are building.</h1><p className="mt-5 max-w-lg text-base leading-7 text-[#756655]">Use your email to create a secure planning profile, build a company studio, retain private records, and choose the links you share publicly.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{accountBenefits.map(({ Icon, label }) => <div key={label} className="rounded-2xl border border-[#ded1bf] bg-[#fbf8f2] p-4"><Icon className="h-4 w-4 text-[#aa6a34]" /><p className="mt-4 text-xs font-bold text-[#4d3d2d]">{label}</p></div>)}</div></div><section className="rounded-[2rem] bg-[#1d1b18] p-7 text-[#faf4eb] shadow-[0_24px_60px_rgba(31,23,15,0.18)] sm:p-10"><div className="flex items-center gap-3"><img src="/manus-storage/sura-packaging-mark_299d54bf.svg" alt="SURA" className="h-11 w-11 rounded-xl" /><span className="rounded-full border border-[#554a3c] px-3 py-1 text-xs font-bold text-[#d7a261]">Email access</span></div><p className="vb-kicker mt-9 text-[#d7a261]">Identity, held with care</p><h2 className="vb-serif mt-3 text-4xl leading-[0.98]">{isAuthenticated ? "You are already in." : heading}</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#d8cabc]">SURA uses email authentication. We never ask for a mobile-money PIN, card number, or payment credential in the account journey.</p>{isAuthenticated ? <Link href="/account" className="vb-button vb-focus mt-8 inline-flex items-center gap-2 rounded-full bg-[#fbf7ef] px-6 py-3.5 text-sm font-bold text-[#211b16]">Open my private space <ArrowUpRight className="h-4 w-4" /></Link> : <><div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Email account actions">{(["sign-in", "sign-up", "recovery"] as Mode[]).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => { setMode(item); setMessage(null); setConsent(false); }} className={`vb-focus rounded-full px-3 py-2 text-xs font-bold ${mode === item ? "bg-[#fbf7ef] text-[#211b16]" : "border border-[#554a3c] text-[#d8cabc]"}`}>{item === "sign-in" ? "Sign in" : item === "sign-up" ? "Create account" : "Recover"}</button>)}</div><form className="mt-6 space-y-4" onSubmit={submit}><label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#d8cabc]">Email</span><div className="relative mt-2"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#d7a261]" /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="vb-focus w-full rounded-xl border border-[#554a3c] bg-[#27221d] py-3 pl-10 pr-3 text-sm text-[#fbf7ef]" placeholder="you@example.com" /></div></label>{mode !== "recovery" && <label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#d8cabc]">Password</span><div className="relative mt-2"><KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-[#d7a261]" /><input type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="vb-focus w-full rounded-xl border border-[#554a3c] bg-[#27221d] py-3 pl-10 pr-3 text-sm text-[#fbf7ef]" placeholder="At least 8 characters" /></div></label>}{mode === "link" && <label className="flex gap-3 rounded-xl border border-[#554a3c] bg-[#27221d] p-4 text-sm leading-6 text-[#d8cabc]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4" required /><span>I consent to link this verified email to my existing SURA account. My private boards, company roles, orders, and saved edits remain under the same SURA account.</span></label>}<button disabled={busy || (mode === "link" && !consent)} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fbf7ef] px-6 py-3.5 text-sm font-bold text-[#211b16] disabled:opacity-60">{busy ? "Working securely…" : action} <ArrowUpRight className="h-4 w-4" /></button></form>{errorGuidance ? <div role="alert" className="mt-5 rounded-xl bg-[#5b2e25] p-4 text-sm leading-6 text-[#ffd8ce]"><p className="font-bold">{errorGuidance.title}</p><p className="mt-1">{errorGuidance.copy}</p>{errorGuidance.actionLabel && errorGuidance.nextMode && <button type="button" onClick={() => { setMode(errorGuidance.nextMode!); setMessage(null); }} className="vb-focus mt-3 rounded-full border border-[#ffd8ce]/50 px-3 py-1.5 text-xs font-bold">{errorGuidance.actionLabel}</button>}</div> : message && <p role="status" className="mt-5 rounded-xl bg-[#2f4a36] p-4 text-sm leading-6 text-[#d9f2df]"><CheckCircle2 className="mr-2 inline h-4 w-4" />{message}</p>}</>}<p className="mt-8 text-xs text-[#bfb2a2]">By continuing, you acknowledge the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p></section></main></VibeLayout>;
}
