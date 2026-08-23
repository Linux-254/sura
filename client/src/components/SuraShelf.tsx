import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

const shelfImages = [
  { label: "Point of view", caption: "The feeling behind the work.", image: "/assets/sura-auth-hero.jpg" },
  { label: "Field notes", caption: "Places, people, and references in motion.", image: "/assets/sura-auth-street.jpg" },
  { label: "Made here", caption: "A closer look at the things worth keeping.", image: "/assets/sura-auth-interior.jpg" },
  { label: "Next signal", caption: "A direction still taking shape.", image: "/assets/sura-auth-street.jpg" },
];

export function SuraShelf({ title = "A Sura shelf" }: { title?: string }) {
  const [active, setActive] = useState(0);
  const selected = shelfImages[active];
  return <section className="mt-6 rounded-[1.5rem] border border-[var(--sura-border)] bg-[var(--sura-paper)] p-5 sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="vb-kicker text-[var(--sura-accent)]">SURA / SHELF</p><h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--sura-ink)]">{title}</h2></div><span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--sura-ink)]/55">{active + 1} / {shelfImages.length}</span></div><div className="mt-5 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{shelfImages.map((item, index) => <button key={item.label} onClick={() => setActive(index)} className="vb-focus group min-w-[4.9rem] text-center"><span className={`mx-auto block h-[4.9rem] w-[4.9rem] overflow-hidden rounded-full border-2 p-1 transition ${active === index ? "border-[var(--sura-accent)]" : "border-[var(--sura-border)] group-hover:border-[var(--sura-accent)]"}`}><img src={item.image} alt="" className="h-full w-full rounded-full object-cover" /></span><span className="mt-2 block text-[0.65rem] font-bold leading-tight text-[var(--sura-ink)]">{item.label}</span></button>)}</div><div className="mt-5 grid gap-4 overflow-hidden rounded-[1.15rem] bg-[#11130f] text-[#f7f3eb] sm:grid-cols-[8rem_1fr] sm:items-center"><img src={selected.image} alt="" className="h-40 w-full object-cover sm:h-28" /><div className="p-4 sm:pl-0"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#d7ff4d]">{selected.label}</p><p className="mt-2 text-lg font-black leading-tight">{selected.caption}</p><button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#d7ff4d]">Open shelf note <ArrowUpRight className="h-3.5 w-3.5" /></button></div></div></section>;
}
