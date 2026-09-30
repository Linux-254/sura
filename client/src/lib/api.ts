import { supabase } from "./supabase";

export type TaxonomyNode = { id: string; slug: string; name: string; node_type: string; affordability: string | null; domain_id: string; parent_id: string | null; kenya_relevance: string | null; metadata: Record<string, unknown> | null };
export type TaxonomyDomain = { id: string; slug: string; name: string; description: string; sort_order: number };
export type Business = { id: string; slug: string; display_name: string; business_type: string; status: string; county: string | null; city: string | null; description?: string | null; contact_email?: string | null; phone?: string | null; website_url?: string | null; catalog?: CatalogItem[] };
export type CatalogItem = { id: string; business_id: string; item_type: string; name: string; description: string | null; affordability: string; price_min_kes: number | null; price_max_kes: number | null; currency: string; media: Array<{ url?: string }> | null };
export type MeBundle = { user: { id: string; email: string | null }; profile: { display_name: string; handle: string; county: string; city: string; bio: string | null } | null; roles: Array<{ role: string }>; businesses: Business[]; orders: Array<{ id: string; status: string; total_kes: number; created_at: string; provider_reference: string | null }> };

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "SURA could not complete that request.");
  return payload as T;
}

export async function loadPublicNetwork() {
  if (!supabase) return { domains: [] as TaxonomyDomain[], nodes: [] as TaxonomyNode[], businesses: [] as Business[] };
  const [domainsResponse, nodesResponse, businessesResponse] = await Promise.all([
    supabase.from("aesthetic_domains").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order").limit(20),
    supabase.from("aesthetic_nodes").select("id,slug,name,node_type,affordability,domain_id,parent_id,kenya_relevance,metadata").eq("is_active", true).order("name").limit(120),
    supabase.from("businesses").select("id,slug,display_name,business_type,status,county,city,description,contact_email,phone,website_url").eq("status", "verified").order("created_at", { ascending: false }).limit(18),
  ]);
  if (domainsResponse.error) throw domainsResponse.error;
  if (nodesResponse.error) throw nodesResponse.error;
  if (businessesResponse.error) throw businessesResponse.error;
  const businesses = (businessesResponse.data ?? []) as Business[];
  if (businesses.length) {
    const { data: catalog } = await supabase.from("catalog_items").select("id,business_id,item_type,name,description,affordability,price_min_kes,price_max_kes,currency,media").in("business_id", businesses.map((business) => business.id)).eq("is_published", true).limit(60);
    for (const business of businesses) business.catalog = (catalog ?? []).filter((item) => item.business_id === business.id) as CatalogItem[];
  }
  return { domains: (domainsResponse.data ?? []) as TaxonomyDomain[], nodes: (nodesResponse.data ?? []) as TaxonomyNode[], businesses };
}

export async function loadMe() { return apiRequest<MeBundle>("/api/v1/me"); }
