import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FIXED_ORIGINS = new Set([
  "https://gabrieldomingues2005-arch.github.io",
  "https://cidconecta-nztptuci.manus.space",
]);

function isAllowedOrigin(origin: string): boolean {
  if (FIXED_ORIGINS.has(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function cors(origin: string): Record<string, string> {
  const allowed = isAllowedOrigin(origin) ? origin : "https://gabrieldomingues2005-arch.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(origin: string, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function hmacFingerprint(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    if (origin && !isAllowedOrigin(origin)) return json(origin, 403, { error: "origin_not_allowed" });
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (req.method !== "POST") return json(origin, 405, { error: "method_not_allowed" });
  if (origin && !isAllowedOrigin(origin)) return json(origin, 403, { error: "origin_not_allowed" });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json(origin, 503, { error: "backend_not_configured" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(origin, 400, { error: "invalid_json" });
  }

  const protocol = typeof body.protocol === "string" ? body.protocol.trim().toUpperCase().slice(0, 32) : "";
  const trackingKey = typeof body.trackingKey === "string" ? body.trackingKey.trim().slice(0, 128) : null;
  if (!/^CC-\d{4}-\d{5,}$/.test(protocol)) return json(origin, 400, { error: "invalid_protocol" });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 240);
  const fingerprint = await hmacFingerprint(`${forwarded}|${userAgent}`);

  const { data: quotaData, error: quotaError } = await admin.rpc("consume_tracking_quota", {
    p_fingerprint_hash: fingerprint,
  });
  if (quotaError) return json(origin, 503, { error: "rate_limit_unavailable" });
  const quota = (quotaData ?? {}) as Record<string, unknown>;
  if (quota.allowed !== true) {
    return json(origin, 429, {
      error: "rate_limited",
      retryAfterSeconds: Number(quota.retry_after_seconds || 10),
    });
  }

  const { data, error } = await admin.rpc("track_occurrence", {
    p_protocol: protocol,
    p_tracking_key: trackingKey || null,
  });
  if (error) return json(origin, 500, { error: "tracking_failed" });
  const occurrence = Array.isArray(data) && data.length ? data[0] : null;
  return json(origin, 200, { occurrence });
});