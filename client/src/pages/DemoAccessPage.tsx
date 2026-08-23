import React from "react";
import { ArrowUpRight, Eye, LockKeyhole, Palette, Search, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { VibeLayout } from "@/components/VibeLayout";
import { SuraWordmark } from "@/components/SuraWordmark";

const demoPaths = [
  {
    href: "/brief",
    Icon: Palette,
    eyebrow: "START WITH PLACE",
    title: "Shape a local build",
    copy: "Try the public planning brief with the visible Kenyan directory and clearly labelled demonstration content.",
  },
  {
    href: "/discover",
    Icon: Search,
    eyebrow: "BROWSE WITH CONTEXT",
    title: "Explore the directory",
    copy: "Search the public discovery experience without creating a profile, saving anything, or contacting a business.",
  },
  {
    href: "/ai-studio-preview",
    Icon: Sparkles,
    eyebrow: "SEE THE BOUNDARIES",
    title: "Preview AI Studio",
    copy: "Review the consent-first studio structure without uploading an image, submitting a brief, or calling an AI service.",
  },
];

export default function DemoAccessPage() {
  return <VibeLayout>
    <main className="container py-10 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-[#d8c6b1] bg-[#1d1b18] px-6 py-8 text-[#faf4eb] shadow-[0_24px_60px_rgba(31,23,15,0.16)] sm:px-10 sm:py-11">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="vb-kicker text-[#d7a261]">SURA / DEMO ACCESS</p>
            <h1 className="vb-serif mt-4 text-4xl leading-[0.95] sm:text-6xl">Explore the work. Keep identity private.</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#d8cabc] sm:text-base">This is a public, read-only product tour while email access is unavailable or still being verified. It is not a sign-in and never creates a SURA account.</p>
          </div>
          <div className="rounded-2xl border border-[#5b5042] bg-[#27221d] p-4"><SuraWordmark tone="paper" className="h-auto w-36" /><p className="mt-3 text-xs text-[#cbbca9]">Place · Identity · Possibility</p></div>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><Eye className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-sm font-bold">Read-only</p><p className="mt-1 text-xs leading-5 text-[#d8cabc]">No account or session is created.</p></div>
          <div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><LockKeyhole className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-sm font-bold">Private routes stay closed</p><p className="mt-1 text-xs leading-5 text-[#d8cabc]">Boards, orders, edits, and company tools still require a verified email.</p></div>
          <div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><Sparkles className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-sm font-bold">No concealed prompts</p><p className="mt-1 text-xs leading-5 text-[#d8cabc]">No password, image, payment, or personal data is requested here.</p></div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {demoPaths.map(({ href, Icon, eyebrow, title, copy }) => <Link key={href} href={href} className="vb-focus group rounded-[1.6rem] border border-[#ded1bf] bg-[#fbf8f2] p-6 transition-transform hover:-translate-y-0.5">
          <Icon className="h-5 w-5 text-[#a66732]" />
          <p className="vb-kicker mt-8 text-[#9d5b2d]">{eyebrow}</p>
          <h2 className="vb-serif mt-3 text-3xl text-[#2d2219]">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#756655]">{copy}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#2d2219]">Open preview <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </Link>)}
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[1.6rem] border border-dashed border-[#d4bea3] bg-[#fffaf3] p-6 sm:p-7">
        <div className="max-w-2xl"><p className="vb-kicker text-[#9d5b2d]">WHEN EMAIL ACCESS IS READY</p><h2 className="vb-serif mt-2 text-3xl text-[#2d2219]">Return to your verified private space.</h2><p className="mt-2 text-sm leading-6 text-[#756655]">A verified email is required before SURA can create a session or reveal a member’s private information. Existing SURA members can verify their email first, then link their established space with explicit consent.</p></div>
        <Link href="/join" className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[#1d1b18] px-5 py-3 text-sm font-bold text-[#fbf7ef]">Go to secure account access <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
    </main>
  </VibeLayout>;
}
