import type { AestheticName } from "@/contexts/AestheticThemeContext";

export const AESTHETIC_EXPRESSIONS: Record<AestheticName, { mood: string; cues: string[]; note: string }> = {
  "Soft Power": { mood: "Warm restraint with a polished edge.", cues: ["tailored silhouettes", "cream ceramics", "quiet gold hardware"], note: "For a composed expression that never needs to shout." },
  "Thrift Remix": { mood: "Layered, clever, and unmistakably personal.", cues: ["reworked denim", "mixed prints", "found-object detail"], note: "For original combinations and resourceful styling." },
  "Heritage Modern": { mood: "Contemporary form with material intelligence.", cues: ["carved wood", "sisal texture", "clean-lined foundations"], note: "Local making is referenced with care, never costume." },
  "Comfort Official": { mood: "Useful, relaxed, and quietly elevated.", cues: ["soft knits", "natural wood", "considered function"], note: "For ease that still feels intentional." },
  "Coastal Ease": { mood: "Airy calm with sunlit warmth.", cues: ["linen texture", "curved forms", "woven detail"], note: "For a lighter pace and a clear horizon." },
  "Savanna Atelier": { mood: "Architectural, grounded, and understated.", cues: ["stone surfaces", "sisal weave", "acacia-toned shadow"], note: "A quiet earth-led direction for home or wardrobe." },
  "Ink & Ivory": { mood: "Gallery contrast with deliberate negative space.", cues: ["framed art", "clean tailoring", "restrained brass"], note: "For a crisp edit with room to breathe." },
  "Orchid After Dark": { mood: "Romantic, artistic, and softly cinematic.", cues: ["plum accents", "velvet texture", "candle cream"], note: "For depth, intimacy, and a confident evening note." },
  "Tangerine Social": { mood: "Joyful energy with a measured focal point.", cues: ["bold accessories", "playful ceramics", "mint counterpoint"], note: "For celebrations, hosting, and expressive small moments." },
  "Moss & Marigold": { mood: "Optimistic, tactile, and a little unexpected.", cues: ["plants", "brushed cotton", "hand-painted colour"], note: "For warmth without defaulting to predictable neutrals." },
  "Cobalt Ritual": { mood: "Cool, crafted, and confidently geometric.", cues: ["cobalt depth", "polished metal", "strong lines"], note: "For crisp contrast that still feels human." },
  "Thermal Bloom": { mood: "Futuristic colour with editorial energy.", cues: ["infrared gradients", "ember accents", "electric violet"], note: "For music-night confidence and experimental expression." },
};
