import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const fail=[];
const warn=[];
const ok=[];

function read(rel){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){fail.push(`Arquivo ausente: ${rel}`);return ''}
  return fs.readFileSync(file,'utf8');
}
function assert(condition,message){condition?ok.push(message):fail.push(message)}
function normalize(v=''){
  return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

const required=[
  'index.html','assets/styles.css','assets/app.js','assets/piracicaba.css',
  'assets/piracicaba.js','assets/piracicaba-mapas.js','assets/piracicaba-mapas.css','assets/privacy-geo.js',
  'assets/runtime-config.js','assets/supabase-bridge.js','assets/site-enhancements.js','assets/site-enhancements.css','assets/design-v47.css',
  'data/piracicaba.json','manifest.webmanifest','sw.js','favicon.svg','README.md',
  'GEOGRAFIA.md','API.md','schema.sql','TESTES.md','SUPABASE.md','WORK-CONTINUAR.md',
  'supabase/migrations/20260917_secure_occurrence_submission_v1.sql',
  'supabase/migrations/20260917_reserve_demo_protocol_range.sql',
  'supabase/migrations/20260917_restrict_profile_self_role.sql',
  'supabase/migrations/20260917_secure_occurrence_tracking_edge.sql',
  'supabase/functions/submit-occurrence/index.ts','supabase/functions/submit-occurrence/deno.json',
  'supabase/functions/track-occurrence/index.ts','supabase/functions/track-occurrence/deno.json'
];
for(const file of required)assert(fs.existsSync(path.join(root,file)),`Presente: ${file}`);

let data;
try{data=JSON.parse(read('data/piracicaba.json'));ok.push('data/piracicaba.json é JSON válido')}catch(e){fail.push(`JSON territorial inválido: ${e.message}`)}

if(data){
  assert(data?.municipio?.ibgeCode==='3538709','Código IBGE de Piracicaba = 3538709');
  assert(data?.municipio?.name==='Piracicaba','Município identificado como Piracicaba');
  assert(data?.municipio?.uf==='SP','UF = SP');
  assert(Array.isArray(data?.municipio?.center)&&data.municipio.center.length===2,'Centro cartográfico possui latitude/longitude');
  assert(Number(data?.municipio?.areaKm2)>0,'Área municipal informada');
  assert(Number(data?.municipio?.populationEstimate)>0,'População estimada informada');

  const regions=data.administrativeRegions||[];
  assert(regions.length===9,'Existem 9 regiões administrativas');
  const ids=regions.map(r=>r.id);
  assert(new Set(ids).size===9,'IDs das regiões são únicos');
  assert([1,2,3,4,5,6,7,8,9].every(id=>ids.includes(id)),'Regiões 1 a 9 estão presentes');

  for(const r of regions){
    assert(Number(r.population)>0,`Região ${r.id}: população válida`);
    assert(Number(r.areaKm2)>0,`Região ${r.id}: área válida`);
    assert(Number(r.densityHabKm2)>0,`Região ${r.id}: densidade válida`);
    assert(Array.isArray(r.neighborhoods)&&r.neighborhoods.length>0,`Região ${r.id}: possui bairros`);
  }

  const seen=new Map();
  for(const r of regions){
    for(const name of r.neighborhoods||[]){
      const key=normalize(name.replace(/^Parte do /i,''));
      if(!seen.has(key))seen.set(key,[]);
      seen.get(key).push({region:r.id,name});
    }
  }
  const duplicates=[...seen.entries()].filter(([,arr])=>new Set(arr.map(x=>x.region)).size>1);
  for(const [key,arr] of duplicates){
    warn.push(`Referência territorial em múltiplas regiões: ${key} → ${arr.map(x=>`R${x.region} (${x.name})`).join(', ')}`);
  }
  assert(duplicates.some(([key])=>key==='guamium'),'Ambiguidade conhecida de Guamium está preservada e detectável');

  assert(data?.metadata?.machineReadable?.municipalBoundary?.format==='GeoJSON','Limite municipal configurado como GeoJSON');
  assert(data?.metadata?.machineReadable?.administrativeRegions?.status==='metadata-only','Polígonos das regiões continuam marcados como metadata-only');
  assert(Array.isArray(data.officialMapLayers)&&data.officialMapLayers.length>=10,'Catálogo municipal possui camadas territoriais');
}

const index=read('index.html');
for(const ref of ['assets/styles.css','assets/piracicaba.css','assets/piracicaba-mapas.css','assets/site-enhancements.css','assets/design-v47.css','assets/runtime-config.js','assets/supabase-bridge.js','assets/app.js','assets/piracicaba.js','assets/piracicaba-mapas.js','assets/privacy-geo.js','assets/site-enhancements.js']){
  assert(index.includes(ref),`index.html referencia ${ref}`);
}
assert(index.includes('Protótipo acadêmico independente'),'Aviso de independência institucional está no HTML');
assert(index.includes('Piracicaba · SP'),'Identidade local de Piracicaba está no HTML');

const sw=read('sw.js');
for(const ref of ['assets/app.js','assets/piracicaba.js','assets/piracicaba-mapas.js','assets/piracicaba-mapas.css','assets/privacy-geo.js','assets/runtime-config.js','assets/supabase-bridge.js','assets/site-enhancements.js','assets/site-enhancements.css','assets/design-v47.css','data/piracicaba.json']){
  assert(sw.includes(ref),`Service worker referencia ${ref}`);
}

const design=read('assets/design-v47.css');
assert(design.includes('--civic-950'),'Tema v4.7 possui tokens visuais próprios');
assert(design.includes('--lime'),'Tema v4.7 incorpora acento visual dos protótipos Manus');
assert(design.includes('@media(max-width:650px)'),'Tema v4.7 inclui ajustes mobile');

const privacyGeo=read('assets/privacy-geo.js');
assert(privacyGeo.includes("PUBLIC_DECIMALS=3"),'Localização pública usa precisão reduzida no protótipo');
assert(privacyGeo.includes('exactLocation'),'Localização exata é separada no bloco privado local');
assert(privacyGeo.includes('territoryResolutionStatus'),'Registro guarda estado da resolução territorial');

const runtime=read('assets/runtime-config.js');
assert(runtime.includes("dataMode: 'hybrid-write'"),'Runtime usa modo híbrido com escrita segura');
assert(runtime.includes("projectRef: 'yvmkgpijzewssdxgimit'"),'Runtime aponta para o Supabase exclusivo do Cidade Conecta');
assert(runtime.includes('publishableKey'),'Runtime prevê somente chave pública do cliente');
assert(!runtime.includes('service_role:'),'Runtime não contém campo service_role');
assert(!runtime.includes('sb_secret_'),'Runtime não contém chave secreta Supabase');
assert(runtime.includes('submitFunction'),'Runtime referencia Edge Function de submissão');
assert(runtime.includes('trackFunction'),'Runtime referencia Edge Function de acompanhamento');

const bridge=read('assets/supabase-bridge.js');
assert(bridge.includes('/rest/v1/'),'Ponte usa Data API do Supabase');
assert(bridge.includes("select('municipalities'"),'Ponte valida conexão pelo município do projeto');
assert(bridge.includes('/functions/v1/'),'Ponte usa Edge Functions para escrita/acompanhamento');
assert(bridge.includes('sb.trackFunction'),'Ponte acompanha ocorrência pela Edge Function dedicada');
assert(!bridge.includes("rpc('track_occurrence'"),'Ponte pública não chama diretamente RPC privilegiada de rastreamento');
assert(bridge.includes('moderation_status=eq.approved'),'Lista pública filtra somente ocorrências aprovadas');
assert(!bridge.includes('service_role'),'Ponte pública não usa service_role');

const enhancements=read('assets/site-enhancements.js');
assert(enhancements.includes('Supabase ativo'),'Interface informa leitura e escrita conectadas ao Supabase');
assert(enhancements.includes('Restaurar demo'),'Painel permite restaurar dados demonstrativos');

const app=read('assets/app.js');
assert(app.includes('submitOccurrence'),'Aplicação usa submissão segura do backend');
assert(app.includes('trackingKey'),'Aplicação preserva token privado do próprio protocolo');
assert(app.includes('moderationStatus'),'Aplicação trata moderação antes da exposição pública');
assert(app.includes('/^[=+\\-@]/'),'Exportação CSV protege contra fórmula injetada');

const edge=read('supabase/functions/submit-occurrence/index.ts');
assert(edge.includes('SUPABASE_SERVICE_ROLE_KEY'),'Edge de submissão usa service role apenas no backend');
assert(edge.includes('consume_submission_quota'),'Edge de submissão aplica rate limiting');
assert(edge.includes('personal_data_in_public_text'),'Edge bloqueia identificadores pessoais no texto público');
assert(edge.includes('invalid_image_signature'),'Edge valida assinatura binária da imagem');

const trackingEdge=read('supabase/functions/track-occurrence/index.ts');
assert(trackingEdge.includes('consume_tracking_quota'),'Edge de acompanhamento aplica rate limiting');
assert(trackingEdge.includes('track_occurrence'),'Edge de acompanhamento chama RPC interna');

const trackingMigration=read('supabase/migrations/20260917_secure_occurrence_tracking_edge.sql');
assert(trackingMigration.includes('grant execute on function public.track_occurrence(text,text) to service_role'),'RPC de acompanhamento fica restrita ao backend');

const schema=read('schema.sql');
assert(schema.includes('occurrence_private_location'),'Schema separa localização exata da ocorrência pública');
assert(schema.includes('neighborhood_regions'),'Schema suporta bairro associado a múltiplas regiões');

const api=read('API.md');
assert(api.includes('/api/territory/resolve'),'Contrato de API possui resolução territorial');
assert(api.includes('public_latitude'),'Contrato diferencia coordenada pública');

const geo=read('GEOGRAFIA.md');
assert(geo.includes('não desenha polígonos aproximados'),'Documentação proíbe polígonos regionais aproximados');
assert(geo.includes('ponto-em-polígono'),'Documentação prevê ponto-em-polígono com vetor oficial');

const supabase=read('SUPABASE.md');
assert(supabase.includes('separado'),'Documentação exige projeto Supabase separado');
assert(supabase.includes('service_role'),'Documentação alerta sobre chave administrativa');

console.log(`\nCidade Conecta — validação estática`);
console.log(`OK: ${ok.length}`);
if(warn.length){console.log(`Avisos: ${warn.length}`);for(const w of warn)console.log(`  ⚠ ${w}`)}
if(fail.length){console.error(`Falhas: ${fail.length}`);for(const f of fail)console.error(`  ✖ ${f}`);process.exit(1)}
console.log('✓ Projeto validado sem falhas bloqueantes.');
