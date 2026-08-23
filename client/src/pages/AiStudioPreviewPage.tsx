import { ArrowRight, Eye, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { ShowroomStage, type ShowroomKind } from "@/components/SuraShowroom";
import { VibeLayout } from "@/components/VibeLayout";

const previewLanes: Array<{ kind: ShowroomKind; label: string; copy: string }> = [
  { kind: "wardrobe_edit", label: "Wardrobe", copy: "Top, bottom, shoes, accessories, and fit reference." },
  { kind: "home_showroom", label: "Home", copy: "Anchor, layer, material, and lighting." },
  { kind: "vehicle_garage", label: "Garage", copy: "Body, finish, and wheel direction." },
  { kind: "detailing_bay", label: "Detail bay", copy: "Service, finish, and trim choices." },
  { kind: "product_edit", label: "Everyday object", copy: "Form, material, and finish." },
  { kind: "tattoo_concept", label: "Ink", copy: "Placement, line, and mood." },
  { kind: "pet_accessory", label: "Pet piece", copy: "Useful companion accessories." },
];

export default function AiStudioPreviewPage() {
  const [kind, setKind] = useState<ShowroomKind>("wardrobe_edit");
  const [demoSummary, setDemoSummary] = useState("");

  return <VibeLayout>
    <main className="px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[var(--sura-border)] bg-[var(--sura-primary)] p-6 text-[var(--sura-paper)] sm:p-9">
        <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-[var(--sura-accent)]/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div><p className="vb-kicker text-[var(--sura-accent)]">SURA / AI STUDIO PREVIEW</p><h1 className="vb-serif mt-3 max-w-3xl text-5xl leading-[0.94] sm:text-6xl">See the idea before you buy the thing.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">Explore a safe sample of the SURA Showroom. Revolve a direction, change the parts, and see how the same thinking can work for clothing, rooms, cars, objects, pets, and self-expression.</p></div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4"><Eye className="h-5 w-5 text-[var(--sura-accent)]" /><p className="text-sm font-bold">Read-only demo</p></div><div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4"><LockKeyhole className="h-5 w-5 text-[var(--sura-accent)]" /><p className="text-sm font-bold">No account or upload</p></div><div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4"><Sparkles className="h-5 w-5 text-[var(--sura-accent)]" /><p className="text-sm font-bold">Built for real briefs</p></div></div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="preview-lanes-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="vb-kicker text-[var(--sura-accent)]">Choose a showroom lane</p><h2 id="preview-lanes-heading" className="vb-serif mt-2 text-3xl text-[var(--sura-ink)]">One visual system, many kinds of life.</h2></div><Link href="/join" className="vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-[var(--sura-paper)] px-4 py-2.5 text-xs font-black text-[var(--sura-ink)]">Open private AI Studio <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-5 flex gap-3 overflow-x-auto pb-2">{previewLanes.map((lane) => <button key={lane.kind} onClick={() => { setKind(lane.kind); setDemoSummary(""); }} className={`vb-focus min-w-[12rem] rounded-2xl border p-4 text-left ${kind === lane.kind ? "border-[var(--sura-primary)] bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "border-[var(--sura-border)] bg-[var(--sura-paper)] text-[var(--sura-ink)]"}`} aria-pressed={kind === lane.kind}><p className="text-sm font-black">{lane.label}</p><p className={`mt-1 text-xs leading-5 ${kind === lane.kind ? "text-white/75" : "text-[var(--sura-ink)]/65"}`}>{lane.copy}</p></button>)}</div></section>

      <ShowroomStage kind={kind} aesthetic="Soft Power" preview onUseForBrief={setDemoSummary} />
      {demoSummary && <p className="mt-4 rounded-xl border border-[var(--sura-border)] bg-[var(--sura-soft)] p-4 text-sm font-semibold text-[var(--sura-ink)]" role="status">Demo brief ready: {demoSummary}. Nothing has been saved. <Link href="/join" className="font-black underline underline-offset-2">Sign in to keep it</Link>.</p>}
    </main>
  </VibeLayout>;
}
