import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { DemoVendor } from "../../../server/vibebuild-data";
import { formatKes, labelize } from "./VibeLayout";
import { SuraImage } from "./SuraImage";

export function VendorCard({ vendor, compact = false }: { vendor: DemoVendor; compact?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-[#d9cebd] bg-[#fbf8f2] shadow-[0_12px_32px_rgba(53,39,22,0.06)]">
      <Link href={`/vendors/${vendor.slug}`} className="block overflow-hidden">
        <SuraImage src={vendor.portfolio[0]} fallbackSrc="/assets/sura-auth-street.jpg" alt={`${vendor.name} demonstration portfolio`} className={`vb-image w-full object-cover ${compact ? "h-44" : "h-60"}`} />
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="vb-kicker text-[#a8632b]">{labelize(vendor.type)}</span>
          <span className="rounded-full border border-[#d9cebd] px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#756958]">Demo</span>
        </div>
        <Link href={`/vendors/${vendor.slug}`} className="vb-focus mt-3 flex items-start justify-between gap-3 text-[#211c17]">
          <h3 className="vb-serif text-2xl leading-[1.05]">{vendor.name}</h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#b77835]" />
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#706453]">{vendor.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#e0d6c8] pt-3 text-xs text-[#706453]">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#b77835]" />{vendor.neighbourhood}</span>
          <span>{formatKes(vendor.priceFloorKes)}+</span>
        </div>
      </div>
    </article>
  );
}
