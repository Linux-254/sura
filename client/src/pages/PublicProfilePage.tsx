import { ArrowLeft, ExternalLink, Globe2, MapPin, UserRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { VibeLayout } from "@/components/VibeLayout";
import { SuraShelf } from "@/components/SuraShelf";
import { trpc } from "@/lib/trpc";

const platformLabels: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", linkedin: "LinkedIn", youtube: "YouTube", x: "X", website: "Website" };
type PublicLink = { id: number; platform: string; url: string };

function UnavailableProfile() {
  return <VibeLayout><main className="container grid min-h-[60vh] place-items-center"><section className="max-w-md rounded-[1.5rem] border border-[#ded1bf] bg-[#fbf8f2] p-8 text-center"><UserRound className="mx-auto h-7 w-7 text-[#a96b35]" /><h1 className="vb-serif mt-4 text-3xl">This public profile is not available.</h1><p className="mt-3 text-sm leading-6 text-[#756655]">It may be private, unverified, or no longer active.</p><Link href="/" className="vb-focus mt-6 inline-flex rounded-full bg-[#1d1b18] px-5 py-3 text-sm font-bold text-[#fbf7ef]">Return to SURA</Link></section></main></VibeLayout>;
}

function PublicProfileShell({ label, title, description, city, links, websiteUrl }: { label: string; title: string | null; description?: string | null; city?: string | null; links: PublicLink[]; websiteUrl?: string | null }) {
  return <VibeLayout><main className="container max-w-5xl pb-20 pt-10 sm:pt-16"><Link href="/" className="vb-focus inline-flex items-center gap-2 text-sm font-bold text-[#795634]"><ArrowLeft className="h-4 w-4" />Back to SURA</Link><section className="mt-8 overflow-hidden rounded-[2rem] border border-[#ded1bf] bg-[#fbf8f2] shadow-[0_18px_50px_rgba(59,41,22,0.07)]"><div className="vb-ink p-7 text-[#fbf5ec] sm:p-12"><p className="vb-kicker text-[#d7a261]">{label}</p><h1 className="vb-serif mt-4 text-5xl leading-[0.94] sm:text-6xl">{title || "SURA profile"}</h1>{city && <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#d8cabc]"><MapPin className="h-4 w-4 text-[#d7a261]" />{city} · Kenya</p>}</div><div className="grid gap-8 p-7 sm:grid-cols-[1.05fr_0.95fr] sm:p-12"><div><p className="vb-kicker text-[#9d5b2d]">Public profile</p><p className="mt-4 text-base leading-7 text-[#665746]">{description || "A considered SURA public presence."}</p>{websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" className="vb-focus mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#795634]">Visit website <ExternalLink className="h-4 w-4" /></a>}</div><aside className="rounded-[1.5rem] border border-[#e2d7c9] bg-[#fffdf9] p-5"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-[#a96b35]" /><p className="text-sm font-bold text-[#3d2f23]">Selected public links</p></div><div className="mt-4 space-y-2">{links.length === 0 && <p className="text-sm text-[#7a6b59]">No public links have been shared.</p>}{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="vb-focus flex items-center justify-between rounded-xl border border-[#e6dbcf] px-3 py-3 text-sm font-semibold text-[#553e28] hover:border-[#b8824f]"><span>{platformLabels[link.platform]}</span><ExternalLink className="h-3.5 w-3.5 text-[#a96b35]" /></a>)}</div></aside></div><SuraShelf title={label === "SURA COMPANY" ? "A company shelf" : "A personal shelf"} /></section></main></VibeLayout>;
}

export default function PublicProfilePage({ kind }: { kind: "person" | "company" }) {
  const [, params] = useRoute(kind === "person" ? "/people/:slug" : "/studios/:slug");
  const slug = params?.slug ?? "";
  const person = trpc.account.publicProfile.useQuery({ slug }, { enabled: kind === "person" && Boolean(slug) });
  const company = trpc.companies.publicProfile.useQuery({ slug }, { enabled: kind === "company" && Boolean(slug) });
  if (kind === "person") {
    if (person.isLoading) return <VibeLayout><main className="container grid min-h-[60vh] place-items-center"><div className="h-12 w-12 animate-pulse rounded-2xl bg-[#e5d6c2]" /></main></VibeLayout>;
    if (person.isError || !person.data) return <UnavailableProfile />;
    return <PublicProfileShell label="SURA PERSON" title={person.data.profile.displayName} description={person.data.profile.bio} city={person.data.profile.city} links={person.data.socialLinks} />;
  }
  if (company.isLoading) return <VibeLayout><main className="container grid min-h-[60vh] place-items-center"><div className="h-12 w-12 animate-pulse rounded-2xl bg-[#e5d6c2]" /></main></VibeLayout>;
  if (company.isError || !company.data) return <UnavailableProfile />;
  return <PublicProfileShell label="SURA COMPANY" title={company.data.company.name} description={company.data.company.description} city={company.data.company.city} websiteUrl={company.data.company.websiteUrl} links={company.data.socialLinks} />;
}
