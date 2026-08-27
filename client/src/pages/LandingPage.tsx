import { ArrowRight, ArrowUpRight, Heart, MapPin, Star } from "lucide-react";
import { Link } from "wouter";

const frames = [
  { image: "/assets/stitch/landing-friends.jpg", alt: "A candid local moment", tilt: "-rotate-6", position: "left-0 top-16" },
  { image: "/assets/stitch/landing-portrait.jpg", alt: "A close visual detail", tilt: "rotate-0", position: "left-1/2 top-0 -translate-x-1/2" },
  { image: "/assets/stitch/landing-street.jpg", alt: "A moving street direction", tilt: "rotate-6", position: "right-0 top-28" },
];

export default function LandingPage() {
  return (
    <main className="vb-ink relative flex min-h-screen flex-col overflow-hidden px-4 py-6 text-[#e3e3dc] sm:px-8 sm:py-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true"><div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#caff32]/10 blur-3xl" /><div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#454935]/50 blur-3xl" /></div>
      <header className="relative z-10 flex items-center justify-between gap-4"><Link href="/" className="vb-focus"><img src="/sura-wordmark.svg" alt="SURA" className="h-10 w-auto sm:h-12" /></Link><div className="flex items-center gap-3"><span className="hidden border border-white/[0.15] px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#c5c9af] sm:inline-flex">Landing signal</span><Link href="/join" className="vb-focus text-xs font-black uppercase tracking-[0.12em] text-[#caff32]">Enter Sura <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link></div></header>

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-14 sm:py-20">
        <p className="sura-signal-chip px-3 py-2">A visual network for how you want life to feel</p>
        <h1 className="vb-display mt-7 max-w-4xl text-center text-5xl text-[#e3e3dc] sm:text-7xl lg:text-8xl">See everyday moments from your <span className="text-[#caff32]">own direction.</span></h1>
        <p className="mt-6 max-w-xl text-center text-base leading-7 text-[#c5c9af] sm:text-lg">Find the people, objects, spaces, makers, and small details that make an aesthetic feel like yours.</p>

        <div className="relative mt-12 h-[24rem] w-full max-w-4xl sm:h-[32rem]" style={{ perspective: "1100px" }}>
          {frames.map((frame, index) => <div key={frame.image} className={`group absolute ${frame.position} h-[21rem] w-[13.5rem] overflow-hidden border border-white/[0.16] bg-[#1e201c] shadow-2xl transition-transform duration-500 hover:z-20 hover:rotate-0 hover:scale-105 sm:h-[28rem] sm:w-[18rem] ${frame.tilt}`} style={{ transformStyle: "preserve-3d", zIndex: index === 1 ? 10 : 5 }}><img src={frame.image} alt={frame.alt} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:opacity-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0b]/80 via-transparent to-transparent" />{index === 1 && <div className="absolute inset-x-4 bottom-4"><div className="flex items-center gap-2 text-[#caff32]"><div className="h-1 w-24 bg-[#caff32]" /><Heart className="h-4 w-4 fill-current" /></div><p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#e3e3dc]">A moment worth carrying</p></div>}{index === 0 && <div className="absolute -right-4 top-10 grid h-10 w-10 place-items-center rounded-full bg-[#caff32] text-[#293500]"><Star className="h-4 w-4 fill-current" /></div>}</div>)}
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-5 border-t border-white/[0.12] pt-5 sm:flex-row"><div className="flex items-center gap-2 text-xs font-semibold text-[#c5c9af]"><MapPin className="h-3.5 w-3.5 text-[#caff32]" />Nairobi · Kenya · local signal active</div><Link href="/discover" className="vb-button vb-focus inline-flex items-center gap-2 bg-[#caff32] px-6 py-3.5 text-sm font-black text-[#293500]">Explore the Signal <ArrowRight className="h-4 w-4" /></Link></footer>
    </main>
  );
}
