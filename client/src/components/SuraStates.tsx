import { ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import React, { type ReactNode } from "react";

export function SuraShimmer({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`sura-shimmer rounded-xl ${className}`} />;
}

export function SuraPageSkeleton({ cards = 3, dashboard = false }: { cards?: number; dashboard?: boolean }) {
  return <div className="animate-in fade-in duration-300"><div className="max-w-2xl"><SuraShimmer className="h-3 w-28" /><SuraShimmer className="mt-5 h-12 w-[85%]" /><SuraShimmer className="mt-4 h-4 w-[70%]" /></div><div className={`mt-10 grid gap-5 ${dashboard ? "lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>{Array.from({ length: cards }).map((_, index) => <div key={index} className="overflow-hidden rounded-[1.6rem] border border-[var(--sura-border)] bg-[#fbf8f2] p-5 dark:bg-[#1d211b]"><SuraShimmer className="h-40 w-full" /><SuraShimmer className="mt-5 h-4 w-20" /><SuraShimmer className="mt-3 h-8 w-[78%]" /><SuraShimmer className="mt-4 h-3 w-full" /><SuraShimmer className="mt-2 h-3 w-[72%]" /></div>)}</div></div>;
}

export function SuraProcessing({ eyebrow = "SURA / PROCESSING", title = "Shaping the next detail.", copy = "We are keeping your place while the next part of the experience comes together." }: { eyebrow?: string; title?: string; copy?: string }) {
  return <div role="status" className="grid min-h-64 place-items-center rounded-[1.8rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-8 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--sura-primary)] text-[var(--sura-accent)]"><Loader2 className="h-6 w-6 animate-spin" /></div><p className="vb-kicker mt-5 text-[var(--sura-accent)]">{eyebrow}</p><h2 className="vb-serif mt-3 text-3xl">{title}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756655]">{copy}</p></div></div>;
}

export function SuraEmptyState({ eyebrow = "SURA / READY WHEN YOU ARE", title, copy, action, icon }: { eyebrow?: string; title: string; copy: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="rounded-[1.8rem] border border-dashed border-[var(--sura-border)] bg-[var(--sura-paper)] p-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eee5d8] dark:bg-[#343a2e] text-[var(--sura-accent)]">{icon ?? <Sparkles className="h-6 w-6" />}</div><p className="vb-kicker mt-5 text-[var(--sura-accent)]">{eyebrow}</p><h2 className="vb-serif mt-3 text-3xl">{title}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756655]">{copy}</p>{action && <div className="mt-6">{action}</div>}</div>;
}

export function SuraErrorState({ title = "This needs another moment.", copy = "Nothing has been lost. Please try the request again.", onRetry }: { title?: string; copy?: string; onRetry?: () => void }) {
  return <div role="alert" className="rounded-[1.5rem] border border-[#e2b5a7] bg-[#fff3ed] p-7"><p className="vb-kicker text-[#9a4936]">SURA / RECOVERY</p><h2 className="vb-serif mt-3 text-3xl text-[#512d23]">{title}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#7e4839]">{copy}</p>{onRetry && <button onClick={onRetry} className="vb-button vb-focus mt-5 inline-flex items-center gap-2 rounded-full bg-[#512d23] px-5 py-3 text-sm font-bold text-white">Try again <ArrowUpRight className="h-4 w-4" /></button>}</div>;
}
