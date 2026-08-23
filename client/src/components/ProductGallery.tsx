import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SuraImage } from "@/components/SuraImage";

type ProductGalleryProps = {
  images: string[];
  name: string;
  compact?: boolean;
};

export function ProductGallery({ images, name, compact = false }: ProductGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, safeImages.length - 1)));
  }, [safeImages.length]);

  useEffect(() => {
    if (compact || safeImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % safeImages.length), 5000);
    return () => window.clearInterval(timer);
  }, [compact, safeImages.length]);

  if (!safeImages.length) {
    return <div className={`grid place-items-center bg-[#eee5d8] ${compact ? "aspect-[4/3]" : "min-h-[25rem]"}`}><ImageIcon className="h-8 w-8 text-[#a66231]" /></div>;
  }

  const activeImage = safeImages[activeIndex] ?? safeImages[0];
  const move = (delta: number) => setActiveIndex((current) => (current + delta + safeImages.length) % safeImages.length);

  return <div className="space-y-3">
    <div className={`group relative overflow-hidden rounded-2xl bg-[#eee5d8] ${compact ? "aspect-[4/3]" : "min-h-[25rem] sm:min-h-[34rem]"}`}>
      <SuraImage src={activeImage} fallbackSrc="/assets/sura-auth-interior.jpg" alt={`${name} product image ${activeIndex + 1} of ${safeImages.length}`} className="h-full w-full object-cover transition-opacity duration-300" />
      {safeImages.length > 1 && <><div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" /><div className="absolute inset-x-3 bottom-3 flex items-end justify-between"><span className="rounded-full bg-[#171813]/75 px-2.5 py-1.5 text-[0.62rem] font-bold text-white backdrop-blur">{activeIndex + 1} / {safeImages.length}</span><div className="flex gap-1.5"><button onClick={() => move(-1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full bg-[#fbf8f2]/90 text-[#252019] shadow-sm" aria-label="Previous product image"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => move(1)} className="vb-focus grid h-8 w-8 place-items-center rounded-full bg-[#fbf8f2]/90 text-[#252019] shadow-sm" aria-label="Next product image"><ChevronRight className="h-4 w-4" /></button></div></div></>}
    </div>
    {safeImages.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1" aria-label={`${name} image gallery`}>{safeImages.map((image, index) => <button key={`${image}-${index}`} onClick={() => setActiveIndex(index)} className={`vb-focus relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#eee5d8] ${activeIndex === index ? "border-[#a66231]" : "border-transparent opacity-65 hover:opacity-100"}`} aria-label={`View ${name} image ${index + 1}`} aria-pressed={activeIndex === index}><SuraImage src={image} fallbackSrc="/assets/sura-auth-street.jpg" alt="" className="h-full w-full object-cover" /></button>)}</div>}
  </div>;
}

export function parseProductImages(product: { imageUrl?: string | null; imageUrls?: string[] | string | null }) {
  const stored = Array.isArray(product.imageUrls) ? product.imageUrls : typeof product.imageUrls === "string" ? parseStoredImages(product.imageUrls) : [];
  return Array.from(new Set([product.imageUrl, ...stored].filter((url): url is string => Boolean(url)))).slice(0, 8);
}

function parseStoredImages(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
