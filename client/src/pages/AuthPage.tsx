import { ArrowUpRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { VibeLayout } from "@/components/VibeLayout";
import { startLogin } from "@/const";

const accountBenefits = [
  { Icon: LockKeyhole, label: "Secure sign-in" },
  { Icon: ShieldCheck, label: "Private by default" },
  { Icon: Sparkles, label: "Public when you choose" },
];

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  return <VibeLayout><main className="container grid min-h-[calc(100vh-9rem)] items-center gap-10 py-10 lg:grid-cols-[0.86fr_1.14fr]"><div><p className="vb-kicker text-[#9d5b2d]">SURA / ACCOUNT</p><h1 className="vb-serif mt-5 max-w-lg text-5xl leading-[0.94] text-[#261f19] sm:text-6xl">A private space for what you are building.</h1><p className="mt-5 max-w-lg text-base leading-7 text-[#756655]">Create a secure planning profile, build a company studio, retain your payment records, and choose the links you share publicly.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{accountBenefits.map(({ Icon, label }) => <div key={label} className="rounded-2xl border border-[#ded1bf] bg-[#fbf8f2] p-4"><Icon className="h-4 w-4 text-[#aa6a34]" /><p className="mt-4 text-xs font-bold text-[#4d3d2d]">{label}</p></div>)}</div></div><section className="rounded-[2rem] bg-[#1d1b18] p-7 text-[#faf4eb] shadow-[0_24px_60px_rgba(31,23,15,0.18)] sm:p-10"><img src="/manus-storage/sura-packaging-mark_299d54bf.svg" alt="SURA" className="h-11 w-11 rounded-xl" /><p className="vb-kicker mt-9 text-[#d7a261]">Identity, held with care</p><h2 className="vb-serif mt-3 text-4xl leading-[0.98]">{isAuthenticated ? "You are already in." : "Continue to SURA."}</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#d8cabc]">SURA uses a protected sign-in flow. We never ask for a mobile-money PIN, card number, or sensitive payment credential in the account journey.</p>{isAuthenticated ? <Link href="/account" className="vb-button vb-focus mt-8 inline-flex items-center gap-2 rounded-full bg-[#fbf7ef] px-6 py-3.5 text-sm font-bold text-[#211b16]">Open my private space <ArrowUpRight className="h-4 w-4" /></Link> : <button onClick={() => startLogin()} className="vb-button vb-focus mt-8 inline-flex items-center gap-2 rounded-full bg-[#fbf7ef] px-6 py-3.5 text-sm font-bold text-[#211b16]">Continue securely <ArrowUpRight className="h-4 w-4" /></button>}<p className="mt-8 text-xs text-[#bfb2a2]">By continuing, you acknowledge the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p></section></main></VibeLayout>;
}
