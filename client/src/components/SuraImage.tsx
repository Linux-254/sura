import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";

const DEFAULT_FALLBACK = "/assets/sura-auth-interior.jpg";

type SuraImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function SuraImage({ src, fallbackSrc = DEFAULT_FALLBACK, alt = "", ...props }: SuraImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return <img {...props} src={currentSrc} alt={alt} onError={() => { if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc); }} />;
}
