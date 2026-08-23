import { Check, Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { useState } from "react";
import { AESTHETIC_THEMES, type AestheticName } from "@/contexts/AestheticThemeContext";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const modeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AestheticPicker({ compact = false }: { compact?: boolean }) {
  const { aesthetic, setAesthetic, resetAesthetic } = useAestheticTheme();
  const { mode, resolvedTheme, setThemeMode } = useTheme();
  const [open, setOpen] = useState(false);

  return <div className="relative"><button onClick={() => setOpen(!open)} className="vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-[var(--sura-paper)] px-3 py-2 text-xs font-bold text-[var(--sura-ink)] shadow-sm" aria-expanded={open} aria-haspopup="menu"><Palette className="h-3.5 w-3.5 text-[var(--sura-accent)]" />{compact ? <span className="hidden xl:inline">{aesthetic} · {mode}</span> : <span>{aesthetic} · {mode}</span>}</button>{open && <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[19rem] rounded-2xl border border-[var(--sura-border)] bg-[var(--sura-paper)] p-3 shadow-[0_18px_45px_rgba(48,33,16,0.16)]" role="menu"><div className="flex items-center justify-between px-2 pb-2"><p className="vb-kicker text-[var(--sura-accent)]">Your visual direction</p><button onClick={() => { resetAesthetic(); setThemeMode("system"); setOpen(false); }} className="vb-focus inline-flex items-center gap-1 text-xs font-bold text-[var(--sura-ink)]"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div><div className="mb-3 rounded-xl bg-[var(--sura-soft)]/60 p-2"><p className="px-1 pb-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--sura-ink)]">Interface tone</p><div className="grid grid-cols-3 gap-1">{modeOptions.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setThemeMode(value)} className={`vb-focus flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-bold ${mode === value ? "bg-[var(--sura-primary)] text-[var(--sura-paper)]" : "text-[var(--sura-ink)] hover:bg-[var(--sura-paper)]"}`} aria-pressed={mode === value}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><p className="mt-2 px-1 text-[0.62rem] text-[var(--sura-ink)]/70">{mode === "system" ? `Following device preference · ${resolvedTheme}` : `Using ${mode} mode on this device`}</p></div><div className="space-y-1">{(Object.entries(AESTHETIC_THEMES) as [AestheticName, (typeof AESTHETIC_THEMES)[AestheticName]][]).map(([name, palette]) => <button key={name} onClick={() => { setAesthetic(name); setOpen(false); }} className={`vb-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${aesthetic === name ? "bg-[var(--sura-soft)] text-[var(--sura-ink)]" : "text-[var(--sura-ink)] hover:bg-[var(--sura-soft)]/60"}`}><span className="flex gap-1"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.primary }} /><i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.accent }} /><i className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: palette.soft }} /></span><span className="flex-1 font-semibold">{name}</span>{aesthetic === name && <Check className="h-4 w-4 text-[var(--sura-accent)]" />}</button>)}</div></div>}</div>;
}
