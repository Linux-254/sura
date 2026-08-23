export const KENYAN_COUNTIES = [
  { code: "001", name: "Mombasa", headquarters: "Mombasa", latitude: -4.0435, longitude: 39.6682 },
  { code: "002", name: "Kwale", headquarters: "Kwale", latitude: -4.1816, longitude: 39.4606 },
  { code: "003", name: "Kilifi", headquarters: "Kilifi", latitude: -3.6305, longitude: 39.8499 },
  { code: "004", name: "Tana River", headquarters: "Hola", latitude: -1.5224, longitude: 40.0045 },
  { code: "005", name: "Lamu", headquarters: "Lamu", latitude: -2.2696, longitude: 40.902 },
  { code: "006", name: "Taita Taveta", headquarters: "Voi", latitude: -3.3967, longitude: 38.5563 },
  { code: "007", name: "Garissa", headquarters: "Garissa", latitude: -0.4536, longitude: 39.6461 },
  { code: "008", name: "Wajir", headquarters: "Wajir", latitude: 1.7471, longitude: 40.0573 },
  { code: "009", name: "Mandera", headquarters: "Mandera", latitude: 3.9373, longitude: 41.8569 },
  { code: "010", name: "Marsabit", headquarters: "Marsabit", latitude: 2.3347, longitude: 37.9909 },
  { code: "011", name: "Isiolo", headquarters: "Isiolo", latitude: 0.3556, longitude: 37.5833 },
  { code: "012", name: "Meru", headquarters: "Meru", latitude: 0.05, longitude: 37.65 },
  { code: "013", name: "Tharaka-Nithi", headquarters: "Kathwana", latitude: -0.3, longitude: 37.95 },
  { code: "014", name: "Embu", headquarters: "Embu", latitude: -0.5389, longitude: 37.4596 },
  { code: "015", name: "Kitui", headquarters: "Kitui", latitude: -1.3667, longitude: 38.0167 },
  { code: "016", name: "Machakos", headquarters: "Machakos", latitude: -1.5177, longitude: 37.2634 },
  { code: "017", name: "Makueni", headquarters: "Wote", latitude: -1.8039, longitude: 37.6204 },
  { code: "018", name: "Nyandarua", headquarters: "Ol Kalou", latitude: -0.1804, longitude: 36.5227 },
  { code: "019", name: "Nyeri", headquarters: "Nyeri", latitude: -0.4201, longitude: 36.9476 },
  { code: "020", name: "Kirinyaga", headquarters: "Kerugoya", latitude: -0.4989, longitude: 37.2803 },
  { code: "021", name: "Murang'a", headquarters: "Murang'a", latitude: -0.721, longitude: 37.1526 },
  { code: "022", name: "Kiambu", headquarters: "Kiambu", latitude: -1.0314, longitude: 36.8681 },
  { code: "023", name: "Turkana", headquarters: "Lodwar", latitude: 3.1191, longitude: 35.5967 },
  { code: "024", name: "West Pokot", headquarters: "Kapenguria", latitude: 1.6211, longitude: 35.4624 },
  { code: "025", name: "Samburu", headquarters: "Maralal", latitude: 0.5143, longitude: 37.2655 },
  { code: "026", name: "Trans Nzoia", headquarters: "Kitale", latitude: 1.0157, longitude: 35.0062 },
  { code: "027", name: "Uasin Gishu", headquarters: "Eldoret", latitude: 0.5143, longitude: 35.2698 },
  { code: "028", name: "Elgeyo-Marakwet", headquarters: "Iten", latitude: 0.8044, longitude: 35.4911 },
  { code: "029", name: "Nandi", headquarters: "Kapsabet", latitude: 0.1833, longitude: 35.1333 },
  { code: "030", name: "Baringo", headquarters: "Kabarnet", latitude: 0.4667, longitude: 35.9667 },
  { code: "031", name: "Laikipia", headquarters: "Nanyuki", latitude: 0.3606, longitude: 36.782 },
  { code: "032", name: "Nakuru", headquarters: "Nakuru", latitude: -0.3031, longitude: 36.08 },
  { code: "033", name: "Narok", headquarters: "Narok", latitude: -1.087, longitude: 35.877 },
  { code: "034", name: "Kajiado", headquarters: "Kajiado", latitude: -1.8524, longitude: 36.7768 },
  { code: "035", name: "Kericho", headquarters: "Kericho", latitude: -0.3676, longitude: 35.283 },
  { code: "036", name: "Bomet", headquarters: "Bomet", latitude: -0.7813, longitude: 35.3416 },
  { code: "037", name: "Kakamega", headquarters: "Kakamega", latitude: 0.2827, longitude: 34.7519 },
  { code: "038", name: "Vihiga", headquarters: "Mbale", latitude: 0.0833, longitude: 34.7167 },
  { code: "039", name: "Bungoma", headquarters: "Bungoma", latitude: 0.5635, longitude: 34.5606 },
  { code: "040", name: "Busia", headquarters: "Busia", latitude: 0.4608, longitude: 34.1115 },
  { code: "041", name: "Siaya", headquarters: "Siaya", latitude: 0.0615, longitude: 34.2881 },
  { code: "042", name: "Kisumu", headquarters: "Kisumu", latitude: -0.1022, longitude: 34.7617 },
  { code: "043", name: "Homa Bay", headquarters: "Homa Bay", latitude: -0.5273, longitude: 34.4571 },
  { code: "044", name: "Migori", headquarters: "Migori", latitude: -1.0634, longitude: 34.4731 },
  { code: "045", name: "Kisii", headquarters: "Kisii", latitude: -0.6817, longitude: 34.7667 },
  { code: "046", name: "Nyamira", headquarters: "Nyamira", latitude: -0.5633, longitude: 34.9358 },
  { code: "047", name: "Nairobi", headquarters: "Nairobi", latitude: -1.2864, longitude: 36.8172 },
] as const;

export type KenyanCounty = (typeof KENYAN_COUNTIES)[number]["name"];
/** @deprecated The app retains this export while city-based catalogue data is gradually migrated. */
export type KenyanCity = KenyanCounty;
/** @deprecated Prefer KENYAN_COUNTIES for user-facing selection. */
export const KENYAN_CITIES = KENYAN_COUNTIES;

export type LocationResolution = { inKenya: boolean; city: KenyanCounty | null; county: KenyanCounty | null; distanceKm: number | null };
export type LocationFallback = "unsupported" | "denied" | "unavailable" | "outside_kenya" | "unmatched";

const KENYA_BOUNDS = { minLatitude: -4.9, maxLatitude: 5.5, minLongitude: 33.4, maxLongitude: 42.1 };
const MAX_COUNTY_MATCH_KM = 230;

export function isWithinKenya(latitude: number, longitude: number) {
  return latitude >= KENYA_BOUNDS.minLatitude && latitude <= KENYA_BOUNDS.maxLatitude && longitude >= KENYA_BOUNDS.minLongitude && longitude <= KENYA_BOUNDS.maxLongitude;
}

export function isKenyanCounty(value: string | null): value is KenyanCounty {
  return Boolean(value && KENYAN_COUNTIES.some((county) => county.name === value));
}

export const isKenyanCity = isKenyanCounty;

export function locationFallbackMessage(status: LocationFallback) {
  const messages: Record<LocationFallback, string> = {
    unsupported: "Location is not available in this browser. Choose your county instead.",
    denied: "Location permission is optional. Choose your county instead.",
    unavailable: "We could not confirm your location. Choose your county instead.",
    outside_kenya: "You appear to be outside Kenya. Choose a county to explore Kenyan options.",
    unmatched: "You are in Kenya, but we could not match your county yet. Choose your county instead.",
  };
  return messages[status];
}

export function kilometresBetween(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = radians(latitudeB - latitudeA);
  const deltaLongitude = radians(longitudeB - longitudeA);
  const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolveKenyanLocation(latitude: number, longitude: number): LocationResolution {
  if (!isWithinKenya(latitude, longitude)) return { inKenya: false, city: null, county: null, distanceKm: null };
  const nearest = KENYAN_COUNTIES.map((county) => ({ county, distanceKm: kilometresBetween(latitude, longitude, county.latitude, county.longitude) })).sort((a, b) => a.distanceKm - b.distanceKm)[0];
  if (!nearest || nearest.distanceKm > MAX_COUNTY_MATCH_KM) return { inKenya: true, city: null, county: null, distanceKm: nearest?.distanceKm ?? null };
  return { inKenya: true, city: nearest.county.name, county: nearest.county.name, distanceKm: Math.round(nearest.distanceKm) };
}
