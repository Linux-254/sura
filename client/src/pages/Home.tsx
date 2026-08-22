import { ArrowDown, ArrowUpRight, Check, CircleDollarSign, Compass, MapPin, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { VibeLayout, formatKes } from "@/components/VibeLayout";
import { VendorCard } from "@/components/VendorCard";
import { trpc } from "@/lib/trpc";

const steps = [
  { number: "01", title: "Set the brief", copy: "Tell us where you are, what the moment is, what you want it to feel like, and what you are ready to spend.", icon: Compass },
  { number: "02", title: "See the build", copy: "Receive an itemised direction with a clear cost range and the local vendors who can make it happen.", icon: CircleDollarSign },
  { number: "03", title: "Make it yours", copy: "Save the parts that matter, share a plan, and start a considered conversation when you are ready.", icon: Sparkles },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const vendors = trpc.vendors.list.useQuery(undefined);
  const featured = vendors.data?.slice(0, 3) ?? [];

  return (
    <VibeLayout>
      <main>
        <section className="container grid gap-10 pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-24 lg:pt-14">
          <div className="relative z-10 flex flex-col justify-center lg:py-10">
            <div className="flex items-center gap-3"><span className="h-px w-8 bg-[#b77835]" /><span className="vb-kicker text-[#9f5d2d]">A local plan, with your name on it</span></div>
            <h1 className="vb-serif mt-5 max-w-2xl text-[3.4rem] leading-[0.9] tracking-[-0.052em] text-[#201b16] sm:text-[4.65rem] lg:text-[5.25rem]">Make the budget <em className="font-normal text-[#ad6b36]">work</em> beautifully.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#6f6354] sm:text-lg">SURA turns a real budget into a considered local plan for your style, space, or next occasion. Not a shopping cart. A clear way forward.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => setLocation("/brief")} className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-6 py-3.5 text-sm font-semibold text-[#f7f2ea] shadow-[0_12px_24px_rgba(38,28,17,0.16)] hover:bg-[#504637]">Build my edit <ArrowUpRight className="h-4 w-4" /></button>
              <Link href="/discover" className="vb-focus inline-flex items-center gap-2 rounded-full border border-[#cfc2b0] bg-[#fbf8f3]/70 px-6 py-3.5 text-sm font-semibold text-[#382f26] hover:border-[#a97745]">Explore local makers <ArrowDown className="h-4 w-4" /></Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-xs text-[#726654]"><span className="rounded-full bg-[#e7d6b7] px-3 py-1.5 font-semibold">Nairobi-first</span><span>Demonstration vendors & indicative prices, clearly marked.</span></div>
          </div>
          <div className="relative min-h-[26rem] sm:min-h-[30rem] lg:min-h-[33rem]">
            <div className="absolute right-[2%] top-0 h-[79%] w-[62%] overflow-hidden rounded-t-[8rem] rounded-bl-[1.8rem] rounded-br-[1.8rem] bg-[#d7c0a0] shadow-[0_22px_48px_rgba(65,44,18,0.15)]"><img src="/manus-storage/nairobi-fashion-portrait_558e87d6.jpg" alt="Nairobi creative in a SURA editorial portrait" className="h-full w-full object-cover object-center" /></div>
            <div className="absolute bottom-0 left-0 h-[53%] w-[54%] overflow-hidden rounded-tl-[1.8rem] rounded-tr-[1.8rem] rounded-br-[7rem] border-[7px] border-[#f4f0e9] bg-[#b77c4b] shadow-[0_18px_40px_rgba(65,44,18,0.11)]"><img src="/manus-storage/nairobi-street-editorial_5f3f7e9e.jpg" alt="Nairobi street style in a SURA editorial collage" className="h-full w-full object-cover" /></div>
            <div className="absolute left-[14%] top-[13%] rounded-full border border-[#e5d9c8] bg-[#fbf8f2]/95 px-4 py-3 text-center shadow-[0_10px_25px_rgba(67,48,26,0.1)]"><p className="vb-kicker text-[#9d5b28]">Your brief</p><p className="mt-1 text-xs font-medium text-[#453526]">Budget-first. Identity-led.</p></div>
            <div className="absolute bottom-[7%] right-0 rounded-2xl border border-white/60 bg-[#1d1b18] p-4 text-[#fbf5ec] shadow-[0_14px_30px_rgba(32,25,16,0.24)]"><p className="vb-kicker text-[#d39a52]">A sample edit</p><p className="vb-serif mt-2 text-lg leading-5">The Nairobi<br />After Five</p><p className="mt-3 text-xs text-[#d8cbbc]">from {formatKes(9400)}</p></div>
          </div>
        </section>

        <section id="how-it-works" className="vb-ink text-[#f8f3eb]">
          <div className="container py-16 sm:py-20">
            <div className="grid gap-8 border-b border-white/15 pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div><span className="vb-kicker text-[#d59b58]">A better starting point</span><h2 className="vb-serif mt-4 text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl">The plan before the purchase.</h2></div>
              <p className="max-w-xl text-base leading-7 text-[#cfc4b6]">Most local style decisions begin with too many tabs and no way to judge what works together. SURA holds the full picture: intention, spend, sources, and next step.</p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(({ number, title, copy, icon: Icon }) => <article key={number} className="border-t border-white/20 pt-5"><div className="flex items-center justify-between"><span className="vb-serif text-3xl text-[#d59b58]">{number}</span><Icon className="h-5 w-5 text-[#d59b58]" /></div><h3 className="vb-serif mt-8 text-2xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#cfc4b6]">{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28"><span className="vb-kicker text-[#9e5d2d]">The standard is clarity</span><h2 className="vb-serif mt-4 max-w-md text-4xl leading-[0.98] tracking-[-0.04em] text-[#251f1a] sm:text-5xl">An edit with a reason behind every choice.</h2><p className="mt-5 max-w-md text-base leading-7 text-[#716453]">Recommendations show an indicative range, item by item, and explain the role each piece plays. You can see what your money is doing before you speak to anyone.</p><button onClick={() => setLocation("/brief")} className="vb-button vb-focus mt-7 inline-flex items-center gap-2 border-b border-[#5c4027] pb-1 text-sm font-bold text-[#4e341f] hover:text-[#a7602b]">Try the brief <ArrowUpRight className="h-4 w-4" /></button></div>
            <article className="overflow-hidden rounded-[2rem] border border-[#dbcfbf] bg-[#fdfaf5] shadow-[0_20px_54px_rgba(64,45,23,0.08)]">
              <div className="grid sm:grid-cols-[0.9fr_1.1fr]"><div className="relative min-h-[21rem] overflow-hidden"><img src="/manus-storage/nairobi-street-editorial_5f3f7e9e.jpg" alt="A curated style direction" className="h-full w-full object-cover" /><div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#f8f3eb]/92 p-4 backdrop-blur"><p className="vb-kicker text-[#9e5d2d]">A transparent sample</p><p className="vb-serif mt-2 text-xl leading-5 text-[#211b16]">The Nairobi After Five</p></div></div><div className="p-6 sm:p-8"><p className="text-sm leading-6 text-[#756857]">A flexible evening look built around one precise line and one strong second-hand find.</p><div className="mt-6 space-y-4">{[["Structured overshirt", "KES 2,800"], ["Wide-leg trouser", "KES 5,200"], ["Finishing edit", "KES 1,400"]].map(([label, cost]) => <div key={label} className="flex items-center justify-between border-b border-[#e2d9cd] pb-3 text-sm"><span className="inline-flex items-center gap-2 text-[#4e4438]"><Check className="h-4 w-4 text-[#ad6b36]" />{label}</span><strong className="font-semibold text-[#221c17]">{cost}</strong></div>)}</div><div className="mt-6 flex items-end justify-between"><div><p className="vb-kicker text-[#8b6b4f]">Build begins at</p><p className="vb-serif mt-1 text-3xl text-[#211b16]">KES 9,400</p></div><button onClick={() => setLocation("/brief")} className="vb-button vb-focus inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1b17] text-[#f8f4ec]"><ArrowUpRight className="h-4 w-4" /></button></div></div></div>
            </article>
          </div>
        </section>

        <section className="border-y vb-rule bg-[#eee6da]">
          <div className="container py-16 sm:py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><span className="vb-kicker text-[#9e5d2d]">Source local with intention</span><h2 className="vb-serif mt-4 text-4xl leading-none tracking-[-0.04em] text-[#251f1a] sm:text-5xl">Meet the makers in the mix.</h2></div><Link href="/discover" className="vb-focus inline-flex items-center gap-2 border-b border-[#76563a] pb-1 text-sm font-bold text-[#4e341f]">Browse the directory <ArrowUpRight className="h-4 w-4" /></Link></div>
            {vendors.isLoading && <div className="mt-10 grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[23rem] animate-pulse rounded-[1.4rem] bg-[#ddcfbd]" />)}</div>}
            {vendors.isError && <div className="mt-10 rounded-[1.5rem] border border-[#d8ad9b] bg-[#fff3ed] p-8 text-center"><p className="vb-serif text-2xl text-[#632f21]">The maker list needs a moment.</p><p className="mt-2 text-sm text-[#7c4636]">You can still explore the full directory, or try this list again.</p><button onClick={() => vendors.refetch()} className="vb-button vb-focus mt-5 rounded-full bg-[#5f2d20] px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>}
            {!vendors.isLoading && !vendors.isError && featured.length === 0 && <div className="mt-10 rounded-[1.5rem] border border-dashed border-[#c9b7a2] bg-[#f8f3ea] p-8 text-center"><p className="vb-serif text-2xl text-[#4d3b2a]">The first makers are on their way.</p><p className="mt-2 text-sm text-[#766856]">Use the directory to see the complete demonstration set as it grows.</p><Link href="/discover" className="vb-button vb-focus mt-5 inline-flex rounded-full bg-[#1e1b17] px-5 py-2.5 text-sm font-bold text-[#fbf7ef]">Open directory</Link></div>}
            {!vendors.isLoading && !vendors.isError && featured.length > 0 && <div className="mt-10 grid gap-5 md:grid-cols-3">{featured.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} compact />)}</div>}
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-[#756755]"><MapPin className="h-3.5 w-3.5 text-[#b77835]" />Indicative services and pricing shown for exploration; every profile is visibly marked as a demo.</p></div>
        </section>
      </main>
    </VibeLayout>
  );
}
