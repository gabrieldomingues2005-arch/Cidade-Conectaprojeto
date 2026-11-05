import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const source=readFileSync(new URL('../supabase/functions/admin-occurrences/index.ts',import.meta.url),'utf8');

test('edge keeps the internal role allowlist narrow',()=>{
  assert.match(source,/const ALLOWED_ROLES = new Set\(\["triage", "admin"\]\)/);
  assert.doesNotMatch(source,/ALLOWED_ROLES[^\n]*agency/);
  assert.doesNotMatch(source,/ALLOWED_ROLES[^\n]*citizen/);
});

test('edge distinguishes temporary Auth failures from invalid sessions',()=>{
  assert.match(source,/status === 408/);
  assert.match(source,/status === 425/);
  assert.match(source,/status === 429/);
  assert.match(source,/status >= 500/);
  assert.match(source,/auth_temporarily_unavailable/);
  assert.match(source,/invalid_session/);
});

test('edge enforces payload limit even without Content-Length',()=>{
  assert.match(source,/MAX_BODY_BYTES = 16_384/);
  assert.match(source,/new TextEncoder\(\)\.encode\(rawBody\)\.byteLength > MAX_BODY_BYTES/);
});

test('edge rejects non-object JSON bodies',()=>{
  assert.match(source,/!parsedBody \|\| typeof parsedBody !== "object" \|\| Array\.isArray\(parsedBody\)/);
  assert.match(source,/invalid_json_object/);
});

test('edge limits writes to audited media moderation and excludes private citizen data',()=>{
  assert.doesNotMatch(source,/\.from\("occurrence_contacts"\)/);
  assert.doesNotMatch(source,/\.from\("occurrence_private_location"\)/);
  assert.match(source,/const MEDIA_WRITE_ROLES = new Set\(\["admin"\]\)/);
  assert.match(source,/action === "publish_media"/);
  assert.match(source,/action === "unpublish_media"/);
  assert.match(source,/occurrence\.public_visible !== true \|\| occurrence\.moderation_status !== "approved"/);
  assert.match(source,/\.from\("occurrence_public_media"\)\.upsert/);
  assert.match(source,/\.from\("audit_log"\)\.insert/);
  assert.match(source,/readOnly: true/);
  assert.doesNotMatch(source,/\.from\("occurrences"\)\.update/);
  assert.doesNotMatch(source,/\.from\("occurrence_history"\)\.insert/);
});


test('public media publication copies from private bucket to dedicated public bucket',()=>{
  assert.match(source,/PRIVATE_MEDIA_BUCKET = "occurrence-attachments"/);
  assert.match(source,/PUBLIC_MEDIA_BUCKET = "occurrence-public-media"/);
  assert.match(source,/\.from\(PRIVATE_MEDIA_BUCKET\)\.download/);
  assert.match(source,/\.from\(PUBLIC_MEDIA_BUCKET\)\.upload/);
  assert.match(source,/createSignedUrl\(String\(item\.storage_key\), 300\)/);
});

test('list projection stays minimal',()=>{
  assert.match(source,/protocol,title,neighborhood_label,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,categories\(slug,name\)/);
  assert.doesNotMatch(source,/select\(".*occurrence_contacts/);
});
