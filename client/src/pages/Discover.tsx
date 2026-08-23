import { Search, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { VibeLayout, labelize } from "@/components/VibeLayout";
import { SuraEmptyState, SuraErrorState, SuraPageSkeleton } from "@/components/SuraStates";
import { VendorCard } from "@/components/VendorCard";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import type { KenyanCity } from "@/lib/kenyaLocation";
import { trpc } from "@/lib/trpc";

const initialFilters = { search: "", city: "All cities", type: "All categories", budgetTier: "All ranges", aesthetic: "All aesthetics" };

export default function Discover() {
  const { city: detectedCity, message: locationMessage, setCity: setPreferredCity } = useKenyaLocation();
  const [filters, setFilters] = useState(initialFilters);
  const [cityManuallyAdjusted, setCityManuallyAdjusted] = useState(false);
  useEffect(() => { if (detectedCity && !cityManuallyAdjusted) setFilters((current) => ({ ...current, city: detectedCity })); }, [detectedCity, cityManuallyAdjusted]);
  const queryInput = useMemo(() => filters, [filters]);
  const vendors = trpc.vendors.list.useQuery(queryInput);
  const setFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const activeFilters = Object.values(filters).filter((value) => value && !value.startsWith("All")).length;
  const resetFilters = () => { setCityManuallyAdjusted(false); setFilters({ ...initialFilters, city: detectedCity ?? "All cities" }); };

  return <VibeLayout>
    <main className="container pb-20 pt-10 sm:pt-14">
      <div className="max-w-2xl">
        <span className="vb-kicker text-[#9f5d2d]">The local directory</span>
        <h1 className="vb-serif mt-4 text-5xl leading-[0.94] tracking-[-0.045em] text-[#251f1a] sm:text-6xl">Find the people who can <em className="font-normal text-[#aa6834]">take it there.</em></h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#746656]">Search demonstration company profiles by city, category, price character, and aesthetic direction. These profiles are a realistic MVP preview, not a promise of live availability.</p>
        {detectedCity && <button onClick={() => { setCityManuallyAdjusted(false); setFilters((current) => ({ ...current, city: detectedCity })); }} className="vb-focus mt-4 inline-flex items-center gap-2 rounded-full bg-[#ede2cf] px-3 py-2 text-xs font-bold text-[#72502c]">Showing {detectedCity} first · use my city</button>}
        {locationMessage && !detectedCity && <p className="mt-4 max-w-lg text-xs leading-5 text-[#796957]">{locationMessage}</p>}
      </div>
      <section className="mt-10 grid gap-8 lg:grid-cols-[17rem_1fr] lg:items-start">
        <aside className="rounded-[1.5rem] border border-[#ddcfbd] bg-[#fbf8f2] p-5 lg:sticky lg:top-28">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold text-[#34291f]"><SlidersHorizontal className="h-4 w-4 text-[#a76531]" />Refine the mix</div>{activeFilters > 0 && <button onClick={resetFilters} className="vb-focus inline-flex items-center gap-1 text-xs font-bold text-[#9a5d2c] hover:text-[#4b3624]"><X className="h-3.5 w-3.5" />Clear</button>}</div>
          <div className="mt-5 space-y-4">
            <FilterSelect label="City" value={filters.city} onChange={(value) => { setCityManuallyAdjusted(true); setFilter("city", value); if (value !== "All cities") setPreferredCity(value as KenyanCity); }} options={["All cities", "Nairobi", "Mombasa", "Kisumu", "Nakuru"]} />
            <FilterSelect label="Category" value={filters.type} onChange={(value) => setFilter("type", value)} options={["All categories", ...["thrift", "tailor", "home_studio", "stylist", "creative"].map(labelize)]} values={["All categories", "thrift", "tailor", "home_studio", "stylist", "creative"]} />
            <FilterSelect label="Budget range" value={filters.budgetTier} onChange={(value) => setFilter("budgetTier", value)} options={["All ranges", "Considered", "Signature", "Statement"]} values={["All ranges", "considered", "signature", "statement"]} />
            <FilterSelect label="Aesthetic" value={filters.aesthetic} onChange={(value) => setFilter("aesthetic", value)} options={["All aesthetics", "Soft Power", "Thrift Remix", "Heritage Modern", "Comfort Official", "Coastal Ease"]} />
          </div>
        </aside>
        <div>
          <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a66430]" /><input value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search name, neighbourhood, or category" className="vb-focus w-full rounded-2xl border border-[#d9cebd] bg-[#fbf8f2] py-3 pl-11 pr-4 text-sm text-[#3a2d22] placeholder:text-[#998a77]" /></div>
          <div className="mt-5 flex items-center justify-between"><p className="text-sm text-[#746654]">{vendors.isLoading ? "Finding sources…" : `${vendors.data?.length ?? 0} demonstration profiles`}</p><p className="rounded-full bg-[#eee0c7] px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[#765023]">Demo data</p></div>
          <div className="mt-5">
            {vendors.isLoading && <SuraPageSkeleton cards={6} />}
            {vendors.isError && <SuraErrorState title="The directory needs another moment." copy="Your city and filter choices are still here. Try loading company profiles again when you are ready." onRetry={() => vendors.refetch()} />}
            {!vendors.isLoading && !vendors.isError && (vendors.data?.length ?? 0) === 0 && <SuraEmptyState eyebrow="SURA / LOCAL DIRECTORY" title="Nothing lands here yet." copy="Try broadening the city, aesthetic, or budget range. The directory is intentionally small during this MVP." action={<button onClick={resetFilters} className="vb-button vb-focus rounded-full border border-[var(--sura-accent)] px-5 py-3 text-sm font-bold text-[var(--sura-primary)]">Reset filters</button>} />}
            {!vendors.isLoading && !vendors.isError && (vendors.data?.length ?? 0) > 0 && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{vendors.data?.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}</div>}
          </div>
        </div>
      </section>
    </main>
  </VibeLayout>;
}

function FilterSelect({ label, value, onChange, options, values }: { label: string; value: string; onChange: (value: string) => void; options: string[]; values?: string[] }) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#7b6b59]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="vb-focus mt-2 w-full rounded-xl border border-[#d9cebd] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#372d23]">{options.map((option, index) => <option key={option} value={values?.[index] ?? option}>{option}</option>)}</select></label>;
}
