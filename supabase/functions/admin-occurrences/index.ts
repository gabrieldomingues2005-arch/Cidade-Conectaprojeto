import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FIXED_ORIGINS = new Set([
  "https://gabrieldomingues2005-arch.github.io","https://cidade-conecta-piracicaba.web.app","https://cidade-conecta-piracicaba.firebaseapp.com",
  "https://cidconecta-nztptuci.manus.space",
]);
const ALLOWED_ROLES = new Set(["triage", "admin"]);
const MEDIA_WRITE_ROLES = new Set(["admin"]);
const OPERATION_ROLES = new Set(["triage", "admin"]);
const RESTRICTED_OPERATION_ROLES = new Set(["admin"]);
const OCCURRENCE_STATUSES = new Set(["Recebida", "Em análise", "Encaminhada", "Em andamento", "Resolvida"]);
const MAX_BODY_BYTES = 16_384;
const PRIVATE_MEDIA_BUCKET = "occurrence-attachments";
const PUBLIC_MEDIA_BUCKET = "occurrence-public-media";
const MUNICIPAL_ADAPTER_URL = (Deno.env.get("MUNICIPAL_ADAPTER_URL") ?? "").trim();
const MUNICIPAL_ADAPTER_TOKEN = (Deno.env.get("MUNICIPAL_ADAPTER_TOKEN") ?? "").trim();
const MUNICIPAL_ADAPTER_HOSTS = (Deno.env.get("MUNICIPAL_ADAPTER_HOSTS") ?? "").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
function validProtocol(value: string): boolean {
  return /^CC-\d{4}-\d{5}$/.test(value);
}
function municipalAdapterConfigured(): boolean {
  if (!MUNICIPAL_ADAPTER_URL || !MUNICIPAL_ADAPTER_TOKEN || !MUNICIPAL_ADAPTER_HOSTS.length) return false;
  try {
    const url = new URL(MUNICIPAL_ADAPTER_URL);
    return url.protocol === "https:" && MUNICIPAL_ADAPTER_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
function validUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function extensionFor(mime: string): string {
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "";
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

  const token = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
  if (!token) return json(origin, 401, { error: "authentication_required" });
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return json(origin, 415, { error: "unsupported_media_type" });
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json(origin, 413, { error: "request_too_large" });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData.user;
  if (userError) {
    const status = Number((userError as { status?: number }).status ?? 0);
    if (status === 0 || status === 408 || status === 425 || status === 429 || status >= 500) return json(origin, 503, { error: "auth_temporarily_unavailable" });
    return json(origin, 401, { error: "invalid_session" });
  }
  if (!user?.id) return json(origin, 401, { error: "invalid_session" });

  const { data: profile, error: profileError } = await admin.from("users_profile").select("id,name,role,auth_user_id").eq("auth_user_id", user.id).maybeSingle();
  if (profileError) return json(origin, 503, { error: "profile_lookup_failed" });
  if (!profile || !ALLOWED_ROLES.has(String(profile.role))) {
    return json(origin, 403, { error: "internal_access_denied", role: profile?.role ?? null, profile: profile ? { id: profile.id, name: profile.name, role: profile.role } : null });
  }

  let rawBody = "";
  try { rawBody = await req.text(); } catch { return json(origin, 400, { error: "invalid_body" }); }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return json(origin, 413, { error: "request_too_large" });
  let parsedBody: unknown;
  try { parsedBody = JSON.parse(rawBody); } catch { return json(origin, 400, { error: "invalid_json" }); }
  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) return json(origin, 400, { error: "invalid_json_object" });
  const body = parsedBody as Record<string, unknown>;
  const action = clean(body.action, 30) || "session";

  if (action === "session") return json(origin, 200, { authenticated: true, profile: { id: profile.id, name: profile.name, role: profile.role } });

  const { data: municipality, error: municipalityError } = await admin.from("municipalities").select("id").eq("ibge_code", "3538709").maybeSingle();
  if (municipalityError || !municipality?.id) return json(origin, 503, { error: "municipality_not_configured" });

  if (action === "list") {
    const search = clean(body.search, 100).toLowerCase(), category = clean(body.category, 40), status = clean(body.status, 40);
    const { data, error } = await admin.from("occurrences")
      .select("protocol,title,neighborhood_label,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,categories(slug,name)")
      .eq("municipality_id", municipality.id).order("created_at", { ascending: false }).limit(400);
    if (error) return json(origin, 500, { error: "occurrence_list_failed" });
    const rows = (data ?? []).filter((row: Record<string, unknown>) => {
      const cat = row.categories && typeof row.categories === "object" ? String((row.categories as Record<string, unknown>).slug ?? "") : "";
      if (category && cat !== category) return false;
      if (status && String(row.status ?? "") !== status) return false;
      if (search && ![row.protocol,row.title,row.neighborhood_label,row.responsible_agency].map(v=>String(v??"").toLowerCase()).join(" ").includes(search)) return false;
      return true;
    });
    return json(origin, 200, { occurrences: rows, total: rows.length, role: profile.role, readOnly: false, operations: OPERATION_ROLES.has(String(profile.role)), mediaModeration: MEDIA_WRITE_ROLES.has(String(profile.role)), municipalAdapterConfigured: municipalAdapterConfigured() });
  }

  const protocol = clean(body.protocol, 32).toUpperCase();
  if (!validProtocol(protocol)) return json(origin, 400, { error: "invalid_protocol" });
  const { data: occurrence, error: occurrenceError } = await admin.from("occurrences")
    .select("id,protocol,title,description,neighborhood_label,public_location,public_latitude,public_longitude,status,responsible_agency,public_visible,moderation_status,territory_resolution_status,created_at,updated_at,resolved_at,categories(slug,name)")
    .eq("protocol", protocol).eq("municipality_id", municipality.id).maybeSingle();
  if (occurrenceError) return json(origin, 500, { error: "occurrence_detail_failed" });
  if (!occurrence) return json(origin, 404, { error: "occurrence_not_found" });

  if (action === "detail") {
    const [{ data: history, error: historyError }, { data: attachments, error: attachmentError }, { data: publicMedia, error: publicMediaError }, { data: resolutionMedia, error: resolutionMediaError }, { data: integrationRows, error: integrationError }] = await Promise.all([
      admin.from("occurrence_history").select("status,note,public_note,created_at").eq("occurrence_id", occurrence.id).order("created_at", { ascending: true }),
      admin.from("occurrence_attachments").select("id,mime_type,file_size_bytes,public_visible,moderation_status,created_at,storage_key").eq("occurrence_id", occurrence.id).order("created_at", { ascending: true }),
      admin.from("occurrence_public_media").select("protocol,storage_key,mime_type,alt_text,published_at,updated_at").eq("protocol", protocol).maybeSingle(),
      admin.from("occurrence_resolution_media").select("protocol,storage_key,mime_type,alt_text,published_at,updated_at").eq("protocol", protocol).maybeSingle(),
      admin.rpc("service_get_municipal_outbox",{p_occurrence_id:occurrence.id}),
    ]);
    if (historyError) return json(origin, 500, { error: "occurrence_history_failed" });
    if (attachmentError || publicMediaError || resolutionMediaError || integrationError) return json(origin, 500, { error: "occurrence_media_lookup_failed" });
    const safeAttachments = [];
    for (const item of attachments ?? []) {
      const { data: signed } = await admin.storage.from(PRIVATE_MEDIA_BUCKET).createSignedUrl(String(item.storage_key), 300);
      safeAttachments.push({
        id: item.id, mime_type: item.mime_type, file_size_bytes: item.file_size_bytes,
        public_visible: item.public_visible, moderation_status: item.moderation_status,
        created_at: item.created_at, preview_url: signed?.signedUrl ?? null,
      });
    }
    const publicUrl = publicMedia?.storage_key ? admin.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(String(publicMedia.storage_key)).data.publicUrl : null;
    const resolutionUrl = resolutionMedia?.storage_key ? admin.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(String(resolutionMedia.storage_key)).data.publicUrl : null;
    return json(origin, 200, {
      occurrence: {
        ...occurrence,
        history: history ?? [],
        attachments: safeAttachments,
        public_media: publicMedia ? { ...publicMedia, public_url: publicUrl } : null,
        resolution_media: resolutionMedia ? { ...resolutionMedia, public_url: resolutionUrl } : null,
        municipal_integration: integrationRows ?? [],
      },
      role: profile.role,
      readOnly: false,
      operations: OPERATION_ROLES.has(String(profile.role)),
      mediaModeration: MEDIA_WRITE_ROLES.has(String(profile.role)),
      municipalAdapterConfigured: municipalAdapterConfigured(),
    });
  }

  if (action === "operate") {
    if (!OPERATION_ROLES.has(String(profile.role))) return json(origin, 403, { error: "operation_denied" });
    const operation = clean(body.operation, 40);
    const note = clean(body.note, 500);
    const agency = clean(body.agency, 150);
    const requestedStatus = clean(body.status, 40);
    const publicNote = body.publicNote === true;
    const previous = {
      status: String(occurrence.status ?? ""),
      responsible_agency: occurrence.responsible_agency ?? null,
      moderation_status: String(occurrence.moderation_status ?? ""),
      public_visible: occurrence.public_visible === true,
      resolved_at: occurrence.resolved_at ?? null,
    };
    const changes: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let auditAction = "";
    let historyStatus = previous.status;
    let historyNote = note;
    let historyPublic = publicNote;

    if (operation === "approve") {
      changes.moderation_status = "approved";
      changes.public_visible = true;
      auditAction = "occurrence_approved";
      historyNote = note || "Ocorrência aprovada para publicação.";
      historyPublic = false;
    } else if (operation === "reject") {
      if (!RESTRICTED_OPERATION_ROLES.has(String(profile.role))) return json(origin, 403, { error: "restricted_operation_denied" });
      if (note.length < 5) return json(origin, 400, { error: "rejection_reason_required" });
      changes.moderation_status = "rejected";
      changes.public_visible = false;
      auditAction = "occurrence_rejected";
      historyNote = note;
      historyPublic = false;
    } else if (operation === "set_status") {
      if (!OCCURRENCE_STATUSES.has(requestedStatus)) return json(origin, 400, { error: "invalid_status" });
      changes.status = requestedStatus;
      if (agency) changes.responsible_agency = agency;
      changes.resolved_at = requestedStatus === "Resolvida" ? new Date().toISOString() : null;
      auditAction = "occurrence_status_changed";
      historyStatus = requestedStatus;
      historyNote = note || `Status atualizado para ${requestedStatus}.`;
    } else if (operation === "assign_agency") {
      if (agency.length < 2) return json(origin, 400, { error: "agency_required" });
      changes.responsible_agency = agency;
      auditAction = "occurrence_agency_assigned";
      historyNote = note || `Encaminhada para ${agency}.`;
    } else if (operation === "reopen") {
      if (previous.status !== "Resolvida") return json(origin, 409, { error: "occurrence_not_resolved" });
      changes.status = "Em análise";
      changes.resolved_at = null;
      auditAction = "occurrence_reopened";
      historyStatus = "Em análise";
      historyNote = note || "Ocorrência reaberta para nova análise.";
      historyPublic = publicNote;
    } else {
      return json(origin, 400, { error: "unsupported_operation" });
    }

    const { error: updateError } = await admin.from("occurrences").update(changes).eq("id", occurrence.id);
    if (updateError) return json(origin, 500, { error: "occurrence_update_failed" });

    const { error: historyWriteError } = await admin.from("occurrence_history").insert({
      occurrence_id: occurrence.id,
      status: historyStatus,
      note: historyNote || null,
      public_note: historyPublic,
      changed_by: profile.id,
    });
    if (historyWriteError) {
      await admin.from("occurrences").update({ ...previous, updated_at: occurrence.updated_at }).eq("id", occurrence.id);
      return json(origin, 500, { error: "occurrence_history_write_failed" });
    }

    await admin.from("audit_log").insert({
      actor_id: profile.id,
      action: auditAction,
      entity_type: "occurrence",
      entity_id: occurrence.id,
      metadata: { protocol, operation, before: previous, requested_status: requestedStatus || null, agency: agency || null, public_note: historyPublic },
    });
    return json(origin, 200, { updated: true, protocol, operation });
  }

  if (action === "prepare_dispatch") {
    if (!RESTRICTED_OPERATION_ROLES.has(String(profile.role))) return json(origin, 403, { error: "restricted_operation_denied" });
    const dispatchAction = clean(body.dispatchAction, 60) || "occurrence_update";
    const safePayload = {
      protocol,
      status: occurrence.status,
      neighborhood: occurrence.neighborhood_label,
      responsible_agency: occurrence.responsible_agency,
      public_location: occurrence.public_location,
    };
    const configured = municipalAdapterConfigured();
    const adapterKey = configured ? "official-http" : "unconfigured";
    const { data: queuedRows, error: queueError } = await admin.rpc("service_prepare_municipal_outbox_v2",{
      p_occurrence_id: occurrence.id,
      p_action: dispatchAction,
      p_payload: safePayload,
      p_created_by: profile.id,
      p_adapter_key: adapterKey,
    });
    const row = Array.isArray(queuedRows) ? queuedRows[0] : queuedRows;
    if (queueError || !row?.id) return json(origin, 500, { error: "municipal_outbox_failed" });
    await admin.from("audit_log").insert({
      actor_id: profile.id,
      action: "municipal_dispatch_prepared",
      entity_type: "occurrence",
      entity_id: occurrence.id,
      metadata: { protocol, outbox_id: row.id, adapter_key: adapterKey },
    });
    return json(origin, 200, {
      configured,
      queued: configured,
      reason: configured ? "dispatch_prepared_requires_explicit_send" : "official_adapter_not_configured",
      outbox: row,
    });
  }

  if (action === "publish_media") {
    if (!MEDIA_WRITE_ROLES.has(String(profile.role))) return json(origin, 403, { error: "media_moderation_denied" });
    if (occurrence.public_visible !== true || occurrence.moderation_status !== "approved") return json(origin, 409, { error: "occurrence_not_publicly_approved" });
    const attachmentId = clean(body.attachmentId, 64), altText = clean(body.altText, 180);
    if (!validUuid(attachmentId)) return json(origin, 400, { error: "invalid_attachment_id" });
    if (altText.length < 5) return json(origin, 400, { error: "alt_text_required" });
    const { data: attachment, error: attachmentError } = await admin.from("occurrence_attachments")
      .select("id,occurrence_id,storage_key,mime_type,file_size_bytes").eq("id", attachmentId).eq("occurrence_id", occurrence.id).maybeSingle();
    if (attachmentError || !attachment) return json(origin, 404, { error: "attachment_not_found" });
    const mime = String(attachment.mime_type ?? "");
    const ext = extensionFor(mime);
    if (!IMAGE_MIMES.has(mime) || !ext) return json(origin, 400, { error: "unsupported_attachment_type" });
    const { data: blob, error: downloadError } = await admin.storage.from(PRIVATE_MEDIA_BUCKET).download(String(attachment.storage_key));
    if (downloadError || !blob) return json(origin, 500, { error: "private_media_download_failed" });
    const publicKey = `${protocol}/${attachmentId}.${ext}`;
    const { error: uploadError } = await admin.storage.from(PUBLIC_MEDIA_BUCKET).upload(publicKey, blob, { contentType: mime, upsert: true, cacheControl: "3600" });
    if (uploadError) return json(origin, 500, { error: "public_media_upload_failed" });
    const { data: previous } = await admin.from("occurrence_public_media").select("storage_key").eq("protocol", protocol).maybeSingle();
    await admin.from("occurrence_attachments").update({ public_visible: false }).eq("occurrence_id", occurrence.id).neq("id", attachmentId);
    const { error: attachmentUpdateError } = await admin.from("occurrence_attachments").update({ public_visible: true, moderation_status: "approved" }).eq("id", attachmentId).eq("occurrence_id", occurrence.id);
    if (attachmentUpdateError) { await admin.storage.from(PUBLIC_MEDIA_BUCKET).remove([publicKey]); return json(origin, 500, { error: "attachment_moderation_update_failed" }); }
    const now = new Date().toISOString();
    const { error: mediaError } = await admin.from("occurrence_public_media").upsert({ protocol, storage_key: publicKey, mime_type: mime, alt_text: altText, published_at: now, updated_at: now }, { onConflict: "protocol" });
    if (mediaError) {
      await admin.from("occurrence_attachments").update({ public_visible: false }).eq("id", attachmentId).eq("occurrence_id", occurrence.id);
      await admin.storage.from(PUBLIC_MEDIA_BUCKET).remove([publicKey]);
      return json(origin, 500, { error: "public_media_metadata_failed" });
    }
    if (previous?.storage_key && previous.storage_key !== publicKey) await admin.storage.from(PUBLIC_MEDIA_BUCKET).remove([String(previous.storage_key)]);
    await admin.from("audit_log").insert({ actor_id: profile.id, action: "media_published", entity_type: "occurrence", entity_id: occurrence.id, metadata: { protocol, attachment_id: attachmentId, public_storage_key: publicKey } });
    const publicUrl = admin.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(publicKey).data.publicUrl;
    return json(origin, 200, { published: true, protocol, publicUrl });
  }

  if (action === "unpublish_media") {
    if (!MEDIA_WRITE_ROLES.has(String(profile.role))) return json(origin, 403, { error: "media_moderation_denied" });
    const { data: media, error: mediaError } = await admin.from("occurrence_public_media").select("storage_key").eq("protocol", protocol).maybeSingle();
    if (mediaError) return json(origin, 500, { error: "public_media_lookup_failed" });
    if (!media?.storage_key) return json(origin, 200, { published: false, protocol });
    const storageKey = String(media.storage_key);
    const attachmentId = storageKey.split("/").pop()?.replace(/\.(jpg|png|webp)$/i, "") ?? "";
    const { error: removeError } = await admin.storage.from(PUBLIC_MEDIA_BUCKET).remove([storageKey]);
    if (removeError) return json(origin, 500, { error: "public_media_remove_failed" });
    const { error: deleteError } = await admin.from("occurrence_public_media").delete().eq("protocol", protocol);
    if (deleteError) return json(origin, 500, { error: "public_media_metadata_remove_failed" });
    if (validUuid(attachmentId)) await admin.from("occurrence_attachments").update({ public_visible: false }).eq("id", attachmentId).eq("occurrence_id", occurrence.id);
    await admin.from("audit_log").insert({ actor_id: profile.id, action: "media_unpublished", entity_type: "occurrence", entity_id: occurrence.id, metadata: { protocol, public_storage_key: storageKey } });
    return json(origin, 200, { published: false, protocol });
  }

  return json(origin, 400, { error: "unsupported_action" });
});
