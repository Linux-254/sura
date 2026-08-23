import { Check, ChevronDown, Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { useState } from "react";
import { AESTHETIC_THEMES, type AestheticName, useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const modeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const aestheticEntries = Object.entries(AESTHETIC_THEMES) as [AestheticName, (typeof AESTHETIC_THEMES)[AestheticName]][];
const featuredAesthetics = aestheticEntries.slice(0, 3);
const directionGroups: Array<{ label: string; names: AestheticName[] }> = [
  { label: "Home & space", names: ["Comfort Official", "Soft Comfort", "Warm Minimal", "Quiet Utility", "Earthbound Home", "Studio Calm"] },
  { label: "Style & self", names: ["Thrift Remix", "Street Archive", "Cobalt Ritual", "Orchid After Dark", "Thermal Bloom", "Bright Play", "Tangerine Social", "Savanna Atelier"] },
  { label: "Objects & everyday", names: ["Heritage Modern", "Ink & Ivory", "Moss & Marigold", "Object Story"] },
  { label: "Pets & companions", names: ["Pet Piece"] },
  { label: "Motion & detail", names: ["Coastal Ease", "Motion Detail"] },
];
const featuredNames = new Set(featuredAesthetics.map(([name]) => name));
const moreAestheticsGrouped = directionGroups.map((group) => ({ ...group, directions: group.names.filter((name) => !featuredNames.has(name)).map((name) => [name, AESTHETIC_THEMES[name]] as [AestheticName, (typeof AESTHETIC_THEMES)[AestheticName]]) })).filter((group) => group.directions.length > 0);
const moreAestheticCount = moreAestheticsGrouped.reduce((total, group) => total + group.directions.length, 0);

function DirectionOption({ name, palette, selected, onSelect }: { name: AestheticName; palette: (typeof AESTHETIC_THEMES)[AestheticName]; selected: boolean; onSelect: () => void }) {
  return <button key={name} onClick={onSelect} className={`vb-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${selected ? "bg-[var(--sura-soft)] text-[var(--sura-ink)]" : "text-[var(--sura-ink)] hover:bg-[var(--sura-soft)]/60"}`} role="menuitemradio" aria-checked={selected}><span className="flex gap-1" aria-hidden="true"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.primary }} /><i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.accent }} /><i className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: palette.soft }} /></span><span className="flex-1 font-semibold">{name}</span>{selected && <Check className="h-4 w-4 text-[var(--sura-accent)]" />}</button>;
}

export function AestheticPicker({ compact = false }: { compact?: boolean }) {
  const { aesthetic, setAesthetic, resetAesthetic } = useAestheticTheme();
  const { mode, resolvedTheme, setThemeMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const selectAesthetic = (name: AestheticName) => { setAesthetic(name); setOpen(false); setShowMore(false); };

  return <div className="relative"><button onClick={() => setOpen((current) => !current)} className="vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-[var(--sura-paper)] px-3 py-2 text-xs font-bold text-[var(--sura-ink)] shadow-sm" aria-expanded={open} aria-haspopup="menu"><Palette className="h-3.5 w-3.5 text-[var(--sura-accent)]" />{compact ? <span className="hidden xl:inline">{aesthetic} · {mode}</span> : <span>{aesthetic} · {mode}</span>}</button>{open && <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[calc(100vh-1.5rem)] w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-[var(--sura-border)] bg-[var(--sura-paper)] p-3 shadow-[0_18px_45px_rgba(48,33,16,0.16)]" role="menu"><div className="flex shrink-0 items-center justify-between px-2 pb-2"><p className="vb-kicker text-[var(--sura-accent)]">Your visual direction</p><button onClick={() => { resetAesthetic(); setThemeMode("system"); setOpen(false); }} className="vb-focus inline-flex items-center gap-1 text-xs font-bold text-[var(--sura-ink)]"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div><div className="mb-3 shrink-0 rounded-xl bg-[var(--sura-soft)]/60 p-2"><p className="px-1 pb-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--sura-ink)]">Interface tone</p><div className="grid grid-cols-3 gap-1">{modeOptions.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setThemeMode(value)} className={`vb-focus flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-bold ${mode === value ? "bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "text-[var(--sura-ink)] hover:bg-[var(--sura-paper)]"}`} aria-pressed={mode === value}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><p className="mt-2 px-1 text-[0.62rem] text-[var(--sura-ink)]/70">{mode === "system" ? `Following device preference · ${resolvedTheme}` : `Using ${mode} mode on this device`}</p></div><div className="shrink-0"><p className="px-2 pb-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--sura-ink)]/60">Featured directions</p>{featuredAesthetics.map(([name, palette]) => <DirectionOption key={name} name={name} palette={palette} selected={aesthetic === name} onSelect={() => selectAesthetic(name)} />)}</div><div className="mt-2 min-h-0"><button onClick={() => setShowMore((current) => !current)} className="vb-focus flex w-full items-center justify-between rounded-xl border border-[var(--sura-border)] px-3 py-2.5 text-left text-xs font-black text-[var(--sura-ink)]"><span>{showMore ? "Hide extra directions" : `More directions · ${moreAestheticCount}`}</span><ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} /></button>{showMore && <div className="mt-2 max-h-56 space-y-4 overflow-y-auto overscroll-contain pr-1" aria-label="More aesthetic directions">{moreAestheticsGrouped.map((group) => <div key={group.label}><p className="px-2 pb-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[var(--sura-ink)]/55">{group.label}</p>{group.directions.map(([name, palette]) => <DirectionOption key={name} name={name} palette={palette} selected={aesthetic === name} onSelect={() => selectAesthetic(name)} />)}</div>)}</div>}</div></div>}</div>;
}
