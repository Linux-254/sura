import express, { type Express, type Request, type Response } from "express";
import { z } from "zod";
import { getAdminClient, getRequestUser, hasSupabaseServerConfig, SUPABASE_URL } from "./supabase";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  handle: z.string().trim().min(2).max(40).regex(/^[a-z0-9_]+$/i),
  county: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional().default(""),
  role: z.enum(["member", "creator", "business_owner"]),
  aesthetics: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  business: z.object({
    legalName: z.string().trim().min(2).max(120),
    displayName: z.string().trim().min(2).max(120),
    businessType: z.string().trim().min(2).max(80),
    description: z.string().trim().max(700).optional().default(""),
    websiteUrl: z.string().trim().url().max(400).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().default(""),
    contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
    aesthetics: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  }).optional(),
});

const orderSchema = z.object({
  businessId: z.string().uuid(),
  catalogItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  deliveryCounty: z.string().trim().min(2).max(80),
  deliveryKes: z.number().int().min(0).max(100000).default(0),
  phone: z.string().trim().min(7).max(40),
});

const webhookSchema = z.object({
  provider: z.string().trim().min(2).max(50),
  providerReference: z.string().trim().min(2).max(200),
  orderId: z.string().uuid(),
  status: z.enum(["paid", "failed", "refunded", "partially_refunded"]),
  amountKes: z.number().int().min(0),
  payload: z.record(z.string(), z.unknown()).default({}),
});

function jsonError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

async function withUser(req: Request, res: Response) {
  if (!hasSupabaseServerConfig) {
    jsonError(res, 503, "Supabase server environment is not configured on this deployment.");
    return null;
  }
  const user = await getRequestUser(req);
  if (!user) {
    jsonError(res, 401, "Sign in to continue.");
    return null;
  }
  return user;
}

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || `studio-${crypto.randomUUID().slice(0, 8)}`;
}

async function getProfileId(client: NonNullable<ReturnType<typeof getAdminClient>>, userId: string) {
  const { data } = await client.from("profiles").select("id").eq("id", userId).maybeSingle();
  return data?.id ?? null;
}

export function createSuraApi(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/v1/health", (_req, res) => res.json({ ok: true, service: "sura-api", supabase: Boolean(SUPABASE_URL) }));

  app.get("/api/v1/me", async (req, res) => {
    const user = await withUser(req, res);
    if (!user) return;
    const client = getAdminClient();
    if (!client) return jsonError(res, 503, "Supabase server environment is incomplete.");
    const [profile, roles, businesses, orders] = await Promise.all([
      client.from("profiles").select("id,display_name,handle,avatar_path,county,city,bio,is_public,created_at,updated_at").eq("id", user.id).maybeSingle(),
      client.from("profile_roles").select("role,created_at").eq("profile_id", user.id).order("created_at", { ascending: true }),
      client.from("businesses").select("id,slug,display_name,business_type,status,county,city,contact_email,phone,website_url,created_at,updated_at").eq("owner_profile_id", user.id).order("created_at", { ascending: false }).limit(10),
      client.from("orders").select("id,business_id,status,total_kes,created_at,updated_at,provider_reference").eq("buyer_profile_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    return res.json({ user: { id: user.id, email: user.email ?? null }, profile: profile.data, roles: roles.data ?? [], businesses: businesses.data ?? [], orders: orders.data ?? [] });
  });

  app.post("/api/v1/onboarding", async (req, res) => {
    const user = await withUser(req, res);
    if (!user) return;
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) return jsonError(res, 400, parsed.error.issues[0]?.message ?? "Check the onboarding details.");
    const client = getAdminClient();
    if (!client) return jsonError(res, 503, "Supabase server environment is incomplete.");
    const input = parsed.data;
    const { error: profileError } = await client.from("profiles").upsert({
      id: user.id,
      display_name: input.displayName,
      handle: input.handle.toLowerCase(),
      county: input.county,
      city: input.city,
      bio: input.bio,
      is_public: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (profileError) return jsonError(res, 400, profileError.message);

    const roleRows = Array.from(new Set(["member", input.role])).map((role) => ({ profile_id: user.id, role, granted_by: user.id }));
    const { error: roleError } = await client.from("profile_roles").upsert(roleRows, { onConflict: "profile_id,role" });
    if (roleError) return jsonError(res, 400, roleError.message);

    let business = null;
    if (input.role === "business_owner" && input.business) {
      const businessInput = input.business;
      const slug = `${safeSlug(businessInput.displayName)}-${user.id.slice(0, 6)}`;
      const { data, error } = await client.from("businesses").insert({
        owner_profile_id: user.id,
        slug,
        legal_name: businessInput.legalName,
        display_name: businessInput.displayName,
        business_type: businessInput.businessType,
        description: businessInput.description,
        status: "pending_review",
        county: input.county,
        city: input.city,
        contact_email: businessInput.contactEmail || user.email || null,
        phone: businessInput.phone,
        website_url: businessInput.websiteUrl || null,
      }).select("id,slug,display_name,business_type,status,county,city").single();
      if (error) return jsonError(res, 400, error.message);
      business = data;
      await client.from("business_members").insert({ business_id: data.id, profile_id: user.id, role: "owner" });
      if (businessInput.aesthetics.length) {
        const { data: nodes } = await client.from("aesthetic_nodes").select("id,slug").in("slug", businessInput.aesthetics).limit(20);
        if (nodes?.length) await client.from("business_aesthetics").insert(nodes.map((node) => ({ business_id: data.id, aesthetic_node_id: node.id, confidence: "declared" })));
      }
    }
    return res.status(201).json({ ok: true, profile: { id: user.id, display_name: input.displayName, handle: input.handle }, business });
  });

  app.post("/api/v1/orders", async (req, res) => {
    const user = await withUser(req, res);
    if (!user) return;
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) return jsonError(res, 400, parsed.error.issues[0]?.message ?? "Check the order details.");
    const client = getAdminClient();
    if (!client) return jsonError(res, 503, "Supabase server environment is incomplete.");
    const input = parsed.data;
    const [{ data: item }, { data: business }] = await Promise.all([
      client.from("catalog_items").select("id,business_id,name,price_min_kes,price_max_kes,is_published").eq("id", input.catalogItemId).eq("business_id", input.businessId).maybeSingle(),
      client.from("businesses").select("id,status,commission_rate,display_name").eq("id", input.businessId).maybeSingle(),
    ]);
    if (!item || !business || business.status !== "verified" || !item.is_published) return jsonError(res, 404, "That offer is not available for checkout yet.");
    const unitPrice = item.price_min_kes ?? item.price_max_kes ?? 0;
    const subtotal = unitPrice * input.quantity;
    const commissionRate = Number(business.commission_rate ?? 20);
    const commission = Math.round(subtotal * commissionRate / 100);
    const total = subtotal + input.deliveryKes;
    const idempotencyKey = `sura-${user.id}-${item.id}-${Date.now()}`;
    const { data: order, error: orderError } = await client.from("orders").insert({
      buyer_profile_id: user.id,
      business_id: business.id,
      status: "awaiting_customer",
      subtotal_kes: subtotal,
      delivery_kes: input.deliveryKes,
      platform_commission_kes: commission,
      seller_settlement_kes: subtotal - commission,
      total_kes: total,
      commission_rate: commissionRate,
      idempotency_key: idempotencyKey,
    }).select("id,business_id,status,subtotal_kes,delivery_kes,total_kes,created_at").single();
    if (orderError || !order) return jsonError(res, 400, orderError?.message ?? "Could not create the order.");
    const [{ error: lineError }, { error: paymentError }] = await Promise.all([
      client.from("order_lines").insert({ order_id: order.id, catalog_item_id: item.id, item_name_snapshot: item.name, quantity: input.quantity, unit_price_kes: unitPrice, line_total_kes: subtotal }),
      client.from("payment_intents").insert({ order_id: order.id, provider: "mpesa_daraja", status: "awaiting_customer", amount_kes: total, idempotency_key: `${idempotencyKey}-payment` }),
    ]);
    if (lineError || paymentError) return jsonError(res, 500, lineError?.message ?? paymentError?.message ?? "Could not prepare payment.");
    return res.status(201).json({ ok: true, order, payment: { status: "awaiting_customer", provider: "mpesa_daraja", amountKes: total, next: "provider_callback" }, receipt: null });
  });

  app.post("/api/v1/payments/webhook", async (req, res) => {
    const secret = process.env.SURA_PAYMENT_WEBHOOK_SECRET;
    if (!secret || req.headers["x-sura-webhook-secret"] !== secret) return jsonError(res, 401, "Invalid payment webhook.");
    const parsed = webhookSchema.safeParse(req.body);
    if (!parsed.success) return jsonError(res, 400, "Invalid payment callback payload.");
    const client = getAdminClient();
    if (!client) return jsonError(res, 503, "Supabase server environment is incomplete.");
    const input = parsed.data;
    const { data: payment } = await client.from("payment_intents").select("id,order_id,amount_kes").eq("order_id", input.orderId).maybeSingle();
    if (!payment || payment.amount_kes !== input.amountKes) return jsonError(res, 400, "Payment amount does not match the order.");
    await client.from("payment_intents").update({ status: input.status, provider: input.provider, provider_reference: input.providerReference, provider_payload: input.payload, updated_at: new Date().toISOString() }).eq("id", payment.id);
    const orderStatus = input.status === "paid" ? "paid" : input.status;
    await client.from("orders").update({ status: orderStatus, provider_reference: input.providerReference, updated_at: new Date().toISOString() }).eq("id", input.orderId);
    if (input.status === "paid") {
      const receiptNumber = `SURA-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}-${input.orderId.slice(0, 6).toUpperCase()}`;
      await client.from("receipts").upsert({ order_id: input.orderId, receipt_number: receiptNumber, payload: { provider: input.provider, providerReference: input.providerReference, amountKes: input.amountKes, issuedAt: new Date().toISOString() } }, { onConflict: "order_id" });
    }
    return res.json({ ok: true, orderId: input.orderId, status: input.status });
  });

  app.get("/api/v1/orders/:orderId/receipt", async (req, res) => {
    const user = await withUser(req, res);
    if (!user) return;
    const client = getAdminClient();
    if (!client) return jsonError(res, 503, "Supabase server environment is incomplete.");
    const { data: order } = await client.from("orders").select("id,status,total_kes,buyer_profile_id,business_id,created_at,provider_reference").eq("id", req.params.orderId).eq("buyer_profile_id", user.id).maybeSingle();
    if (!order) return jsonError(res, 404, "Order not found.");
    const { data: receipt } = await client.from("receipts").select("id,receipt_number,issued_at,payload,storage_path").eq("order_id", order.id).maybeSingle();
    if (!receipt) return res.status(409).json({ error: "Receipt will be issued after the payment provider confirms settlement.", order });
    return res.json({ order, receipt });
  });

  return app;
}
