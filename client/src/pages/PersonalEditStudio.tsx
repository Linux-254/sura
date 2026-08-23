import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, Camera, CheckCircle2, FileImage, LampDesk, LockKeyhole, Palette, PenTool, Shirt, Sofa, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { SuraEmptyState, SuraErrorState, SuraPageSkeleton, SuraProcessing } from "@/components/SuraStates";
import { useAuth } from "@/_core/hooks/useAuth";
import { AESTHETIC_THEMES, useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { AESTHETIC_EXPRESSIONS } from "@/lib/aestheticExpressions";
import { trpc } from "@/lib/trpc";

const editModes = [
  { type: "wardrobe", label: "Wardrobe", eyebrow: "Your own pieces and purchase references", safeguard: "A creative wardrobe edit only. SURA does not infer body measurements, guarantee fit, or present saved items as live inventory.", icon: Shirt },
  { type: "tattoo", label: "Tattoo concept", eyebrow: "Artwork and placement conversation", safeguard: "Concept and placement exploration only. Tattooing is permanent; consult a qualified artist and appropriate health guidance before any procedure.", icon: PenTool },
  { type: "room", label: "Room", eyebrow: "Mood, composition, and next questions", safeguard: "Assistive composition only. Do not treat this as structural, fire-safety, or load-bearing approval.", icon: Sofa },
  { type: "books", label: "Books", eyebrow: "Shelves, pairings, and visual rhythm", safeguard: "A creative arrangement prompt only; keep pathways, stability, and practical household safety in your own judgement.", icon: BookOpen },
  { type: "lighting", label: "Lighting", eyebrow: "Atmosphere, placement, and focal points", safeguard: "A mood prompt, not electrical or installation advice. Consult a qualified professional for wiring or permanent changes.", icon: LampDesk },
  { type: "inspiration", label: "Inspiration", eyebrow: "Private references that evolve your direction", safeguard: "A private reference library, not a product catalogue or identity assessment.", icon: Palette },
] as const;

type EditType = (typeof editModes)[number]["type"];
const activeEditPreferenceKey = "sura.personal-edit.active-type";

const arrangementPrompts: Partial<Record<EditType, string[]>> = {
  room: ["Choose one visual anchor before adding smaller objects.", "Leave a clear circulation route, then test the room from where you actually enter.", "Name one practical question for a qualified professional if the idea changes structure or wiring."],
  books: ["Begin with a shelf rhythm: one tall group, one horizontal stack, and space to rest the eye.", "Pair books with one personal object or material rather than filling every surface.", "Check stability, weight, and clear access in your own environment before settling the arrangement."],
  lighting: ["Layer ambient, task, and accent light instead of relying on one bright source.", "Pick one focal glow, then note how the rest of the room should soften around it.", "Keep a separate question for a qualified professional before making any wiring or permanent installation change."],
};

function readTags(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function makeDailyVibe(input: { mix: string[]; tags: string[]; fallback: string }) {
  const base = input.mix[0] && input.mix[0] in AESTHETIC_EXPRESSIONS ? AESTHETIC_EXPRESSIONS[input.mix[0] as keyof typeof AESTHETIC_EXPRESSIONS] : undefined;
  const cues = base?.cues.slice(0, 2) ?? ["one deliberate material", "a clear focal point"];
  const privateCue = input.tags[0] ? `Return to your private cue: “${input.tags[0]}.”` : "Start with one saved reference or one thing you already own.";
  return `${base?.mood ?? input.fallback} Today, try ${cues.join(" with ")}. ${privateCue}`;
}

export default function PersonalEditStudio() {
  const { isAuthenticated } = useAuth();
  const { aesthetic, preferenceMix } = useAestheticTheme();
  const utils = trpc.useUtils();
  const fileInput = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<EditType>(() => {
    if (typeof window === "undefined") return "wardrobe";
    const saved = window.localStorage.getItem(activeEditPreferenceKey);
    return editModes.some((mode) => mode.type === saved) ? saved as EditType : "wardrobe";
  });
  const [selectedCollectionId, setSelectedCollectionId] = useState<number>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemNote, setItemNote] = useState("");
  const [tagText, setTagText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageName, setImageName] = useState("");
  const [analysisConsent, setAnalysisConsent] = useState(false);

  const collections = trpc.personalEdits.collections.useQuery(undefined, { enabled: isAuthenticated });
  const items = trpc.personalEdits.items.useQuery(undefined, { enabled: isAuthenticated });
  const savedAesthetics = trpc.account.aestheticPreferences.useQuery(undefined, { enabled: isAuthenticated });
  const createCollection = trpc.personalEdits.createCollection.useMutation({ onSuccess: () => { setCollectionTitle(""); void utils.personalEdits.collections.invalidate(); } });
  const createItem = trpc.personalEdits.createItem.useMutation({ onSuccess: () => { setItemTitle(""); setItemNote(""); setTagText(""); setImageDataUrl(undefined); setImageName(""); setAnalysisConsent(false); void utils.personalEdits.items.invalidate(); } });
  const activeMode = editModes.find((mode) => mode.type === activeType)!;
  const activeCollections = useMemo(() => (collections.data ?? []).filter((collection) => collection.editType === activeType), [activeType, collections.data]);
  const activeCollection = activeCollections.find((collection) => collection.id === selectedCollectionId) ?? activeCollections[0];
  const activeItems = useMemo(() => (items.data ?? []).filter((item) => item.itemType === activeType && item.collectionId === activeCollection?.id), [activeCollection?.id, activeType, items.data]);
  const selectedItem = activeItems[currentIndex];
  const savedMix = (savedAesthetics.data?.aesthetics ?? []).filter((name): name is keyof typeof AESTHETIC_THEMES => name in AESTHETIC_THEMES);
  const mix = savedMix.length ? savedMix : preferenceMix;
  const allTags = activeItems.flatMap((item) => readTags(item.tags));
  const dailyVibe = makeDailyVibe({ mix, tags: allTags, fallback: `A ${aesthetic.toLowerCase()} direction can begin with a small, intentional edit.` });

  useEffect(() => { window.localStorage.setItem(activeEditPreferenceKey, activeType); }, [activeType]);
  useEffect(() => { setCurrentIndex(0); setSelectedCollectionId(undefined); }, [activeType]);
  useEffect(() => setCurrentIndex(0), [activeCollection?.id]);

  const move = (step: number) => {
    if (!activeItems.length) return;
    setCurrentIndex((current) => (current + step + activeItems.length) % activeItems.length);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      setImageDataUrl(undefined);
      setImageName("Choose a JPEG, PNG, or WebP image below 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setImageDataUrl(String(reader.result)); setImageName(file.name); };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return <DashboardLayout eyebrow="SURA / PERSONAL EDITS" title="A private edit belongs in a private space." description="Sign in to keep a personal wardrobe, concept, room, book, light, or inspiration direction tied only to your account."><Link href="/join" className="vb-button vb-focus inline-flex rounded-full bg-[var(--sura-primary)] px-6 py-3 text-sm font-bold text-[var(--sura-paper)]">Sign in to continue</Link></DashboardLayout>;
  }

  if (collections.isLoading || items.isLoading) {
    return <DashboardLayout eyebrow="SURA / PERSONAL EDITS" title="Your private edit studio." description="Loading your account-owned collections and references."><SuraPageSkeleton cards={3} dashboard /></DashboardLayout>;
  }

  if (collections.isError || items.isError) {
    return <DashboardLayout eyebrow="SURA / PERSONAL EDITS" title="Your private edit studio." description="This area keeps your own creative references account-bound."><SuraErrorState title="Your edit studio needs another moment." copy="Your saved references have not been replaced. Try loading the private studio again." onRetry={() => { void collections.refetch(); void items.refetch(); }} /></DashboardLayout>;
  }

  return <DashboardLayout eyebrow="SURA / PERSONAL EDITS" title="A private room for your next direction." description="Save the references you choose, then move through them at your pace. No auto-play, no fit claims, and no public gallery.">
    <section className="overflow-hidden rounded-[1.75rem] border border-[var(--sura-border)] bg-[var(--sura-primary)] p-6 text-[var(--sura-paper)] sm:p-8">
      <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end"><div><p className="vb-kicker text-[var(--sura-accent)]">Vibe for today · private creative cue</p><h2 className="vb-serif mt-3 max-w-2xl text-4xl leading-[0.98] sm:text-5xl">{dailyVibe}</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/75">Built only from your selected aesthetics and tags you have saved here. It is not an identity score, a behavioural prediction, or a purchase promise.</p></div><div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-5"><p className="vb-kicker text-[var(--sura-accent)]">Your creative lens</p><div className="mt-4 flex flex-wrap gap-2">{mix.map((name) => <span key={name} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold">{name}</span>)}</div><p className="mt-5 text-xs leading-5 text-white/70">Your written choices lead. SURA only uses these directions as optional creative framing.</p></div></div>
    </section>

    <section className="mt-7 rounded-[1.75rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-4 sm:p-6">
      <div role="tablist" aria-label="Personal edit categories" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{editModes.map((mode) => { const Icon = mode.icon; const active = mode.type === activeType; return <button key={mode.type} role="tab" aria-selected={active} onClick={() => setActiveType(mode.type)} className={`vb-focus flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${active ? "border-[var(--sura-primary)] bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "border-[var(--sura-border)] bg-[var(--sura-page)] text-[var(--sura-ink)]"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-white/10 text-[var(--sura-accent)]" : "bg-[var(--sura-muted)] text-[var(--sura-accent)]"}`}><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-bold">{mode.label}</span><span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-[#756655]"}`}>{mode.eyebrow}</span></span></button>; })}</div>
    </section>

    <section role="tabpanel" className="mt-7 grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[1.75rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="vb-kicker text-[var(--sura-accent)]">{activeMode.label} edit rail</p><h2 className="vb-serif mt-2 text-4xl">Move by choice.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#756655]">{activeMode.safeguard}</p></div>{activeItems.length > 0 && <div aria-live="polite" className="rounded-full bg-[var(--sura-muted)] px-3 py-2 text-xs font-bold text-[var(--sura-primary)]">Reference {currentIndex + 1} of {activeItems.length}</div>}</div>
        {activeCollections.length > 1 && <div className="mt-5 rounded-2xl border border-[var(--sura-border)] bg-[var(--sura-page)] p-3"><p className="px-1 text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Choose a private collection</p><div className="mt-2 flex flex-wrap gap-2">{activeCollections.map((collection) => <button key={collection.id} onClick={() => setSelectedCollectionId(collection.id)} aria-pressed={activeCollection?.id === collection.id} className={`vb-focus rounded-full border px-3 py-2 text-xs font-bold ${activeCollection?.id === collection.id ? "border-[var(--sura-primary)] bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "border-[var(--sura-border)] bg-white text-[var(--sura-primary)]"}`}>{collection.title}</button>)}</div></div>}
        {arrangementPrompts[activeType] && <div className="mt-5 rounded-2xl border border-[var(--sura-border)] bg-[var(--sura-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--sura-accent)]">Assistive composition prompts</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[#655647]">{arrangementPrompts[activeType].map((prompt) => <li key={prompt} className="flex gap-2"><Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--sura-accent)]" />{prompt}</li>)}</ul></div>}
        {activeCollection && activeItems.length > 0 ? <div className="mt-7"><div className="sura-edit-stage relative overflow-hidden rounded-[1.5rem] border border-[var(--sura-border)] bg-[var(--sura-page)] p-5 sm:p-7"><article key={selectedItem.id} className="sura-edit-card min-h-80 rounded-[1.3rem] bg-[var(--sura-paper)] p-5 shadow-[0_18px_42px_rgba(60,42,22,0.08)] sm:p-7"><div className="grid h-full gap-6 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">{selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt={`Private saved reference titled ${selectedItem.title}`} className="h-52 w-full rounded-2xl object-cover sm:h-64" /> : <div aria-hidden="true" className="grid h-52 place-items-center rounded-2xl bg-[var(--sura-primary)] text-[var(--sura-accent)] sm:h-64"><Sparkles className="h-10 w-10" /></div>}<div><p className="vb-kicker text-[var(--sura-accent)]">Private saved reference</p><h3 className="vb-serif mt-3 text-4xl leading-[0.96]">{selectedItem.title}</h3>{selectedItem.note && <p className="mt-4 text-sm leading-6 text-[#706252]">{selectedItem.note}</p>}<div className="mt-5 flex flex-wrap gap-2">{readTags(selectedItem.tags).map((tag) => <span key={tag} className="rounded-full border border-[var(--sura-border)] px-3 py-1.5 text-xs font-bold text-[var(--sura-primary)]">{tag}</span>)}</div></div></div></article></div><div className="mt-4 flex items-center justify-between gap-4"><button onClick={() => move(-1)} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-white px-4 py-2.5 text-xs font-bold" aria-label="Show previous private reference"><ArrowLeft className="h-4 w-4" />Previous</button><p className="text-center text-xs leading-5 text-[#756655]">Manual controls only. This rail never advances by itself.</p><button onClick={() => move(1)} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[var(--sura-primary)] px-4 py-2.5 text-xs font-bold text-[var(--sura-paper)]" aria-label="Show next private reference">Next<ArrowRight className="h-4 w-4" /></button></div></div> : activeCollection ? <SuraEmptyState title={`Nothing is saved in this ${activeMode.label.toLowerCase()} edit yet.`} copy="Create a reference below. It will remain tied to this account and private by default." /> : <div className="mt-7 rounded-[1.5rem] border border-dashed border-[var(--sura-border)] bg-[var(--sura-page)] p-6"><p className="vb-serif text-3xl">Start this edit intentionally.</p><p className="mt-3 max-w-lg text-sm leading-6 text-[#756655]">Name your private {activeMode.label.toLowerCase()} collection before adding a note or image. You can keep up to 24 focused collections.</p><form onSubmit={(event) => { event.preventDefault(); if (collectionTitle.trim()) createCollection.mutate({ title: collectionTitle, editType: activeType }); }} className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="collection-title">Collection title</label><input id="collection-title" value={collectionTitle} onChange={(event) => setCollectionTitle(event.target.value)} maxLength={120} placeholder={`e.g. ${activeMode.label} study`} className="vb-focus min-w-0 flex-1 rounded-full border border-[var(--sura-border)] bg-white px-4 py-3 text-sm" /><button disabled={!collectionTitle.trim() || createCollection.isPending} className="vb-button vb-focus rounded-full bg-[var(--sura-primary)] px-5 py-3 text-sm font-bold text-[var(--sura-paper)] disabled:cursor-wait disabled:opacity-60">{createCollection.isPending ? "Creating…" : "Create private edit"}</button></form>{createCollection.isError && <p className="mt-3 text-xs font-semibold text-[#9a4936]">{createCollection.error.message}</p>}</div>}</div>
      {activeCollection && <aside className="rounded-[1.75rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-5 sm:p-7"><p className="vb-kicker text-[var(--sura-accent)]">Add a private reference</p><h2 className="vb-serif mt-2 text-4xl">Keep the detail that matters.</h2><p className="mt-3 text-sm leading-6 text-[#756655]">A note is enough. An image is optional, private by default, and stored as a secure reference rather than in the database.</p><form onSubmit={(event) => { event.preventDefault(); if (!itemTitle.trim()) return; const tags = tagText.split(",").map((tag) => tag.trim()).filter(Boolean); createItem.mutate({ collectionId: activeCollection.id, itemType: activeType, title: itemTitle, note: itemNote.trim() || undefined, tags, imageDataUrl, analysisConsent }); }} className="mt-6 space-y-4"><label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Reference title</span><input value={itemTitle} onChange={(event) => setItemTitle(event.target.value)} maxLength={160} placeholder="What do you want to remember?" className="vb-focus mt-2 w-full rounded-xl border border-[var(--sura-border)] bg-white px-3 py-3 text-sm" /></label><label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Private note</span><textarea value={itemNote} onChange={(event) => setItemNote(event.target.value)} maxLength={2000} className="vb-focus mt-2 min-h-24 w-full rounded-xl border border-[var(--sura-border)] bg-white p-3 text-sm" placeholder="A material, placement, pairing, or next question." /></label><label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#725f4c]">Creative cues</span><input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="e.g. cobalt, linen, high shelf" className="vb-focus mt-2 w-full rounded-xl border border-[var(--sura-border)] bg-white px-3 py-3 text-sm" /><span className="mt-2 block text-xs text-[#756655]">Separate up to 12 short cues with commas.</span></label><div className="rounded-2xl border border-dashed border-[var(--sura-border)] bg-[var(--sura-page)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold">Optional private image</p><p className="mt-1 text-xs leading-5 text-[#756655]">JPEG, PNG, or WebP under 5 MB. SURA will not analyse it unless you explicitly consent for a future private request.</p></div><button type="button" onClick={() => fileInput.current?.click()} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-white px-4 py-2.5 text-xs font-bold"><FileImage className="h-4 w-4" />Choose image</button></div><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />{imageDataUrl && <div className="mt-4 flex items-center gap-3"><img src={imageDataUrl} alt="Private image selected for saving" className="h-14 w-14 rounded-xl object-cover" /><span className="text-xs text-[#756655]">{imageName}</span></div>}{imageName && !imageDataUrl && <p className="mt-3 text-xs font-semibold text-[#9a4936]">{imageName}</p>}</div>{imageDataUrl && <label className="flex gap-3 rounded-xl border border-[var(--sura-border)] bg-white p-4 text-xs leading-5 text-[#655647]"><input checked={analysisConsent} onChange={(event) => setAnalysisConsent(event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--sura-primary)]" /><span>I allow SURA to remember my explicit consent if I later choose to request a private visual analysis of this image. Saving alone does not trigger analysis.</span></label>}{createItem.isError && <p className="text-xs font-semibold text-[#9a4936]">{createItem.error.message}</p>}<button disabled={!itemTitle.trim() || createItem.isPending} className="vb-button vb-focus inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sura-primary)] px-5 py-3.5 text-sm font-bold text-[var(--sura-paper)] disabled:cursor-wait disabled:opacity-60">{createItem.isPending ? "Saving privately…" : <><LockKeyhole className="h-4 w-4" />Save to my private edit</>}</button></form></aside>}
    </section>
    {createItem.isPending && <section className="mt-7"><SuraProcessing eyebrow="SURA / PRIVATE SAVE" title="Saving your reference with care." copy="Your private note and optional image are being linked to this account-owned collection." /></section>}
    <section className="mt-7 rounded-[1.5rem] border border-[var(--sura-border)] bg-[var(--sura-muted)] p-5 text-sm leading-6 text-[#655647]"><p className="flex items-center gap-2 font-bold text-[var(--sura-primary)]"><CheckCircle2 className="h-4 w-4 text-[var(--sura-accent)]" />Creative assistance has deliberate limits.</p><p className="mt-2">SURA supports reflection and composition. It does not assess bodies, skin, pain, healing, infection risk, electrical work, structural safety, product availability, or final results.</p></section>
  </DashboardLayout>;
}
