import React, { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AESTHETIC_THEMES, type AestheticName, useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { AESTHETIC_EXPRESSIONS } from "@/lib/aestheticExpressions";
import { SuraErrorState, SuraProcessing } from "@/components/SuraStates";

const aestheticEntries = Object.entries(AESTHETIC_THEMES) as [AestheticName, (typeof AESTHETIC_THEMES)[AestheticName]][];

export function AestheticCuration({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const preferences = trpc.account.aestheticPreferences.useQuery();
  const update = trpc.account.setAestheticPreferences.useMutation({ onSuccess: () => preferences.refetch() });
  const { aesthetic, setPreferenceMix } = useAestheticTheme();
  const [selected, setSelected] = useState<AestheticName[]>([aesthetic]);

  useEffect(() => {
    if (preferences.data) {
      const saved = preferences.data.aesthetics.filter((name): name is AestheticName => name in AESTHETIC_THEMES);
      setSelected(saved.length ? saved : [aesthetic]);
    }
  }, [preferences.data, aesthetic]);

  if (preferences.isLoading) return alwaysVisible ? <SuraProcessing eyebrow="SURA / YOUR DIRECTION" title="Finding your saved mix." copy="Your private aesthetic preferences are loading." /> : null;
  if (preferences.isError) return alwaysVisible ? <SuraErrorState title="Your aesthetic mix is unavailable right now." copy="Please try again before saving a new direction." onRetry={() => preferences.refetch()} /> : null;
  if (!alwaysVisible && preferences.data?.onboardingComplete) return null;

  const toggle = (name: AestheticName) => {
    setSelected((current) => {
      if (current.includes(name)) return current.length === 1 ? current : current.filter((item) => item !== name);
      return current.length >= 5 ? current : [...current, name];
    });
  };
  const makePrimary = (name: AestheticName) => setSelected((current) => [name, ...current.filter((item) => item !== name)]);
  const save = async () => {
    await update.mutateAsync({ aesthetics: selected });
    setPreferenceMix(selected);
  };

  return <section className="mb-7 overflow-hidden rounded-[1.65rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] shadow-[0_14px_34px_rgba(55,39,19,0.06)]"><div className="grid lg:grid-cols-[0.72fr_1.28fr]"><div className="bg-[var(--sura-primary)] p-6 text-[var(--sura-paper)] sm:p-8"><p className="vb-kicker text-[var(--sura-accent)]">{preferences.data?.onboardingComplete ? "Your saved aesthetic mix" : "Start with your point of view"}</p><h2 className="vb-serif mt-3 text-3xl leading-[0.98]">Choose up to five directions that feel like yours.</h2><p className="mt-4 text-sm leading-6 text-white/75">Your first choice sets the active SURA palette. The full mix informs personal expression prompts, not a score of your taste.</p><div className="mt-7 rounded-2xl border border-white/15 bg-white/8 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sura-accent)]">{selected.length} of 5 selected</p><p className="mt-2 text-sm leading-6 text-white/80">Start with one and add the other directions that make your home, outfit, or occasion feel more like you.</p></div></div><div className="p-5 sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="vb-kicker text-[var(--sura-accent)]">Your expression board</p><p className="mt-2 text-sm leading-6 text-[#756655]">The primary direction is used first. Select a card to add or remove it; selected directions can be made primary.</p></div><Sparkles className="mt-1 h-5 w-5 shrink-0 text-[var(--sura-accent)]" /></div><div className="grid gap-3 sm:grid-cols-2">{aestheticEntries.map(([name, palette]) => { const active = selected.includes(name); const primary = selected[0] === name; const expression = AESTHETIC_EXPRESSIONS[name]; return <article key={name} className={`rounded-2xl border p-4 transition-colors ${active ? "border-[var(--sura-accent)] bg-[var(--sura-soft)]" : "border-[var(--sura-border)] bg-white/40"}`}><button type="button" onClick={() => toggle(name)} className="vb-focus w-full text-left"><div className="flex items-start gap-3"><span className="h-10 w-10 shrink-0 rounded-xl border border-black/10 shadow-inner" style={{ background: `linear-gradient(135deg, ${palette.paper} 0%, ${palette.soft} 48%, ${palette.accent} 100%)` }} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="text-sm text-[var(--sura-ink)]">{name}</strong>{active && <Check className="h-4 w-4 text-[var(--sura-accent)]" />}</span><span className="mt-1 block text-xs leading-5 text-[#756655]">{expression.mood}</span></span></div></button>{active && <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#725e49]">{primary ? "Primary palette" : `Expression ${selected.indexOf(name) + 1}`}</span>{!primary && <button type="button" onClick={() => makePrimary(name)} className="vb-focus text-xs font-bold text-[var(--sura-accent)]">Make primary</button>}</div>}</article>; })}</div><div className="mt-6 rounded-2xl bg-[var(--sura-soft)] p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--sura-accent)]">Current blend</p><p className="mt-2 text-sm leading-6 text-[var(--sura-ink)]">{selected.map((name) => AESTHETIC_EXPRESSIONS[name].cues[0]).join(" · ")}</p></div>{update.isError && <p className="mt-4 text-sm text-[#8c432f]">Your mix could not be saved. Keep your selection and try again.</p>}<button type="button" onClick={save} disabled={update.isPending} className="vb-button vb-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sura-primary)] px-5 py-3.5 text-sm font-bold text-[var(--sura-paper)] disabled:opacity-60">{update.isPending ? "Saving your mix…" : preferences.data?.onboardingComplete ? "Update my expression mix" : "Save my aesthetic mix"}</button></div></div></section>;
}
