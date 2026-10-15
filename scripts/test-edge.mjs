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

test('edge remains read-only and excludes direct private tables',()=>{
  assert.doesNotMatch(source,/\.from\("occurrence_contacts"\)/);
  assert.doesNotMatch(source,/\.from\("occurrence_private_locations"\)/);
  assert.doesNotMatch(source,/\.insert\(/);
  assert.doesNotMatch(source,/\.update\(/);
  assert.doesNotMatch(source,/\.delete\(/);
  assert.match(source,/readOnly: true/);
});

test('list projection stays minimal',()=>{
  assert.match(source,/protocol,title,neighborhood_label,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,categories\(slug,name\)/);
  assert.doesNotMatch(source,/select\(".*occurrence_contacts/);
});
