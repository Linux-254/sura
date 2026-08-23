import { ArrowLeft, ArrowUpRight, BadgeCheck, Box, Check, Clock3, MapPin, ShieldCheck, Tag } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductGallery, parseProductImages } from "@/components/ProductGallery";
import { QuoteCard } from "@/pages/CommercePages";
import { SuraErrorState, SuraPageSkeleton } from "@/components/SuraStates";
import { VibeLayout, formatKes, labelize } from "@/components/VibeLayout";
import { useKenyaLocation } from "@/contexts/KenyaLocationContext";
import { trpc } from "@/lib/trpc";

type ProductDiscount = { id: number; code: string; title: string; description: string | null; discountType: "percentage" | "fixed_kes"; discountValue: number; minimumSpendKes: number | null; validUntil: Date | string | null; savingsKes: number; salePriceKes: number; label: string };

export default function ProductDetailPage() {
  const [, params] = useRoute("/shop/:id");
  const productId = Number(params?.id ?? 0);
  const { isAuthenticated } = useAuth();
  const { city } = useKenyaLocation();
  const productQuery = trpc.commerce.product.useQuery({ productId }, { enabled: productId > 0 });

  if (productQuery.isLoading) return <VibeLayout><main className="px-4 pb-28 pt-8 sm:px-6 lg:px-8"><SuraPageSkeleton cards={2} /></main></VibeLayout>;
  if (productQuery.isError || !productQuery.data) return <VibeLayout><main className="px-4 pb-28 pt-8 sm:px-6 lg:px-8"><SuraErrorState title="This product is not available." copy="The company may have paused the item or it may not yet be visible through the verified shop." onRetry={() => productQuery.refetch()} /><Link href="/shop" className="vb-focus mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#8d5b32]"><ArrowLeft className="h-4 w-4" />Back to connected shops</Link></main></VibeLayout>;

  const { product, company, discounts } = productQuery.data;
  const images = parseProductImages(product);
  const discount = discounts[0] as ProductDiscount | undefined;
  const sizeOptions = parseSizeOptions(product.sizeOptions);
  const cityName = city ?? "Nairobi";

  return <VibeLayout><main className="px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-16"><Link href="/shop" className="vb-focus inline-flex items-center gap-2 text-sm font-bold text-[#806040] hover:text-[#a66231]"><ArrowLeft className="h-4 w-4" />Back to connected shops</Link><div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.85fr)] lg:items-start">
    <section><ProductGallery images={images} name={product.name} /><div className="mt-4 flex items-center gap-2 text-xs text-[#8a7a68]"><ShieldCheck className="h-3.5 w-3.5 text-[#a66231]" />Verified company listing · images and details supplied by the company</div></section>
    <section className="lg:sticky lg:top-24"><div className="flex items-center justify-between gap-3"><p className="vb-kicker text-[#a66231]">{labelize(product.category)} · {company.city ?? "Kenya"}</p>{product.stockQuantity > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5d8] px-2.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.08em] text-[#53652b]"><span className="h-1.5 w-1.5 rounded-full bg-[#8cae35]" />In stock</span>}</div><h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#211b16] sm:text-5xl">{product.name}</h1><p className="mt-5 text-base leading-7 text-[#665848]">{product.description}</p><div className="mt-6 flex flex-wrap items-end gap-3"><div><p className="text-xs font-semibold text-[#8c7b68]">{discount ? "Member price" : "Company price"}</p><p className="text-4xl font-black tracking-[-0.06em] text-[#211b16]">{formatKes(discount?.salePriceKes ?? product.priceKes)}</p></div>{discount && <div className="pb-1"><del className="text-sm text-[#9a8977]">{formatKes(product.priceKes)}</del><p className="text-xs font-bold text-[#829f31]">You save {formatKes(discount.savingsKes)}</p></div>}</div>
    {discount && <div className="mt-6 rounded-2xl border border-[#c8dc85] bg-[#f0f6dc] p-4"><div className="flex items-start gap-3"><Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#708a2e]" /><div><p className="text-sm font-black text-[#3f501d]">{discount.title} · {discount.label}</p><p className="mt-1 text-xs leading-5 text-[#65763b]">Use code <strong>{discount.code}</strong>{discount.minimumSpendKes ? ` at checkout with a minimum spend of ${formatKes(discount.minimumSpendKes)}.` : "."} {discount.description || "Offer terms are set by the company and reviewed by Sura."}</p></div></div></div>}
    <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#e1d7ca] bg-[#fffdf9] p-4 text-sm"><div className="flex items-start gap-2"><Box className="mt-0.5 h-4 w-4 text-[#a66231]" /><div><p className="text-xs text-[#8b7a68]">Available</p><p className="mt-1 font-bold text-[#3d3127]">{product.stockQuantity > 0 ? `${product.stockQuantity} units` : "Sold out"}</p></div></div><div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-[#a66231]" /><div><p className="text-xs text-[#8b7a68]">Delivery</p><p className="mt-1 font-bold text-[#3d3127]">From {cityName}</p></div></div></div>
    {sizeOptions.length > 0 && <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.08em] text-[#806b56]">Available options</p><div className="mt-2 flex flex-wrap gap-2">{sizeOptions.map((size) => <span key={size} className="rounded-full border border-[#d9cdbd] bg-[#fffdf9] px-3 py-2 text-xs font-bold text-[#554638]">{size}</span>)}</div></div>}
    <div className="mt-6 rounded-2xl border border-[#ded5c9] bg-[#f4eee6] p-5"><div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#a66231]" /><div><p className="text-sm font-black text-[#34291f]">{company.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#806f5d]"><MapPin className="h-3 w-3" />{company.city ?? "Kenya"} · Verified Sura company</p><Link href={`/company/${company.id}`} className="vb-focus mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#a66231]">View company space <ArrowUpRight className="h-3.5 w-3.5" /></Link></div></div></div>
    <QuoteCard productId={product.id} city={cityName} isAuthenticated={isAuthenticated} /></section>
  </div><section className="mt-10 border-t border-[#e3d9cd] pt-8"><div className="grid gap-5 md:grid-cols-3"><InfoBlock title="Clear description" copy="Companies provide the product details, options, and fulfilment context shown on this page." /><InfoBlock title="Transparent price" copy="Discounts are shown beside the original company price and only activate after Sura approval." /><InfoBlock title="Verified route" copy="Only active products from verified companies appear in connected shops." /></div></section></main></VibeLayout>;
}

function InfoBlock({ title, copy }: { title: string; copy: string }) { return <div className="rounded-2xl border border-[#e1d7ca] bg-[#fffdf9] p-5"><Check className="h-4 w-4 text-[#a66231]" /><h2 className="mt-4 text-sm font-black text-[#332920]">{title}</h2><p className="mt-2 text-xs leading-5 text-[#7c6c5b]">{copy}</p></div>; }
function parseSizeOptions(value: string | null) { try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0) : []; } catch { return []; } }
