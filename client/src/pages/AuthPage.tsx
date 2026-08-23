import { ArrowRight, Check, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { VibeLayout } from "@/components/VibeLayout";

const benefits = [
  { Icon: Sparkles, title: "Keep your edits", copy: "Save ideas, vendors, and briefs in one place." },
  { Icon: ShieldCheck, title: "Stay in control", copy: "Your private activity stays private by default." },
  { Icon: LockKeyhole, title: "One secure session", copy: "Sign in through the protected Sura account flow." },
];

export default function AuthPage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <VibeLayout>
      <main className="grid min-h-[calc(100vh-4.55rem)] gap-8 px-4 pb-28 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:px-8 lg:pb-16">
        <section className="max-w-2xl">
          <p className="vb-kicker text-[#a66231]">SURA / ACCOUNT</p>
          <h1 className="mt-4 max-w-xl text-5xl font-black leading-[0.92] tracking-[-0.065em] text-[#211d18] sm:text-7xl">A calmer way to keep your direction.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#76695b]">Your board, briefs, and local discoveries are better when they travel with you. Use one secure account to pick up where you left off.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">{benefits.map(({ Icon, title, copy }) => <div key={title} className="rounded-2xl border border-[#ded5c9] bg-[#fffdf9] p-4"><Icon className="h-4 w-4 text-[#a66231]" /><p className="mt-5 text-sm font-black text-[#352a21]">{title}</p><p className="mt-1.5 text-xs leading-5 text-[#837566]">{copy}</p></div>)}</div>
        </section>

        <section className="rounded-[1.75rem] bg-[#1b1e16] p-6 text-[#f7f4ed] shadow-[0_22px_52px_rgba(31,26,16,0.18)] sm:p-8">
          <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d7ff4d] text-[#19210d]">S</span><span className="rounded-full border border-white/15 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#a8aa9d]">Secure access</span></div>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.15em] text-[#d7ff4d]">{isAuthenticated ? "Session active" : "Welcome back"}</p>
          <h2 className="mt-3 text-3xl font-black leading-[0.98] tracking-[-0.05em]">{isAuthenticated ? "You’re already in." : "Sign in to your Sura space."}</h2>
          <p className="mt-4 text-sm leading-6 text-[#c5c5b9]">{isAuthenticated ? "Your saved board and briefs are ready. Continue shaping what’s next." : "Continue to the protected Sura sign-in portal. Your browser will return here when the session is ready."}</p>
          {isAuthenticated ? <Link href="/account" className="vb-button vb-focus mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7f4ed] px-5 py-3.5 text-sm font-black text-[#1b1e16]">Open my space <ArrowRight className="h-4 w-4" /></Link> : <button onClick={() => startLogin()} disabled={loading} className="vb-button vb-focus mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7ff4d] px-5 py-3.5 text-sm font-black text-[#19210d] disabled:cursor-wait disabled:opacity-60">{loading ? "Checking session…" : "Continue securely"} <ArrowRight className="h-4 w-4" /></button>}
          <div className="mt-6 space-y-2 text-xs leading-5 text-[#96998d]"><p className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d7ff4d]" />No card, mobile-money PIN, or sensitive payment credential is requested here.</p><p className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d7ff4d]" />Sign-in uses Sura’s configured OAuth provider, including Google when enabled.</p></div>
          <p className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-[#8e9185]">By continuing, you accept our <Link href="/terms" className="text-[#d7ff4d] underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="text-[#d7ff4d] underline underline-offset-2">Privacy Policy</Link>.</p>
        </section>
      </main>
    </VibeLayout>
  );
}
