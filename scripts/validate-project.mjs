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
  'data/piracicaba.json','manifest.webmanifest','sw.js','favicon.svg','README.md',
  'GEOGRAFIA.md','API.md','schema.sql','TESTES.md'
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
for(const ref of ['assets/styles.css','assets/piracicaba.css','assets/piracicaba-mapas.css','assets/app.js','assets/piracicaba.js','assets/piracicaba-mapas.js','assets/privacy-geo.js']){
  assert(index.includes(ref),`index.html referencia ${ref}`);
}
assert(index.includes('Protótipo acadêmico independente'),'Aviso de independência institucional está no HTML');
assert(index.includes('Piracicaba · SP'),'Identidade local de Piracicaba está no HTML');

const sw=read('sw.js');
for(const ref of ['assets/app.js','assets/piracicaba.js','assets/piracicaba-mapas.js','assets/piracicaba-mapas.css','assets/privacy-geo.js','data/piracicaba.json']){
  assert(sw.includes(ref),`Service worker referencia ${ref}`);
}

const privacyGeo=read('assets/privacy-geo.js');
assert(privacyGeo.includes("PUBLIC_DECIMALS=3"),'Localização pública usa precisão reduzida no protótipo');
assert(privacyGeo.includes('exactLocation'),'Localização exata é separada no bloco privado local');
assert(privacyGeo.includes('territoryResolutionStatus'),'Registro guarda estado da resolução territorial');

const schema=read('schema.sql');
assert(schema.includes('occurrence_private_location'),'Schema separa localização exata da ocorrência pública');
assert(schema.includes('neighborhood_regions'),'Schema suporta bairro associado a múltiplas regiões');

const api=read('API.md');
assert(api.includes('/api/territory/resolve'),'Contrato de API possui resolução territorial');
assert(api.includes('public_latitude'),'Contrato diferencia coordenada pública');

const geo=read('GEOGRAFIA.md');
assert(geo.includes('não desenha polígonos aproximados'),'Documentação proíbe polígonos regionais aproximados');
assert(geo.includes('ponto-em-polígono'),'Documentação prevê ponto-em-polígono com vetor oficial');

console.log(`\nCidade Conecta — validação estática`);
console.log(`OK: ${ok.length}`);
if(warn.length){console.log(`Avisos: ${warn.length}`);for(const w of warn)console.log(`  ⚠ ${w}`)}
if(fail.length){console.error(`Falhas: ${fail.length}`);for(const f of fail)console.error(`  ✖ ${f}`);process.exit(1)}
console.log('✓ Projeto validado sem falhas bloqueantes.');
