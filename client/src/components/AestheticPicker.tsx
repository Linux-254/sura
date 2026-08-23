import { Check, Palette, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { AESTHETIC_THEMES, type AestheticName, useAestheticTheme } from "@/contexts/AestheticThemeContext";

const themeEntries = Object.entries(AESTHETIC_THEMES) as [
  AestheticName,
  (typeof AESTHETIC_THEMES)[AestheticName],
][];

type AestheticPickerProps = {
  compact?: boolean;
  mobileInline?: boolean;
};

export function AestheticPicker({ compact = false, mobileInline = false }: AestheticPickerProps) {
  const { aesthetic, setAesthetic, resetAesthetic } = useAestheticTheme();
  const [open, setOpen] = useState(false);

  const pickerPanelClass = mobileInline
    ? "mt-3 w-full max-w-none"
    : compact
      ? "mt-3 w-full max-w-none xl:absolute xl:right-0 xl:top-[calc(100%+0.5rem)] xl:mt-0 xl:w-[min(22rem,calc(100vw-1rem))]"
      : "absolute right-0 top-[calc(100%+0.5rem)] w-[min(22rem,calc(100vw-1rem))]";

  const scrollListClass = mobileInline
    ? "mx-0 px-0"
    : "-mx-3 px-3";

  return (
    <div className={`relative ${mobileInline ? "min-w-0 flex-1" : compact ? "min-w-0 max-xl:flex-1" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`vb-focus inline-flex items-center gap-2 rounded-full border border-[var(--sura-border)] bg-[var(--sura-paper)] px-3 py-2 text-xs font-bold text-[var(--sura-ink)] shadow-sm ${mobileInline ? "h-9 w-full justify-center px-2" : compact ? "max-xl:h-9 max-xl:w-full max-xl:justify-center max-xl:px-2" : ""}`}
        aria-label={compact ? `Change visual direction. Current: ${aesthetic}` : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Palette className="h-3.5 w-3.5 text-[var(--sura-accent)]" />
        {compact ? <span className="hidden xl:inline">{aesthetic}</span> : <span>{aesthetic}</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose your visual direction"
          className={`${pickerPanelClass} z-50 rounded-2xl border border-[var(--sura-border)] bg-[var(--sura-paper)] p-3 shadow-[0_18px_45px_rgba(48,33,16,0.16)]`}
        >
          <div className="flex items-center justify-between gap-3 px-2 pb-2">
            <div>
              <p className="vb-kicker text-[var(--sura-accent)]">Your visual direction</p>
              <p className="mt-1 text-[0.68rem] font-medium text-[#756655] sm:hidden">
                Three themes show first. Swipe for more.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAesthetic();
                setOpen(false);
              }}
              className="vb-focus inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--sura-ink)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div
            data-testid="mobile-theme-scroll-list"
            aria-label="Available visual directions"
            className={`${scrollListClass} flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0`}
          >
            {themeEntries.map(([name, palette]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setAesthetic(name);
                  setOpen(false);
                }}
                className={`vb-focus flex w-[6.75rem] shrink-0 snap-start flex-col gap-2 rounded-xl border px-3 py-3 text-left text-xs sm:w-auto sm:flex-row sm:items-center sm:py-2.5 sm:text-sm ${
                  aesthetic === name
                    ? "border-[var(--sura-accent)] bg-[var(--sura-soft)] text-[var(--sura-ink)]"
                    : "border-transparent text-[#655646] hover:bg-[#f1e9dd]"
                }`}
              >
                <span className="flex gap-1">
                  <i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                  <i className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                  <i className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: palette.soft }} />
                </span>
                <span className="min-h-8 flex-1 font-semibold leading-4 sm:min-h-0">{name}</span>
                {aesthetic === name && <Check className="h-4 w-4 self-end text-[var(--sura-accent)] sm:self-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
