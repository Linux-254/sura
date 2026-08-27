import { useState } from "react";
import { ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleDollarSign,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Share2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { VibeLayout, formatKes, labelize } from "@/components/VibeLayout";
import { SuraSignalRail } from "@/components/SuraSignalRail";
import { SuraImage } from "@/components/SuraImage";
import { trpc } from "@/lib/trpc";

function parsePostTags(raw: string | null) {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string").slice(0, 4) : [];
  } catch {
    return [];
  }
}

const pulseItems = [
  { label: "Nairobi", value: "18 new drops" },
  { label: "Mombasa", value: "6 new drops" },
  { label: "Kisumu", value: "4 new drops" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const vendors = trpc.vendors.list.useQuery(undefined);
  const featured = vendors.data?.slice(0, 3) ?? [];

  return (
    <VibeLayout>
      <main className="grid min-w-0 gap-8 px-4 pb-28 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8 lg:pb-16">
        <div className="min-w-0">
          <section className="border-b border-[#e1d9ce] pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="vb-kicker text-[#a66231]">{isAuthenticated ? `Welcome back, ${user?.name?.split(" ")[0] || "member"}` : "SURA / NAIROBI"}</p>
                <h1 className="vb-display mt-2 text-3xl text-[#211d18] sm:text-4xl">The signal is moving.</h1>
              </div>
              <Link href="/discover" className="vb-focus hidden items-center gap-1 text-xs font-bold text-[#695b4d] sm:inline-flex">See all <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="mt-5 flex items-center gap-5 overflow-x-auto text-sm font-semibold">
              <button className="border-b-2 border-[#201c17] pb-3 text-[#201c17]">For you</button>
              <button onClick={() => { if (!isAuthenticated) startLogin(); else document.getElementById("sura-live-signal")?.scrollIntoView({ behavior: "smooth" }); }} className="pb-3 text-[#938475] hover:text-[#201c17]">Following</button>
              <button onClick={() => setLocation("/discover")} className="pb-3 text-[#938475] hover:text-[#201c17]">Nearby</button>
            </div>
          </section>

          <SuraSignalRail vendors={featured} onOpen={(vendor) => vendor?.slug ? setLocation(`/vendors/${vendor.slug}`) : setLocation("/discover")} />

          <SocialPostStream />

          <section className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><button onClick={() => setLocation("/brief")} className="vb-focus inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1f1b17] px-4 py-2.5 text-xs font-bold text-[#fbf8f2]"><Plus className="h-3.5 w-3.5" />Make a signal</button><button onClick={() => setLocation("/ai-studio")} className="vb-focus inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d8cdbf] bg-[#f4eee6] px-4 py-2.5 text-xs font-bold text-[#382f26]"><Sparkles className="h-3.5 w-3.5 text-[#a66231]" />AI lens</button><button onClick={() => setLocation("/board")} className="vb-focus inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d8cdbf] bg-[#fffdf9] px-4 py-2.5 text-xs font-bold text-[#382f26]"><Bookmark className="h-3.5 w-3.5 text-[#a66231]" />Saved shelf</button></section>

          <section className="rounded-2xl border border-[#dfd5c7] bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(49,34,18,0.04)] sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div className="min-w-0"><p className="vb-kicker text-[#a66231]">Quick launch</p><p className="mt-1 text-sm font-black text-[#31281f]">Shape something new</p><p className="mt-0.5 truncate text-xs text-[#918271]">Start with a budget, a mood, or a moment.</p></div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:w-[19rem]"><button onClick={() => setLocation("/brief")} className="vb-button vb-focus inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f1b17] px-3 py-2.5 text-xs font-bold text-[#fbf8f2]"><Plus className="h-3.5 w-3.5" />Create</button><button onClick={() => setLocation("/ai-studio")} className="vb-button vb-focus inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8cdbf] bg-[#f4eee6] px-3 py-2.5 text-xs font-bold text-[#382f26] hover:border-[#a66231]"><Sparkles className="h-3.5 w-3.5 text-[#a66231]" />AI Studio</button></div>
          </section>

          <section className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#1b1e16] p-6 text-[#f7f4ed] shadow-[0_18px_42px_rgba(31,26,16,0.16)] sm:p-8">
            <div className="absolute inset-y-0 right-0 -z-10 w-2/5 bg-[radial-gradient(circle_at_60%_45%,rgba(215,255,77,0.45),transparent_62%)]" />
            <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-[#d7ff4d]/15" />
            <div className="max-w-[27rem]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#d7ff4d]"><Zap className="h-3.5 w-3.5" /> Featured edit · 01</div>
              <h2 className="mt-4 text-4xl font-black leading-[0.92] tracking-[-0.06em] sm:text-5xl">The Nairobi<br /><span className="text-[#d7ff4d]">After Five.</span></h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#c5c5b9]">A flexible evening look built around one precise line and one strong second-hand find.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3"><Link href="/brief" className="vb-button vb-focus inline-flex items-center gap-2 rounded-xl bg-[#f7f4ed] px-4 py-3 text-sm font-bold text-[#1b1e16]">Open the edit <ArrowUpRight className="h-4 w-4" /></Link><span className="text-xs font-semibold text-[#a8aa9d]">from {formatKes(9400)}</span></div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[42%] overflow-hidden sm:block"><img src="/assets/stitch/signal-chair.jpg" alt="" className="h-full w-full object-cover opacity-55 mix-blend-screen [mask-image:linear-gradient(to_right,transparent,black_38%)]" /></div>
          </section>

          <div className="mt-6 flex items-center justify-between"><div><p className="vb-kicker text-[#a66231]">The local pulse</p><h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#262019]">Fresh from the network.</h2></div><span className="rounded-full bg-[#eee5d8] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#735e49]">Demo feed</span></div>

          <section className="mt-2 divide-y divide-[#e5ddd2]">
            {vendors.isLoading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="grid animate-pulse gap-4 py-6 sm:grid-cols-[1fr_10rem]"><div><div className="h-3 w-32 rounded bg-[#e1d8cb]" /><div className="mt-4 h-5 w-3/4 rounded bg-[#e1d8cb]" /><div className="mt-3 h-12 w-full rounded bg-[#e1d8cb]" /></div><div className="h-32 rounded-2xl bg-[#e1d8cb]" /></div>)}
            {vendors.isError && <div className="my-5 rounded-2xl border border-[#ddb09f] bg-[#fff3ed] p-6"><p className="font-bold text-[#632f21]">The local pulse is taking a moment.</p><button onClick={() => vendors.refetch()} className="mt-3 text-sm font-bold text-[#8b3d2d] underline underline-offset-4">Reload the feed</button></div>}
            {!vendors.isLoading && !vendors.isError && featured.map((vendor, index) => <FeedPost key={vendor.id} vendor={vendor} index={index} onOpen={() => setLocation(`/vendors/${vendor.slug}`)} onSave={() => isAuthenticated ? setLocation("/board") : startLogin()} />)}
          </section>

          <section className="mt-5 rounded-2xl border border-[#ded5c9] bg-[#eee7dc] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><p className="vb-kicker text-[#a66231]">Your next post starts here</p><h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#272019]">Have a number in mind?</h2><p className="mt-1 text-sm leading-6 text-[#75695b]">Turn a feeling, room, occasion, or idea into a clear local brief.</p></div><Link href="/brief" className="vb-button vb-focus mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1f1b17] px-4 py-3 text-sm font-bold text-[#fbf8f2] sm:mt-0">Create brief <ArrowUpRight className="h-4 w-4" /></Link></section>
        </div>

        <aside className="hidden space-y-5 lg:block">
          <section className="rounded-2xl border border-[#ded5c9] bg-[#fffdf9] p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-black text-[#2a221b]">Local pulse</h2><Users className="h-4 w-4 text-[#a66231]" /></div><p className="mt-1 text-xs leading-5 text-[#837566]">What’s active across the Sura network.</p><div className="mt-4 space-y-2">{pulseItems.map((item, index) => <Link key={item.label} href="/discover" className="vb-focus flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-[#f1eae0]"><span className="flex items-center gap-2.5 text-xs font-bold text-[#4d4034]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#eee5d8] text-[0.62rem] text-[#a66231]">0{index + 1}</span>{item.label}</span><span className="text-[0.63rem] font-semibold text-[#938475]">{item.value}</span></Link>)}</div><Link href="/discover" className="mt-3 flex items-center justify-between border-t border-[#e9e0d4] pt-3 text-xs font-bold text-[#a66231]">Explore nearby <ChevronRight className="h-3.5 w-3.5" /></Link></section>
          <section className="rounded-2xl bg-[#d7ff4d] p-5 text-[#19210d]"><Sparkles className="h-5 w-5" /><p className="mt-4 text-xs font-black uppercase tracking-[0.12em]">Sura signal</p><p className="mt-2 text-xl font-black leading-[1.05] tracking-[-0.04em]">Your budget is a creative direction.</p><p className="mt-3 text-xs leading-5 text-[#4e5d2e]">Give us the range. We’ll help you find the shape.</p><Link href="/brief" className="vb-focus mt-5 inline-flex items-center gap-2 rounded-xl bg-[#19210d] px-3.5 py-2.5 text-xs font-bold text-[#f2f7dc]">Start shaping <ArrowUpRight className="h-3.5 w-3.5" /></Link></section>
          <section className="rounded-2xl border border-[#ded5c9] bg-[#fffdf9] p-5"><p className="vb-kicker text-[#a66231]">Sura is for</p><div className="mt-4 space-y-3 text-sm font-bold text-[#4d4034]"><p className="flex items-center gap-3"><Check className="h-4 w-4 text-[#a66231]" />People with a point of view</p><p className="flex items-center gap-3"><Check className="h-4 w-4 text-[#a66231]" />Makers worth finding</p><p className="flex items-center gap-3"><Check className="h-4 w-4 text-[#a66231]" />Plans with a clear next step</p></div></section>
        </aside>
      </main>
    </VibeLayout>
  );
}

function SocialPostStream() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"forYou" | "following">("forYou");
  const feed = trpc.social.feed.useQuery({ mode });
  const likePost = trpc.social.likePost.useMutation({ onSuccess: () => feed.refetch() });
  const repostPost = trpc.social.repostPost.useMutation({ onSuccess: () => feed.refetch() });

  const requireAuth = (action: () => void) => { if (!isAuthenticated) startLogin(); else action(); };

  return <section id="sura-live-signal" className="mt-7 overflow-hidden rounded-[1.6rem] border border-[#ded5c9] bg-[#fffdf9] shadow-[0_14px_34px_rgba(55,39,19,0.05)]"><div className="border-b border-[#e7ded3] p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="vb-kicker text-[#a66231]">SURA / LIVE SIGNAL</p><h2 className="vb-display mt-2 text-2xl text-[#272019]">Aesthetic signals worth carrying.</h2><p className="mt-1 text-sm leading-6 text-[#75695b]">Follow a studio, find a feeling, and pass the good ones on.</p></div><Link href="/discover" className="vb-focus inline-flex items-center gap-1 text-xs font-bold text-[#795634]">Explore studios <ArrowUpRight className="h-3.5 w-3.5" /></Link></div><div className="mt-5 flex items-center gap-5 text-sm font-bold"><button onClick={() => setMode("forYou")} className={mode === "forYou" ? "border-b-2 border-[#201c17] pb-2 text-[#201c17]" : "pb-2 text-[#938475]"}>For you</button><button onClick={() => isAuthenticated ? setMode("following") : startLogin()} className={mode === "following" ? "border-b-2 border-[#201c17] pb-2 text-[#201c17]" : "pb-2 text-[#938475]"}>Following</button>{mode === "following" && <span className="text-xs font-medium text-[#938475]">Your follows and trusted signals</span>}</div></div><div className="divide-y divide-[#e7ded3]">{feed.isLoading && <div className="p-6 text-sm text-[#75695b]">Loading the local signal…</div>}{feed.isError && <div className="p-6 text-sm text-[#8c3c2b]">The signal could not load right now.</div>}{!feed.isLoading && !feed.isError && feed.data?.length === 0 && <div className="p-6"><p className="text-sm font-bold text-[#382f26]">{mode === "following" ? "Your Following signal is still quiet." : "No business signals are live yet."}</p><p className="mt-1 text-sm leading-6 text-[#75695b]">{mode === "following" ? "Follow a studio or person to build a feed that feels like yours." : "Verified studios will appear here when their first visual signal is approved."}</p><Link href="/discover" className="vb-focus mt-4 inline-flex text-sm font-bold text-[#a66231]">{mode === "following" ? "Find your first direction" : "Explore the network"} <ArrowUpRight className="ml-1 h-4 w-4" /></Link></div>}{feed.data?.map((item) => <article key={item.post.id} className="p-5 sm:p-6"><div className="flex items-center gap-3"><Link href={`/studios/${item.company.slug}`} className="vb-focus grid h-9 w-9 place-items-center rounded-xl bg-[#d7ff4d] text-xs font-black text-[#1a220e]">{item.company.name.slice(0, 1)}</Link><div className="min-w-0 flex-1"><Link href={`/studios/${item.company.slug}`} className="vb-focus block truncate text-sm font-black text-[#342a21]">{item.company.name}</Link><p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-[#968675]"><MapPin className="h-3 w-3" />{item.company.city || "Kenya"}{item.reason === "liked_by_following" && " · liked by someone you follow"}</p></div><Link href={`/studios/${item.company.slug}`} className="vb-focus rounded-full border border-[#d9c9b7] px-3 py-1.5 text-[0.65rem] font-bold text-[#795634]">View studio</Link></div><div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center"><div><h3 className="text-xl font-black leading-[1.04] tracking-[-0.04em] text-[#282019]">{item.post.title}</h3>{item.post.caption && <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#796c5c]">{item.post.caption}</p>}<div className="mt-3 flex flex-wrap gap-2">{parsePostTags(item.post.aestheticTags).map((tag) => <span key={tag} className="rounded-full bg-[#eee5d8] px-2.5 py-1 text-[0.68rem] font-semibold text-[#735e49]">{tag}</span>)}</div></div><Link href={`/studios/${item.company.slug}`} className="vb-focus group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ded4c7]"><img src={item.post.imageUrl} alt={item.post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></Link></div><footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eee7dd] pt-3"><button onClick={() => requireAuth(() => likePost.mutate({ postId: item.post.id, shouldLike: !item.liked }))} disabled={likePost.isPending} className={`vb-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold ${item.liked ? "text-[#a66231]" : "text-[#857767]"}`}><Heart className={item.liked ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"} />{item.likeCount} {item.liked ? "Curated" : "Curate"}</button><button onClick={() => requireAuth(() => repostPost.mutate({ postId: item.post.id, shouldRepost: !item.reposted }))} disabled={repostPost.isPending} className={`vb-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold ${item.reposted ? "text-[#a66231]" : "text-[#857767]"}`}><Repeat2 className="h-3.5 w-3.5" />{item.repostCount} {item.reposted ? "Carried" : "Repost"}</button><Link href={`/studios/${item.company.slug}`} className="vb-focus ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#857767]">Contact studio <MessageCircle className="h-3.5 w-3.5" /></Link></footer></article>)}</div></section>;
}

function FeedPost({ vendor, index, onOpen, onSave }: { vendor: any; index: number; onOpen: () => void; onSave: () => void }) {
  return <article className="py-6 first:pt-5"><header className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${index === 1 ? "bg-[#f2c6b3] text-[#653526]" : index === 2 ? "bg-[#d8caef] text-[#48396b]" : "bg-[#d7ff4d] text-[#1a220e]"}`}>{vendor.name.slice(0, 1)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#342a21]">{vendor.name}</p><p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-[#968675]"><MapPin className="h-3 w-3" />{vendor.neighbourhood} · {labelize(vendor.type)}</p></div><button onClick={onOpen} className="vb-focus rounded-lg p-1.5 text-[#9a8b7a] hover:bg-[#eee7dc] hover:text-[#342a21]" aria-label={`Open ${vendor.name}`}><MoreHorizontal className="h-4 w-4" /></button></header><div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center"><div><button onClick={onOpen} className="vb-focus text-left"><h3 className="text-xl font-black leading-[1.04] tracking-[-0.04em] text-[#282019] hover:text-[#a66231]">{index === 0 ? "A sharp-eyed edit for the week ahead." : index === 1 ? "Objects with a second life worth styling." : "A softer way to make space work."}</h3></button><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#796c5c]">{vendor.description}</p><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#837566]"><span className="rounded-full bg-[#eee5d8] px-2.5 py-1 text-[#735e49]">From {formatKes(vendor.priceFloorKes)}</span><span>·</span><span>Demo profile</span></div></div><button onClick={onOpen} className="vb-focus group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ded4c7]"><SuraImage src={vendor.portfolio[0]} fallbackSrc="/assets/stitch/signal-chair.jpg" alt={`${vendor.name} demonstration portfolio`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[#fbf8f2]/90 text-[#2c251e]"><ArrowUpRight className="h-3.5 w-3.5" /></span></button></div><footer className="mt-5 flex items-center gap-1 border-t border-[#eee7dd] pt-3"><button onClick={onOpen} className="vb-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#857767] hover:bg-[#f0e9df] hover:text-[#a66231]"><Heart className="h-3.5 w-3.5" /> Curate</button><button onClick={onOpen} className="vb-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#857767] hover:bg-[#f0e9df] hover:text-[#a66231]"><MessageCircle className="h-3.5 w-3.5" /> Discuss</button><button onClick={onSave} className="vb-focus ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#857767] hover:bg-[#f0e9df] hover:text-[#a66231]"><Bookmark className="h-3.5 w-3.5" /> Save</button><button onClick={onOpen} className="vb-focus rounded-lg p-2 text-[#857767] hover:bg-[#f0e9df] hover:text-[#a66231]" aria-label="Share post"><Share2 className="h-3.5 w-3.5" /></button></footer></article>;
}
