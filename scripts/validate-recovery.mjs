import {readFileSync,existsSync} from 'node:fs';

const required=[
  'supabase/recovery/001_core_schema_rls.sql',
  'supabase/recovery/002_piracicaba_seed.sql',
  'supabase/recovery/003_storage_bucket.sql',
  'supabase/recovery/004_private_hardening.sql',
  'supabase/migrations/20260917_secure_occurrence_submission_v1.sql',
  'supabase/migrations/20260917_reserve_demo_protocol_range.sql',
  'supabase/migrations/20260917_restrict_profile_self_role.sql',
  'supabase/migrations/20260917_secure_occurrence_tracking_edge.sql',
  'supabase/migrations/20260924_harden_occurrence_contacts_privileges.sql',
  'supabase/functions/submit-occurrence/index.ts',
  'supabase/functions/track-occurrence/index.ts',
  'supabase/functions/admin-occurrences/index.ts'
];
for(const path of required){
  if(!existsSync(path))throw new Error('Recovery: arquivo ausente: '+path);
}
const read=p=>readFileSync(p,'utf8');
const core=read(required[0]),seed=read(required[1]),storage=read(required[2]),hard=read(required[3]);
const all=[core,seed,storage,hard].join('\n');

if(/create\s+schema\s+(?:if\s+not\s+exists\s+)?(?:auth|storage|realtime)\b/i.test(all)){
  throw new Error('Recovery: proibido recriar schemas gerenciados auth/storage/realtime.');
}
if(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:auth|storage|realtime)\./i.test(all)){
  throw new Error('Recovery: proibido recriar tabelas internas gerenciadas.');
}
for(const snippet of [
  'create extension if not exists postgis with schema extensions',
  'create extension if not exists pgcrypto with schema extensions',
  'public_point extensions.geography(Point,4326)',
  'exact_point extensions.geography(Point,4326)',
  'alter table public.occurrences enable row level security',
  'alter table public.users_profile enable row level security',
  'create policy occurrences_public_read',
  'create policy occurrence_private_owner_staff_read'
]){
  if(!core.includes(snippet))throw new Error('Recovery core: invariável ausente: '+snippet);
}
const count=(text,re)=>(text.match(re)||[]).length;
const expected=[
  ['fontes',count(seed,/insert into public\.territorial_sources/gi),5],
  ['regiões',count(seed,/insert into public\.administrative_regions/gi),9],
  ['bairros urbanos',count(seed,/'urban' from public\.municipalities/gi),71],
  ['núcleos isolados',count(seed,/'isolated_nucleus' from public\.municipalities/gi),14],
  ['vínculos bairro-região',count(seed,/insert into public\.neighborhood_regions/gi),72],
  ['categorias',count(seed,/insert into public\.categories/gi),9]
];
for(const [label,got,want] of expected){
  if(got!==want)throw new Error(`Recovery seed: ${label}: esperado ${want}, encontrado ${got}`);
}
if(!storage.includes("'occurrence-attachments'")||!storage.includes('1572864')||!storage.includes('false')){
  throw new Error('Recovery Storage: bucket privado/limite esperado ausente.');
}
for(const table of ['occurrence_tracking_tokens','submission_rate_limits','tracking_rate_limits']){
  if(!hard.includes(`alter table private.${table} enable row level security`)){
    throw new Error('Recovery private: RLS ausente em '+table);
  }
}
console.log('Recovery DB: arquivos e invariantes estruturais OK');
console.log('Seed: 5 fontes, 9 regiões, 71 bairros urbanos, 72 vínculos, 14 núcleos e 9 categorias');
