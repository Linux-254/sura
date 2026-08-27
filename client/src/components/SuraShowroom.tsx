import { Check, ChevronLeft, ChevronRight, Expand, Gauge, Ruler, ScanLine, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import { SuraImage } from "@/components/SuraImage";

export type ShowroomKind = "home_refresh" | "personal_style" | "footwear_fit" | "inspiration" | "wardrobe_edit" | "home_showroom" | "product_edit" | "vehicle_garage" | "detailing_bay" | "tattoo_concept" | "pet_accessory";

type ShowroomSlot = { label: string; options: string[] };

const views = ["Front", "Angle", "Side", "Detail"] as const;
const defaultSlots: Record<ShowroomKind, ShowroomSlot[]> = {
  home_refresh: [{ label: "Anchor", options: ["Sofa", "Dining table", "Bed frame"] }, { label: "Layer", options: ["Rug", "Curtains", "Lighting"] }, { label: "Finish", options: ["Warm wood", "Stone", "Woven texture"] }],
  home_showroom: [{ label: "Anchor", options: ["Sofa", "Dining table", "Bed frame"] }, { label: "Layer", options: ["Rug", "Curtains", "Lighting"] }, { label: "Finish", options: ["Warm wood", "Stone", "Woven texture"] }],
  personal_style: [{ label: "Top", options: ["Structured shirt", "Soft knit", "Overshirt"] }, { label: "Bottom", options: ["Wide-leg trouser", "Straight denim", "Tailored short"] }, { label: "Shoes", options: ["Leather loafer", "Clean trainer", "Low boot"] }],
  wardrobe_edit: [{ label: "Top", options: ["Structured shirt", "Soft knit", "Overshirt"] }, { label: "Bottom", options: ["Wide-leg trouser", "Straight denim", "Tailored short"] }, { label: "Shoes", options: ["Leather loafer", "Clean trainer", "Low boot"] }],
  footwear_fit: [{ label: "Shape", options: ["Low profile", "Cushioned", "Statement"] }, { label: "Upper", options: ["Leather", "Canvas", "Mesh"] }, { label: "Use", options: ["Everyday", "Work", "Weekend"] }],
  product_edit: [{ label: "Form", options: ["Clean line", "Soft curve", "Utility"] }, { label: "Material", options: ["Wood", "Metal", "Textile"] }, { label: "Finish", options: ["Natural", "Matte", "Gloss"] }],
  vehicle_garage: [{ label: "Body", options: ["Coupe", "SUV", "Hatchback"] }, { label: "Finish", options: ["Factory", "Satin", "Pearl"] }, { label: "Wheels", options: ["Classic", "Sport", "All-terrain"] }],
  detailing_bay: [{ label: "Service", options: ["Full detail", "Interior reset", "Paint correction"] }, { label: "Finish", options: ["Natural gloss", "Deep shine", "Satin clean"] }, { label: "Accent", options: ["Black trim", "Chrome", "Warm neutral"] }],
  tattoo_concept: [{ label: "Placement", options: ["Forearm", "Shoulder", "Back"] }, { label: "Line", options: ["Fine line", "Bold line", "Dotwork"] }, { label: "Mood", options: ["Quiet symbol", "Botanical", "Geometric"] }],
  pet_accessory: [{ label: "Piece", options: ["Collar", "Lead", "Bed"] }, { label: "Material", options: ["Canvas", "Leather", "Woven"] }, { label: "Mood", options: ["Playful", "Quiet", "Heritage"] }],
  inspiration: [{ label: "Anchor", options: ["Object", "Outfit", "Room"] }, { label: "Texture", options: ["Soft", "Raw", "Polished"] }, { label: "Mood", options: ["Calm", "Bright", "Grounded"] }],
};

const showroomLabels: Record<ShowroomKind, string> = {
  home_refresh: "Home showroom", home_showroom: "Home showroom", personal_style: "Wardrobe showroom", wardrobe_edit: "Wardrobe showroom", footwear_fit: "Footwear showroom", product_edit: "Product showroom", vehicle_garage: "Garage showroom", detailing_bay: "Detail bay", tattoo_concept: "Ink concept", pet_accessory: "Pet accessory showroom", inspiration: "Aesthetic showroom",
};

const fallbackByKind: Record<ShowroomKind, string> = {
  home_refresh: "/assets/stitch/showroom-concrete.jpg", home_showroom: "/assets/stitch/showroom-concrete.jpg", personal_style: "/assets/stitch/showroom-chair.jpg", wardrobe_edit: "/assets/stitch/showroom-chair.jpg", footwear_fit: "/assets/stitch/signal-chair.jpg", product_edit: "/assets/stitch/product-chair.jpg", vehicle_garage: "/assets/stitch/landing-street.jpg", detailing_bay: "/assets/stitch/landing-street.jpg", tattoo_concept: "/assets/stitch/showroom-concrete.jpg", pet_accessory: "/assets/stitch/signal-textile.jpg", inspiration: "/assets/stitch/landing-portrait.jpg",
};

function defaultSelection(slots: ShowroomSlot[]) {
  return Object.fromEntries(slots.map((slot) => [slot.label, slot.options[0]]));
}

export function ShowroomStage({ kind, imageUrl, aesthetic, onUseForBrief, preview = false }: { kind: ShowroomKind; imageUrl?: string; aesthetic: string; onUseForBrief: (summary: string) => void; preview?: boolean }) {
  const slots = defaultSlots[kind];
  const [viewIndex, setViewIndex] = useState(0);
  const [heightCm, setHeightCm] = useState(170);
  const [build, setBuild] = useState("Balanced");
  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(slots));
  const [expanded, setExpanded] = useState(false);
  const label = showroomLabels[kind];
  const sourceImage = imageUrl || fallbackByKind[kind];
  const viewImages = useMemo(() => {
    const candidates = Array.from(new Set([sourceImage, fallbackByKind[kind], "/assets/stitch/signal-chair.jpg", "/assets/stitch/signal-textile.jpg", "/assets/stitch/showroom-concrete.jpg"]));
    return Array.from({ length: views.length }, (_, index) => candidates[index % candidates.length]);
  }, [kind, sourceImage]);
  const activeImage = viewImages[viewIndex] ?? sourceImage;
  const summary = useMemo(() => `${label}: ${Object.values(selection).join(", ")} · ${aesthetic}${kind === "personal_style" || kind === "wardrobe_edit" || kind === "footwear_fit" ? ` · ${heightCm} cm · ${build} build` : ""}`, [aesthetic, build, heightCm, kind, label, selection]);
  const isFitLane = kind === "personal_style" || kind === "wardrobe_edit" || kind === "footwear_fit";
  const isGarageLane = kind === "vehicle_garage" || kind === "detailing_bay";

  return (
    <section className={`sura-showroom-stage mt-7 overflow-hidden border border-[#454935] ${expanded ? "fixed inset-3 z-[70] mt-0 shadow-2xl sm:inset-6" : ""}`} aria-labelledby="sura-showroom-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.1] px-5 py-5 sm:px-7">
        <div>
          <p className="sura-showroom-accent text-xs font-black uppercase tracking-[0.16em]">SURA STUDIO / {preview ? "READ-ONLY PREVIEW" : "PRIVATE WORKSPACE"}</p>
          <h2 id="sura-showroom-heading" className="vb-display mt-3 max-w-2xl text-3xl text-[#e3e3dc] sm:text-5xl">Build the direction before you buy.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#c5c9af]">Revolve the scene, tune the details, and keep the useful specification with your visual brief.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="sura-signal-chip px-3 py-2">{label}</span>
          <button type="button" onClick={() => setExpanded((current) => !current)} className="vb-focus grid h-10 w-10 place-items-center border border-white/[0.14] text-[#e3e3dc] hover:border-[#caff32] hover:text-[#caff32]" aria-label={expanded ? "Exit expanded showroom" : "Expand showroom"}><Expand className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <div>
          <div className="relative min-h-[28rem] overflow-hidden border border-white/[0.12] bg-[#0d0f0b] p-3 sm:min-h-[34rem] sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(202,242,64,.16),transparent_40%),linear-gradient(140deg,#1e201c,#0d0f0b)]" />
            <div className="relative mx-auto flex min-h-[24rem] max-w-xl items-center justify-center sm:min-h-[29rem]">
              <div className="sura-edit-card relative w-[78%] origin-center" key={`${activeImage}-${viewIndex}`}>
                <SuraImage src={activeImage} fallbackSrc={fallbackByKind[kind]} alt={`${label} ${views[viewIndex]} concept`} className="h-[21rem] w-full border border-white/[0.16] object-cover opacity-90 sm:h-[26rem]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0f0b]/85 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><div><p className="sura-showroom-accent text-[0.64rem] font-black uppercase tracking-[0.16em]">PROJECT 01</p><p className="mt-1 text-2xl font-black leading-none text-[#e3e3dc] sm:text-4xl">{aesthetic || "Composed direction"}</p></div><span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#c5c9af]">{views[viewIndex]} view</span></div>
                {viewIndex === 3 && <><button type="button" className="absolute left-[31%] top-[38%] grid h-10 w-10 place-items-center rounded-full border border-[#caff32] bg-[#caff32]/20 text-[#caff32]" aria-label="Inspect upper material detail"><ScanLine className="h-4 w-4" /></button><button type="button" className="absolute right-[26%] top-[62%] grid h-10 w-10 place-items-center rounded-full border border-[#caff32] bg-[#caff32]/20 text-[#caff32]" aria-label="Inspect lower material detail"><ScanLine className="h-4 w-4" /></button></>}
              </div>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-5">
              <button onClick={() => setViewIndex((current) => (current + views.length - 1) % views.length)} className="vb-focus grid h-10 w-10 place-items-center border border-white/[0.16] bg-[#1e201c] text-[#e3e3dc] hover:border-[#caff32] hover:text-[#caff32]" aria-label="Previous showroom view"><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-1.5 overflow-x-auto border border-white/[0.12] bg-[#1e201c]/90 p-1 backdrop-blur"><span className="hidden px-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#8f937b] sm:inline">View</span>{views.map((view, index) => <button key={view} type="button" onClick={() => setViewIndex(index)} className={`sura-showroom-control vb-focus px-3 py-2 text-[0.64rem] font-black uppercase tracking-[0.08em] ${viewIndex === index ? "bg-[#caff32] text-[#293500]" : "text-[#c5c9af] hover:text-[#e3e3dc]"}`} data-active={viewIndex === index} aria-pressed={viewIndex === index}>{view}</button>)}</div>
              <button onClick={() => setViewIndex((current) => (current + 1) % views.length)} className="vb-focus grid h-10 w-10 place-items-center border border-white/[0.16] bg-[#1e201c] text-[#e3e3dc] hover:border-[#caff32] hover:text-[#caff32]" aria-label="Next showroom view"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3"><span className="sura-showroom-accent text-xs font-black">01</span><input type="range" min="0" max={views.length - 1} value={viewIndex} onChange={(event) => setViewIndex(Number(event.target.value))} className="w-full accent-[#caff32]" aria-label="Revolve showroom view" /><span className="w-12 text-right text-xs font-black text-[#c5c9af]">0{viewIndex + 1} / 04</span></div>
        </div>

        <div className="space-y-5">
          <div className="sura-showroom-panel p-5"><div className="flex items-center justify-between gap-3"><div><p className="sura-showroom-accent text-xs font-black uppercase tracking-[0.14em]">Applied synthesis</p><p className="mt-2 text-sm leading-5 text-[#c5c9af]">The visual system follows the active lane and your chosen direction.</p></div><Sparkles className="h-5 w-5 text-[#caff32]" /></div><div className="mt-5 space-y-3">{slots.map((slot) => <label key={slot.label} className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-[#c5c9af]">{slot.label}</span><select value={selection[slot.label]} onChange={(event) => setSelection((current) => ({ ...current, [slot.label]: event.target.value }))} className="vb-focus w-full border border-white/[0.12] bg-[#121410] px-3 py-3 text-sm font-semibold text-[#e3e3dc]">{slot.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div></div>

          {isFitLane && <div className="sura-showroom-panel p-5"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#e3e3dc]"><Ruler className="h-4 w-4 text-[#caff32]" />Fit reference</p><span className="text-sm font-black text-[#caff32]">{heightCm} cm</span></div><input type="range" min="145" max="210" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} className="mt-4 w-full accent-[#caff32]" aria-label="Model height in centimetres" /><div className="mt-3 flex flex-wrap gap-2">{["Petite", "Balanced", "Broad"].map((option) => <button key={option} type="button" onClick={() => setBuild(option)} className={`vb-focus border px-3 py-2 text-xs font-bold ${build === option ? "border-[#caff32] bg-[#caff32] text-[#293500]" : "border-white/[0.14] text-[#c5c9af]"}`}>{option}</button>)}</div><p className="mt-3 text-xs leading-5 text-[#8f937b]">A proportion reference only. Confirm garment measurements and fit with the maker before ordering.</p></div>}
          {isGarageLane && <div className="sura-showroom-panel p-5"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#e3e3dc]"><Gauge className="h-4 w-4 text-[#caff32]" />Garage notes</p><p className="mt-3 text-sm leading-6 text-[#c5c9af]">Use the scene to compare finish, wheel, trim, and service choices. A final quote still depends on the vehicle, parts, labour, and inspection.</p></div>}

          <div className="border border-[#6d8310] bg-[#caff32] p-5 text-[#293500]"><p className="text-xs font-black uppercase tracking-[0.14em]">Current build</p><p className="mt-2 text-sm font-black leading-6">{summary}</p><button onClick={() => onUseForBrief(summary)} className="vb-focus mt-4 inline-flex items-center gap-2 bg-[#293500] px-4 py-2.5 text-xs font-black text-[#caff32]"><Check className="h-3.5 w-3.5" />{preview ? "Add to demo brief" : "Use this in my private brief"}</button></div>
        </div>
      </div>
    </section>
  );
}
