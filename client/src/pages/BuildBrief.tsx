import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Loader2, MapPin, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { VibeLayout, formatKes } from "@/components/VibeLayout";
import { InquiryPanel } from "@/components/InquiryPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { type AestheticName, useAestheticTheme } from "@/contexts/AestheticThemeContext";
import type { KenyanCity } from "@/lib/kenyaLocation";
import { trpc } from "@/lib/trpc";
import type { DemoBuild, DemoVendor } from "../../../server/vibebuild-data";

const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru"];
const lifestyles = ["Everyday", "Creative Work", "Celebration", "Home Refresh", "Hosting", "Campus"];
const aesthetics = ["Soft Power", "Thrift Remix", "Heritage Modern", "Comfort Official", "Coastal Ease"];
const priorities = ["Polish", "Value", "Warmth", "Presence", "Function"];

type RecommendationData = {
  build: DemoBuild;
  selectedVendors: DemoVendor[];
  withinBudget: boolean;
  budgetGapKes: number;
  transparencyNote: string;
};

function ChoiceRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  const { palette } = useAestheticTheme();
  return <div><p className="mb-3 text-sm font-semibold text-[#403429]">{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <button key={option} onClick={() => onChange(option)} style={value === option ? { borderColor: palette.primary, backgroundColor: palette.primary, color: palette.paper } : { borderColor: palette.border, backgroundColor: palette.paper, color: palette.ink }} className="vb-button vb-focus rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm">{option}</button>)}</div></div>;
}

export default function BuildBrief() {
  const { city: detectedCity, message: locationMessage, setCity: setPreferredCity } = useKenyaLocation();
  const { aesthetic, setAesthetic, palette } = useAestheticTheme();
  const [brief, setBrief] = useState({ budgetKes: 12000, city: "Nairobi", lifestyle: "Creative Work", aesthetic, priority: "Polish" });
  const [submitted, setSubmitted] = useState(false);
  const [cityEdited, setCityEdited] = useState(false);
  useEffect(() => {
    if (detectedCity && !cityEdited) {
      setBrief((current) => ({ ...current, city: detectedCity }));
      setSubmitted(false);
    }
  }, [detectedCity, cityEdited]);
  useEffect(() => {
    setBrief((current) => current.aesthetic === aesthetic ? current : { ...current, aesthetic });
    setSubmitted(false);
  }, [aesthetic]);
  const queryInput = useMemo(() => brief, [brief]);
  const recommendation = trpc.builds.recommend.useQuery(queryInput, { enabled: submitted });
  const revise = <K extends keyof typeof brief>(key: K, value: (typeof brief)[K]) => { setBrief((current) => ({ ...current, [key]: value })); setSubmitted(false); };

  return <VibeLayout>
    <main className="container pb-20 pt-8 sm:pt-12">
      <Link href="/" className="vb-focus inline-flex items-center gap-2 text-sm font-semibold text-[#665544] hover:text-[#a36530]"><ArrowLeft className="h-4 w-4" />Back to the overview</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:h-fit"><span className="vb-kicker text-[#9f5d2d]">Your build brief</span><h1 className="vb-serif mt-4 text-5xl leading-[0.94] tracking-[-0.045em] text-[#251f1a] sm:text-6xl">A plan that begins with <em className="font-normal text-[#aa6834]">what is real.</em></h1><p className="mt-5 max-w-md text-base leading-7 text-[#746656]">There is no ideal number here. Give us the spend, city, and feeling you want to create. We will show a transparent direction you can shape.</p><div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#e0d4c3] bg-[#fdfaf5] p-4 text-sm leading-6 text-[#665746]"><Sparkles className="h-5 w-5 shrink-0 text-[#ae6c36]" />Recommendations use clearly labelled demonstration vendors and indicative local pricing.</div></aside>
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#ddcfbd] bg-[#fbf8f2] p-5 shadow-[0_16px_40px_rgba(62,43,22,0.06)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#e6dccf] pb-5"><div><p className="vb-kicker text-[#9f5d2d]">Five clear inputs</p><h2 className="vb-serif mt-2 text-3xl text-[#211b16]">Shape your brief</h2></div><span className="rounded-full bg-[#eee0c7] px-3 py-1.5 text-xs font-bold text-[#775024]">01 / 01</span></div>
            <div className="mt-7 space-y-7">
              <div><label htmlFor="budget" className="text-sm font-semibold text-[#403429]">What would you like to spend?</label><div className="mt-3 flex items-center rounded-2xl border border-[#d7c9b8] bg-[#fffdf9] px-4 py-2"><span className="text-sm font-bold text-[#9e5d2d]">KES</span><input id="budget" type="number" min="500" step="500" value={brief.budgetKes} onChange={(event) => revise("budgetKes", Math.max(500, Number(event.target.value) || 500))} className="vb-focus w-full bg-transparent px-3 py-2 text-xl font-semibold text-[#261f19] outline-none" /></div><p className="mt-2 text-xs text-[#7c6d5b]">Start wherever makes sense. We will show an honest range, not a pressure point.</p></div>
              <div><ChoiceRow label="Which city are you sourcing from?" options={cities} value={brief.city} onChange={(value) => { setCityEdited(true); setPreferredCity(value as KenyanCity); revise("city", value); }} />{detectedCity && <p className="mt-3 inline-flex rounded-full bg-[#ede2cf] px-3 py-1.5 text-xs font-semibold text-[#78532e]">Using your selected city: {detectedCity}</p>}{locationMessage && !detectedCity && <p className="mt-3 text-xs leading-5 text-[#7b6854]">{locationMessage}</p>}</div>
              <ChoiceRow label="What is this build supporting?" options={lifestyles} value={brief.lifestyle} onChange={(value) => revise("lifestyle", value)} />
              <ChoiceRow label="Which direction feels most like you?" options={aesthetics} value={brief.aesthetic} onChange={(value) => { const nextAesthetic = value as AestheticName; setAesthetic(nextAesthetic); revise("aesthetic", nextAesthetic); }} />
              <ChoiceRow label="What matters most right now?" options={priorities} value={brief.priority} onChange={(value) => revise("priority", value)} />
              <button onClick={() => setSubmitted(true)} style={{ backgroundColor: palette.primary, color: palette.paper }} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold shadow-[0_12px_25px_rgba(39,28,18,0.14)]">Show my local build direction <ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </section>

          {submitted && <section aria-live="polite">
            {recommendation.isLoading && <div className="grid min-h-72 place-items-center rounded-[1.75rem] border border-[#ddcfbd] bg-[#fbf8f2] p-8 text-center"><div><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#a76531]" /><p className="vb-serif mt-4 text-2xl text-[#33281e]">Shaping the right edit…</p><p className="mt-2 text-sm text-[#756755]">Balancing spend, purpose, and local sources.</p></div></div>}
            {recommendation.isError && <div className="rounded-[1.75rem] border border-[#d99b88] bg-[#fff5f1] p-7"><CircleAlert className="h-6 w-6 text-[#a94732]" /><h2 className="vb-serif mt-3 text-2xl text-[#54261d]">We could not shape that plan just yet.</h2><p className="mt-2 text-sm leading-6 text-[#7a4132]">Please try again. Your brief has not been lost.</p><button onClick={() => recommendation.refetch()} className="vb-button vb-focus mt-5 rounded-full bg-[#54261d] px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>}
            {recommendation.data && <RecommendationResult data={recommendation.data as RecommendationData} />}
          </section>}
        </div>
      </div>
    </main>
  </VibeLayout>;
}

function RecommendationResult({ data }: { data: RecommendationData }) {
  const { build, selectedVendors, transparencyNote, withinBudget } = data;
  const { isAuthenticated } = useAuth();
  const savedSelections = trpc.board.selections.useQuery(undefined, { enabled: isAuthenticated });
  const saveBuild = trpc.board.saveBuild.useMutation({ onSuccess: () => savedSelections.refetch() });
  const isSaved = ((savedSelections.data ?? []) as { buildId: number | null }[]).some((selection) => selection.buildId === build.id);
  return <article className="overflow-hidden rounded-[1.75rem] border border-[#d7cab8] bg-[#fdfaf5] shadow-[0_20px_50px_rgba(62,43,22,0.08)]"><div className="relative min-h-[13rem] overflow-hidden bg-[#483626]"><img src={build.heroImageUrl} alt="Demonstration build aesthetic" className="absolute inset-0 h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-[#201911]/80 via-[#201911]/36 to-transparent" /><div className="relative max-w-lg p-6 sm:p-8"><span className="vb-kicker text-[#e7b46f]">Your demonstration edit</span><h2 className="vb-serif mt-3 text-4xl leading-[0.95] text-[#fff8ed]">{build.title}</h2><p className="mt-3 text-sm leading-6 text-[#eee0cf]">{build.headline}</p></div></div><div className="p-6 sm:p-8"><div className={`flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${withinBudget ? "border-[#d9cab3] bg-[#f4ebdc] text-[#59442d]" : "border-[#e3bcae] bg-[#fff2ed] text-[#7d4635]"}`}><Check className="mt-1 h-4 w-4 shrink-0" />{transparencyNote}</div><p className="mt-6 text-sm leading-6 text-[#706252]">{build.rationale}</p><div className="mt-7"><div className="flex items-end justify-between"><p className="vb-kicker text-[#9d5c2b]">Build breakdown</p><p className="vb-serif text-2xl text-[#261e18]">from {formatKes(build.totalMinKes)}</p></div><div className="mt-4 divide-y divide-[#e5dbce] border-y border-[#e5dbce]">{build.items.map((item) => <div key={item.id} className="flex gap-3 py-4"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#c1783c]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold text-[#30261d]">{item.label}</h3><strong className="text-sm text-[#32271e]">{formatKes(item.estimatedCostKes)}</strong></div><p className="mt-1 text-xs leading-5 text-[#7a6c5b]">{item.note}</p></div></div>)}</div></div><div className="mt-8 flex flex-wrap gap-3 border-t border-[#e5dbce] pt-6"><InquiryPanel buildId={build.id} contextName={build.title} triggerLabel="Ask about this plan" /><button onClick={() => isAuthenticated ? saveBuild.mutate({ buildId: build.id, shouldSave: !isSaved }) : startLogin()} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full border border-[#cfbda9] bg-[#fbf8f2] px-5 py-3.5 text-sm font-semibold text-[#513e2c] hover:border-[#a97843]">{isSaved ? "Saved to board" : "Save this build"}</button></div><div className="mt-8 border-t border-[#e5dbce] pt-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="vb-kicker text-[#9d5c2b]">Local sources in this plan</p><p className="mt-2 text-sm text-[#726454]">Explore the maker profiles before reaching out.</p></div><span className="inline-flex items-center gap-1 text-xs text-[#76624f]"><MapPin className="h-3.5 w-3.5 text-[#b77835]" />{build.city}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedVendors.map((vendor) => <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="vb-focus group rounded-2xl border border-[#ded2c3] bg-[#fbf8f2] p-4 hover:border-[#b88450]"><div className="flex items-center gap-3"><img src={vendor.portfolio[0]} alt="" className="h-11 w-11 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#352a20]">{vendor.name}</p><p className="mt-0.5 text-xs text-[#796a58]">{vendor.neighbourhood} · Demo profile</p></div><ArrowUpRight className="h-4 w-4 text-[#ac6831]" /></div></Link>)}</div></div></div></article>;
}
