import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FIXED_ORIGINS = new Set([
  "https://gabrieldomingues2005-arch.github.io",
  "https://cidconecta-nztptuci.manus.space",
]);
const ALLOWED_ROLES = new Set(["triage", "admin"]);

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
      "Referrer-Policy": "no-referrer",
    },
  });
}

function clean(value: unknown, max = 120): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
  if (!token) return json(origin, 401, { error: "authentication_required" });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData.user;
  if (userError || !user?.id) return json(origin, 401, { error: "invalid_session" });

  const { data: profile, error: profileError } = await admin
    .from("users_profile")
    .select("id,name,email,role,auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) return json(origin, 503, { error: "profile_lookup_failed" });
  if (!profile || !ALLOWED_ROLES.has(String(profile.role))) {
    return json(origin, 403, {
      error: "internal_access_denied",
      role: profile?.role ?? null,
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json(origin, 400, { error: "invalid_json" });
  }

  const action = clean(body.action, 30) || "session";

  if (action === "session") {
    return json(origin, 200, {
      authenticated: true,
      profile: {
        id: profile.id,
        name: profile.name,
        role: profile.role,
      },
    });
  }

  if (action === "list") {
    const search = clean(body.search, 100).toLowerCase();
    const category = clean(body.category, 40);
    const status = clean(body.status, 40);

    const { data, error } = await admin
      .from("occurrences")
      .select("id,protocol,title,description,neighborhood_label,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,categories(slug,name)")
      .order("created_at", { ascending: false })
      .limit(400);

    if (error) return json(origin, 500, { error: "occurrence_list_failed" });

    const rows = (data ?? []).filter((row: Record<string, unknown>) => {
      const cat = row.categories && typeof row.categories === "object"
        ? String((row.categories as Record<string, unknown>).slug ?? "")
        : "";
      if (category && cat !== category) return false;
      if (status && String(row.status ?? "") !== status) return false;
      if (search) {
        const haystack = [
          row.protocol,
          row.title,
          row.neighborhood_label,
          row.responsible_agency,
        ].map((v) => String(v ?? "").toLowerCase()).join(" ");
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    return json(origin, 200, {
      occurrences: rows,
      total: rows.length,
      role: profile.role,
      readOnly: true,
    });
  }

  if (action === "detail") {
    const protocol = clean(body.protocol, 32).toUpperCase();
    if (!/^CC-\d{4}-\d{5,}$/.test(protocol)) return json(origin, 400, { error: "invalid_protocol" });

    const { data: occurrence, error: occurrenceError } = await admin
      .from("occurrences")
      .select("id,protocol,title,description,neighborhood_label,public_location,public_latitude,public_longitude,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,resolved_at,categories(slug,name)")
      .eq("protocol", protocol)
      .maybeSingle();

    if (occurrenceError) return json(origin, 500, { error: "occurrence_detail_failed" });
    if (!occurrence) return json(origin, 404, { error: "occurrence_not_found" });

    const { data: history, error: historyError } = await admin
      .from("occurrence_history")
      .select("status,note,public_note,created_at")
      .eq("occurrence_id", occurrence.id)
      .order("created_at", { ascending: true });

    if (historyError) return json(origin, 500, { error: "occurrence_history_failed" });

    return json(origin, 200, {
      occurrence: {
        ...occurrence,
        history: history ?? [],
      },
      role: profile.role,
      readOnly: true,
    });
  }

  return json(origin, 400, { error: "unsupported_action" });
});
