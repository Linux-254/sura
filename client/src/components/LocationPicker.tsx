import { LocateFixed, Loader2, MapPin } from "lucide-react";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import type { KenyanCity } from "@/lib/kenyaLocation";

export function LocationPicker({ compact = false }: { compact?: boolean }) {
  const { city, cities, isLocating, message, requestLocation, setCity } = useKenyaLocation();
  return <div className={compact ? "relative" : "relative hidden lg:block"}>
    <div className={`flex items-center rounded-full border border-[#d6c9b7] bg-[#fbf8f2] ${compact ? "p-1" : "p-1.5"}`}>
      <MapPin className="ml-2 h-3.5 w-3.5 shrink-0 text-[#a76531]" />
      <select aria-label="Choose your Kenyan city" value={city ?? ""} onChange={(event) => setCity((event.target.value || null) as KenyanCity | null)} className={`vb-focus min-w-0 bg-transparent font-semibold text-[#4e402f] outline-none ${compact ? "max-w-20 px-1 text-[0.65rem]" : "max-w-28 px-2 text-xs"}`}>
        <option value="">Your city</option>
        {cities.map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}
      </select>
      <button onClick={requestLocation} title="Use my location in Kenya" className="vb-button vb-focus grid h-7 w-7 place-items-center rounded-full bg-[#eee0c7] text-[#7f5329] hover:bg-[#e5ceb0]" aria-label="Detect my Kenyan city">{isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}</button>
    </div>
    {message && <p className={`absolute right-0 top-[calc(100%+0.45rem)] z-50 rounded-xl border border-[#ded2c2] bg-[#fbf8f2] p-3 text-xs leading-5 text-[#6f604f] shadow-[0_10px_24px_rgba(57,42,25,0.12)] ${compact ? "w-64" : "w-72"}`}>{message}</p>}
  </div>;
}
