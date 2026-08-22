import { Camera, Check, FileImage, ImagePlus, Loader2, LockKeyhole, MapPin, Sparkles, WandSparkles } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { SuraErrorState, SuraProcessing } from "@/components/SuraStates";
import { useAuth } from "@/_core/hooks/useAuth";
import { AESTHETIC_THEMES, useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { trpc } from "@/lib/trpc";

const journeys = [
  { value: "home_refresh", label: "Home refresh", copy: "A room direction, local categories, and an after-concept." },
  { value: "personal_style", label: "Personal style", copy: "A private outfit direction with clothing and shoe filters." },
  { value: "footwear_fit", label: "Footwear", copy: "A shoe direction grounded in your stated size and occasion." },
  { value: "inspiration", label: "Inspiration only", copy: "A visual direction without a purchase prompt." },
] as const;

type JourneyKind = (typeof journeys)[number]["value"];

export default function AiStudioPage() {
  const { isAuthenticated } = useAuth();
  const { city } = useKenyaLocation();
  const { aesthetic, palette, preferenceMix } = useAestheticTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<JourneyKind>("home_refresh");
  const [brief, setBrief] = useState("");
  const [budgetKes, setBudgetKes] = useState(25000);
  const [sizeProfile, setSizeProfile] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageName, setImageName] = useState("");
  const [consent, setConsent] = useState(false);
  const assist = trpc.commerce.aiAssist.useMutation();
  const savedAestheticMix = trpc.account.aestheticPreferences.useQuery(undefined, { enabled: isAuthenticated });
  const activeJourney = journeys.find((journey) => journey.value === kind)!;
  const selectedCity = city ?? "Nairobi";
  const persistedMix = (savedAestheticMix.data?.aesthetics ?? []).filter((name): name is keyof typeof AESTHETIC_THEMES => name in AESTHETIC_THEMES);
  const aestheticMix = persistedMix.length ? persistedMix : preferenceMix;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      setImageDataUrl(undefined);
      setImageName("Choose a JPEG, PNG, or WebP image below 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return <DashboardLayout eyebrow="SURA / AI STUDIO" title="A private image needs a private space." description="Sign in to use the SURA AI studio. Uploaded images, consent records, and generated concepts remain tied to your account."><Link href="/join" className="vb-button vb-focus inline-flex rounded-full bg-[var(--sura-primary)] px-6 py-3 text-sm font-bold text-[var(--sura-paper)]">Sign in to continue</Link></DashboardLayout>;
  }

  return <DashboardLayout eyebrow="SURA / AI STUDIO" title="Turn the picture into a way forward." description="Use an optional room or personal image, a real budget, and the direction you want to reach. SURA returns a private, structured plan—not a promise.">
    <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
      <aside className="rounded-[1.6rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-6">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: palette.primary, color: palette.accent }} className="grid h-10 w-10 place-items-center rounded-2xl"><WandSparkles className="h-5 w-5" /></div>
          <div><p className="vb-kicker text-[var(--sura-accent)]">Private assistance</p><p className="vb-serif mt-1 text-2xl">Built with permission.</p></div>
        </div>
        <div className="mt-6 space-y-4 border-y border-[var(--sura-border)] py-5 text-sm leading-6 text-[#706252]">
          <p><LockKeyhole className="mr-2 inline h-4 w-4 text-[var(--sura-accent)]" />Images are private by default, stored as a secure reference, and used only for this request.</p>
          <p><MapPin className="mr-2 inline h-4 w-4 text-[var(--sura-accent)]" />Your city is <strong>{selectedCity}</strong>. You can change it from the public header.</p>
          <p><Sparkles className="mr-2 inline h-4 w-4 text-[var(--sura-accent)]" />The after image is an <strong>AI concept</strong>, not a guarantee of final room, fit, stock, or delivery outcomes.</p>
        </div>
        <div className="mt-6 rounded-2xl bg-[var(--sura-primary)] p-5 text-[var(--sura-paper)]"><p className="vb-kicker text-[var(--sura-accent)]">Current aesthetic</p><p className="vb-serif mt-2 text-3xl">{aesthetic}</p><p className="mt-3 text-sm leading-6 text-white/75">Your palette frames this direction. Your saved mix gives the AI a creative lens; your written goal remains in charge.</p><div className="mt-4 flex flex-wrap gap-1.5">{aestheticMix.map((name) => <span key={name} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.68rem] font-bold">{name}</span>)}</div></div>
      </aside>

      <section className="rounded-[1.6rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="vb-kicker text-[var(--sura-accent)]">Your requested direction</p><h2 className="vb-serif mt-2 text-4xl">Shape the brief</h2></div><span className="rounded-full bg-[var(--sura-muted)] px-3 py-2 text-xs font-bold text-[var(--sura-primary)]">Secure web flow</span></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">{journeys.map((journey) => <button key={journey.value} onClick={() => setKind(journey.value)} className={`vb-focus rounded-2xl border p-4 text-left ${kind === journey.value ? "border-[var(--sura-primary)] bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "border-[var(--sura-border)] bg-white text-[var(--sura-ink)]"}`}><p className="font-bold">{journey.label}</p><p className={`mt-1 text-xs leading-5 ${kind === journey.value ? "text-white/75" : "text-[#776957]"}`}>{journey.copy}</p></button>)}</div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_10rem]">
          <label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">What are you trying to achieve?</span><textarea value={brief} onChange={(event) => setBrief(event.target.value)} className="vb-focus mt-2 min-h-28 w-full rounded-xl border border-[var(--sura-border)] bg-white p-3 text-sm" placeholder="For example: I want a small living room that feels warm, social, and not crowded under KES 25,000." /></label>
          <label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Budget (KES)</span><input type="number" min="500" value={budgetKes} onChange={(event) => setBudgetKes(Math.max(500, Number(event.target.value) || 500))} className="vb-focus mt-2 w-full rounded-xl border border-[var(--sura-border)] bg-white px-3 py-3 text-sm" /><span className="mt-4 block text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Size / fit notes</span><input value={sizeProfile} onChange={(event) => setSizeProfile(event.target.value)} placeholder={kind === "footwear_fit" ? "e.g. EU 39" : "Optional"} className="vb-focus mt-2 w-full rounded-xl border border-[var(--sura-border)] bg-white px-3 py-3 text-sm" /></label>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--sura-border)] bg-[var(--sura-page)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold">Optional private image</p><p className="mt-1 text-xs leading-5 text-[#756655]">A room or personal image can make this direction more grounded. JPEG, PNG, and WebP only.</p></div><div className="flex gap-2"><button onClick={() => fileInput.current?.click()} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-white px-4 py-2.5 text-xs font-bold"><FileImage className="h-4 w-4" />Upload</button><button onClick={() => cameraInput.current?.click()} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[var(--sura-primary)] px-4 py-2.5 text-xs font-bold text-[var(--sura-paper)]"><Camera className="h-4 w-4" />Camera</button></div></div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} /><input ref={cameraInput} type="file" accept="image/jpeg,image/png,image/webp" capture={kind === "personal_style" ? "user" : "environment"} className="hidden" onChange={handleFile} />
          {imageDataUrl && <div className="mt-4 flex items-center gap-4"><img src={imageDataUrl} alt="Private upload preview" className="h-16 w-16 rounded-xl object-cover" /><p className="text-xs text-[#756655]">{imageName}</p></div>}{imageName && !imageDataUrl && <p className="mt-3 text-xs text-[#9a4936]">{imageName}</p>}
        </div>
        <label className="mt-6 flex gap-3 rounded-xl border border-[var(--sura-border)] bg-white p-4 text-xs leading-5 text-[#655647]"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 accent-[var(--sura-primary)]" /><span>I allow SURA to use this optional image and brief only to create this private {activeJourney.label.toLowerCase()} plan and AI concept. I understand the output is assistive, not a guarantee or identity judgement.</span></label>
        {assist.isError && <div className="mt-4"><SuraErrorState title="Your private plan needs another moment." copy="Check the image size and consent, then try again. Your brief is still here." onRetry={() => assist.reset()} /></div>}
        <button disabled={!brief || !consent || assist.isPending} onClick={() => assist.mutate({ kind, purposeConsent: true, brief, city: selectedCity, budgetKes, sizeProfile: sizeProfile || undefined, imageDataUrl, aestheticMix })} className="vb-button vb-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sura-primary)] px-6 py-4 text-sm font-bold text-[var(--sura-paper)] disabled:cursor-wait disabled:opacity-60">{assist.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Creating your private direction</> : <><ImagePlus className="h-4 w-4" />Create my AI concept</>}</button>
      </section>
    </div>
    {assist.isPending && <section className="mt-7"><SuraProcessing eyebrow="SURA / PRIVATE AI" title="Building your concept with care." copy="Your private image and stated goal are being translated into an assistive direction. This can take a little longer than a normal page load." /></section>}
    {assist.data && <section className="mt-7 overflow-hidden rounded-[1.8rem] border border-[var(--sura-border)] bg-[var(--sura-paper)]"><div className="grid lg:grid-cols-[0.85fr_1.15fr]"><div className="min-h-80 bg-[var(--sura-primary)] p-6 text-[var(--sura-paper)]"><p className="vb-kicker text-[var(--sura-accent)]">AI concept · not a guaranteed outcome</p><img src={assist.data.generatedImageUrl} alt="AI-generated concept for the requested aesthetic direction" className="mt-5 h-64 w-full rounded-2xl object-cover" /></div><div className="p-7 sm:p-9"><p className="vb-kicker text-[var(--sura-accent)]">Your private plan</p><h2 className="vb-serif mt-3 text-4xl">{assist.data.plan.title}</h2><p className="mt-4 text-sm leading-7 text-[#706252]">{assist.data.plan.designDirection}</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">What to prioritise</p><ul className="mt-3 space-y-2 text-sm">{assist.data.plan.priorities.map((priority) => <li key={priority} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-[var(--sura-accent)]" />{priority}</li>)}</ul></div><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Product categories to explore</p><div className="mt-3 flex flex-wrap gap-2">{assist.data.plan.recommendedCategories.map((category) => <span key={category} className="rounded-full border border-[var(--sura-border)] px-3 py-2 text-xs font-bold">{category}</span>)}</div></div></div><p className="mt-6 rounded-xl bg-[var(--sura-muted)] p-4 text-sm leading-6">{assist.data.plan.shoppingLens}</p><p className="mt-3 text-xs leading-5 text-[#756655]">{assist.data.plan.safetyNote}</p><Link href="/shop" className="vb-button vb-focus mt-6 inline-flex rounded-full bg-[var(--sura-primary)] px-5 py-3 text-sm font-bold text-[var(--sura-paper)]">Explore connected company products</Link></div></div></section>}
  </DashboardLayout>;
}
