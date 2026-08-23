import React, { useState } from "react";
import { ChevronDown, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { KENYAN_COUNTIES, type KenyanCounty } from "@/lib/kenyaLocation";

export function LocationPicker({ compact = false }: { compact?: boolean }) {
  const { county, isLocating, message, requestLocation, setCity } = useKenyaLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredCounties = KENYAN_COUNTIES.filter((candidate) => `${candidate.name} ${candidate.headquarters} ${candidate.code}`.toLowerCase().includes(query.trim().toLowerCase()));
  const chooseCounty = (nextCounty: KenyanCounty) => { setCity(nextCounty); setQuery(""); setIsOpen(false); };
  const findMyCounty = () => { requestLocation(); setIsOpen(true); };

  return <div className="relative">
    <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={county ? `${county} County selector` : "Find your county"} aria-expanded={isOpen} aria-controls="kenya-county-options" className={`vb-focus group inline-flex items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#fbf8f2]/95 font-semibold text-[#4e402f] shadow-[0_8px_20px_rgba(73,51,29,0.06)] transition hover:-translate-y-px hover:border-[#b98043] ${compact ? "h-9 max-w-[8.5rem] px-2.5 text-[0.68rem]" : "h-10 max-w-[12rem] px-3 text-xs"}`}>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f0e3ce] text-[#9a5c2d]"><MapPin className="h-3 w-3" /></span>
      <span className="truncate">{county ? `${county} County` : compact ? "County" : "Find your county"}</span><ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#9a6c43] transition ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && <div className={`absolute right-0 top-[calc(100%+0.65rem)] z-50 overflow-hidden rounded-[1.25rem] border border-[#d8cbb8] bg-[#fffdf9] shadow-[0_20px_48px_rgba(54,38,22,0.18)] ${compact ? "w-[min(21rem,calc(100vw-1.5rem))]" : "w-[22rem]"}`}>
      <div className="border-b border-[#eadfce] bg-[#f7efe3] p-3.5"><div className="flex items-start justify-between gap-3"><div><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.17em] text-[#a56536]">SURA / LOCAL FINDER</p><p className="mt-1 text-sm font-bold text-[#2d241c]">Choose from all 47 counties</p></div><button type="button" onClick={() => setIsOpen(false)} aria-label="Close county selector" className="vb-focus grid h-7 w-7 place-items-center rounded-full text-[#6d5947] hover:bg-white"><X className="h-4 w-4" /></button></div><button type="button" onClick={findMyCounty} className="vb-focus mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#251f1a] px-3 py-2.5 text-xs font-bold text-[#fffaf1] transition hover:bg-[#3a2c22]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#b77835] text-white">{isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}</span>{isLocating ? "Finding your county…" : "Use my location"}</button></div>
      <div className="p-3"><label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9b826c]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search county or county seat" aria-label="Search Kenyan counties" className="vb-focus w-full rounded-xl border border-[#ddcfbd] bg-[#fdfaf5] py-2.5 pl-9 pr-3 text-xs text-[#3c3026] outline-none placeholder:text-[#a39280]" /></label></div>
      <div id="kenya-county-options" role="listbox" aria-label="All Kenyan counties" className="max-h-64 overflow-y-auto px-2 pb-2"><p className="px-2 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[#9a8069]">{filteredCounties.length} counties</p>{filteredCounties.map((candidate) => <button key={candidate.code} type="button" role="option" aria-selected={county === candidate.name} onClick={() => chooseCounty(candidate.name)} className={`vb-focus flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${county === candidate.name ? "bg-[#ede1cd] text-[#342419]" : "text-[#514233] hover:bg-[#f7f0e6]"}`}><span><span className="block text-xs font-bold">{candidate.name} County</span><span className="mt-0.5 block text-[0.63rem] text-[#8b7460]">{candidate.code} · {candidate.headquarters}</span></span>{county === candidate.name && <span className="h-1.5 w-1.5 rounded-full bg-[#ad6833]" aria-hidden="true" />}</button>)}{filteredCounties.length === 0 && <p className="px-3 py-6 text-center text-xs leading-5 text-[#806d5b]">No county matches that search. Try a county name or county seat.</p>}</div>
      {message && <p role="status" className="border-t border-[#eadfce] bg-[#fffaf2] px-4 py-3 text-[0.68rem] leading-5 text-[#725e4c]">{message}</p>}
    </div>}
  </div>;
}
