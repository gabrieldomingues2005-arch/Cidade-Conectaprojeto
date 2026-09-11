(()=>{
'use strict';
const APP='#app';
const DATA_URL='data/piracicaba.json';
const STORAGE_KEY='cidadeConecta2026v3';
const official={
  prefeitura:'https://piracicaba.sp.gov.br/',
  atendimento:'https://sempapel.pmp.sp.gov.br/156/',
  geo:'https://geo.piracicaba.sp.gov.br/',
  mapas:'https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/',
  ibge:'https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html'
};
let cityData=null;

const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const n=(v,d=0)=>Number(v||d).toLocaleString('pt-BR');
const nf=(v,d=2)=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});

async function loadData(){
  if(cityData)return cityData;
  try{
    const r=await fetch(DATA_URL,{cache:'no-cache'});
    if(!r.ok)throw new Error('Falha ao carregar base territorial');
    cityData=await r.json();
    window.CidadeConectaPiracicaba=cityData;
    return cityData;
  }catch(err){
    console.warn('[Cidade Conecta] Base territorial indisponível:',err);
    return null;
  }
}

function route(){return location.hash.replace(/^#\/?/,'').split('/')[0]}
function readOccurrences(){
  try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(d?.occurrences)?d.occurrences:[]}catch{return[]}
}
function findRegion(bairro,data=cityData){
  if(!data||!bairro)return null;
  const b=norm(bairro);
  for(const region of data.administrativeRegions||[]){
    for(const name of region.neighborhoods||[]){
      const nn=norm(name.replace(/^parte do /i,''));
      if(b===nn||b.includes(nn)||nn.includes(b))return region;
    }
  }
  return null;
}
function routingFor(category,data=cityData){return data?.suggestedRouting?.[category]||'Triagem de atendimento / 156'}

function sourcesNote(data){
  const sources=(data?.metadata?.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>`).join(' · ');
  return `<div class="geoSources"><b>Fontes de referência:</b> ${sources}<br><span>Os dados territoriais são informativos para o protótipo e devem ser validados novamente antes de uso institucional.</span></div>`;
}

function homeSection(data){
  const m=data.municipio;
  const regions=data.administrativeRegions||[];
  const urbanPop=regions.reduce((s,r)=>s+Number(r.population||0),0);
  const densest=[...regions].sort((a,b)=>b.densityHabKm2-a.densityHabKm2)[0];
  const el=document.createElement('section');
  el.className='section cityContext';
  el.id='piraContext';
  el.innerHTML=`<div class="wrap"><div class="card cityIntro"><span class="cityLabel">📍 Piracicaba · São Paulo</span><h2>O Cidade Conecta agora entende o território de Piracicaba</h2><p class="muted">Além do registro por bairro e mapa, o protótipo passa a usar a divisão municipal em <b>9 regiões administrativas</b>, dados demográficos de referência e roteamento sugerido por tipo de ocorrência.</p><div class="geoQuickStats"><div><b>${n(m.populationEstimate)}</b><span>população estimada · ${m.populationEstimateYear}</span></div><div><b>${nf(m.areaKm2,3)} km²</b><span>área territorial · ${m.areaReferenceYear}</span></div><div><b>${nf(m.densityHabKm2)} hab/km²</b><span>densidade · ${m.densityReferenceYear}</span></div><div><b>${n(urbanPop)}</b><span>habitantes nas 9 regiões do mapa administrativo</span></div></div><div class="cityGrid"><div class="cityFeature"><span class="cityIcon">🏘️</span><b>Regiões administrativas</b><span class="small muted">O bairro informado pode ser relacionado automaticamente a uma das nove regiões usadas pela Prefeitura no mapa territorial.</span></div><div class="cityFeature"><span class="cityIcon">🧭</span><b>Leitura geográfica</b><span class="small muted">Área, população, densidade, bairros, núcleos isolados e municípios vizinhos ficam disponíveis em uma página territorial.</span></div><div class="cityFeature"><span class="cityIcon">📊</span><b>Indicadores territoriais</b><span class="small muted">Os registros do navegador podem ser agrupados por região para mostrar onde há maior concentração de ocorrências.</span></div></div><div class="geoHighlight"><span>Região administrativa mais densa no mapa de referência</span><b>Região ${densest.id} · ${nf(densest.densityHabKm2)} hab/km²</b></div><div class="cityOfficial"><strong>Canais e bases oficiais de Piracicaba</strong><div class="small muted">O Cidade Conecta é um projeto acadêmico independente. Os links abaixo levam a serviços externos oficiais.</div><div class="cityLinks"><a class="cityLink" href="${official.prefeitura}" target="_blank" rel="noopener noreferrer">🏛️ Prefeitura</a><a class="cityLink" href="${official.atendimento}" target="_blank" rel="noopener noreferrer">☎️ Atendimento 156</a><a class="cityLink" href="${official.geo}" target="_blank" rel="noopener noreferrer">🗺️ Geoprocessamento</a><a class="cityLink" href="#/piracicaba">📍 Ver geografia completa</a></div><div class="cityDisclaimer">O projeto não representa nem substitui a Prefeitura Municipal de Piracicaba.</div></div></div></div>`;
  return el;
}

function regionCard(r){
  return `<article class="card regionCard" data-region="${r.id}"><div class="regionHead"><span class="regionNumber">R${r.id}</span><div><h3>Região ${r.id}</h3><span>${n(r.population)} habitantes</span></div></div><div class="regionMetrics"><span><b>${nf(r.areaKm2)} km²</b> área</span><span><b>${nf(r.densityHabKm2)} hab/km²</b> densidade</span></div><details><summary>${r.neighborhoods.length} bairros/áreas</summary><div class="bairroTags">${r.neighborhoods.map(x=>`<span>${esc(x)}</span>`).join('')}</div></details></article>`;
}

function geographyPage(data){
  const m=data.municipio;
  const regions=data.administrativeRegions||[];
  const urbanPop=regions.reduce((s,r)=>s+Number(r.population||0),0);
  const occ=readOccurrences();
  const regionCounts=regions.map(r=>({id:r.id,count:occ.filter(o=>findRegion(o.bairro,data)?.id===r.id).length}));
  const max=Math.max(1,...regionCounts.map(x=>x.count));
  const app=document.querySelector(APP);if(!app)return;
  app.innerHTML=`<section class="pageHead geoHead"><div class="wrap"><div class="eyebrow">Território · Piracicaba/SP</div><h1>Geografia e leitura territorial</h1><p class="muted">Uma visão organizada do município para apoiar o registro e a análise comunitária de problemas urbanos. Dados oficiais de referência são mantidos separados dos dados demonstrativos de ocorrências.</p></div></section><section class="section"><div class="wrap"><div class="geoMunicipal"><div class="card geoHeroCard"><span class="cityLabel">Código IBGE ${esc(m.ibgeCode)}</span><h2>Piracicaba em números</h2><div class="geoBigStats"><div><b>${n(m.populationEstimate)}</b><span>população estimada (${m.populationEstimateYear})</span></div><div><b>${n(m.populationCensus)}</b><span>população no Censo ${m.censusYear}</span></div><div><b>${nf(m.areaKm2,3)} km²</b><span>área territorial (${m.areaReferenceYear})</span></div><div><b>${nf(m.densityHabKm2)} hab/km²</b><span>densidade demográfica (${m.densityReferenceYear})</span></div></div><p class="small muted">As 9 regiões administrativas listadas abaixo somam ${n(urbanPop)} habitantes no mapa municipal de referência atualizado em 12/12/2024. Esse total representa a divisão usada naquele mapa e não deve ser confundido com a estimativa populacional municipal de ${m.populationEstimateYear}.</p></div><div class="card geoLinksCard"><h2>Bases cartográficas</h2><p class="muted">Consulte as bases oficiais para zoneamento, bairros, áreas de risco, equipamentos públicos e outros temas territoriais.</p><a class="btn primary" href="${official.geo}" target="_blank" rel="noopener noreferrer">Abrir geoprocessamento ↗</a><a class="btn secondary" href="${official.mapas}" target="_blank" rel="noopener noreferrer">Mapas do município ↗</a><a class="btn secondary" href="${official.ibge}" target="_blank" rel="noopener noreferrer">IBGE Cidades ↗</a></div></div></div></section><section class="section sectionSoft"><div class="wrap"><div class="titleRow"><div><h2>9 regiões administrativas</h2><p class="muted">População, área, densidade e bairros componentes conforme o mapa municipal de referência.</p></div></div><div class="regionGrid">${regions.map(regionCard).join('')}</div></div></section><section class="section"><div class="wrap grid2"><div class="card"><h2>Núcleos urbanos isolados e áreas rurais</h2><p class="muted">O território de Piracicaba também inclui núcleos urbanos localizados na área rural. No protótipo eles ficam disponíveis como referência territorial, sem presumir limites cartográficos.</p><div class="bairroTags geoTags">${(data.ruralAndIsolatedUrbanNuclei||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="card"><h2>Municípios vizinhos</h2><p class="muted">Contexto regional útil para entender deslocamentos, conexões viárias e limites do município.</p><div class="bairroTags geoTags">${(data.neighborMunicipalities||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></div></section><section class="section sectionSoft"><div class="wrap"><div class="titleRow"><div><h2>Ocorrências por região neste navegador</h2><p class="muted">Leitura demonstrativa calculada a partir dos bairros dos registros salvos localmente.</p></div></div><div class="card territoryChart">${regionCounts.map(x=>`<div class="territoryRow"><span>Região ${x.id}</span><div class="territoryTrack"><i style="width:${Math.round(x.count/max*100)}%"></i></div><b>${x.count}</b></div>`).join('')}<p class="small muted">Bairros que não correspondem exatamente à base territorial permanecem sem região atribuída até revisão.</p></div>${sourcesNote(data)}</div></section>`;
  window.scrollTo(0,0);
}

function addRegisterAdvisor(data){
  const form=document.querySelector('#occForm');if(!form||document.querySelector('#piraAdvisor'))return;
  const category=document.querySelector('#category');
  const bairro=document.querySelector('#bairro');
  if(!category||!bairro)return;
  const box=document.createElement('div');
  box.id='piraAdvisor';box.className='geoAdvisor full';
  const anchor=form.querySelector('.formGrid');
  if(anchor)anchor.insertBefore(box,anchor.children[2]||null);
  const update=()=>{
    const r=findRegion(bairro.value,data);
    const routeTxt=r?`Região ${r.id} · ${n(r.population)} hab. · ${nf(r.densityHabKm2)} hab/km²`:'Região ainda não identificada';
    const sector=category.value?routingFor(category.value,data):'Escolha uma categoria para ver a área sugerida';
    box.innerHTML=`<div><span class="geoAdvisorLabel">📍 Leitura territorial automática</span><b>${esc(routeTxt)}</b><small>Bairro informado: ${esc(bairro.value||'—')}</small></div><div><span class="geoAdvisorLabel">↗ Encaminhamento sugerido</span><b>${esc(sector)}</b><small>Sugestão do protótipo; não é roteamento oficial da Prefeitura.</small></div>`;
  };
  category.addEventListener('change',update);bairro.addEventListener('input',update);update();
}

function addDashboardTerritory(data){
  if(route()!=='dashboard'||document.querySelector('#territoryDash'))return;
  const app=document.querySelector(APP);if(!app)return;
  const occ=readOccurrences();
  const grouped=(data.administrativeRegions||[]).map(r=>({r,count:occ.filter(o=>findRegion(o.bairro,data)?.id===r.id).length}));
  const known=grouped.reduce((s,x)=>s+x.count,0),unknown=Math.max(0,occ.length-known),max=Math.max(1,...grouped.map(x=>x.count));
  const sec=document.createElement('section');
  sec.className='section';sec.id='territoryDash';
  sec.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Leitura territorial de Piracicaba</h2><p class="muted">Distribuição demonstrativa das ocorrências pelas 9 regiões administrativas.</p></div><a href="#/piracicaba" class="btn secondary">Geografia completa</a></div><div class="card territoryChart">${grouped.map(x=>`<div class="territoryRow"><span>Região ${x.r.id}</span><div class="territoryTrack"><i style="width:${Math.round(x.count/max*100)}%"></i></div><b>${x.count}</b></div>`).join('')}${unknown?`<div class="territoryUnknown">${unknown} ocorrência(s) sem região identificada pelo nome do bairro.</div>`:''}</div></div>`;
  app.appendChild(sec);
}

function enhance(data){
  const app=document.querySelector(APP);if(!app||!data)return;
  const r=route();
  if(r==='piracicaba'){geographyPage(data);return}
  if(r===''){
    const hero=app.querySelector('.hero');
    if(hero&&!document.querySelector('#piraContext'))hero.insertAdjacentElement('afterend',homeSection(data));
  }
  if(r==='registrar')addRegisterAdvisor(data);
  if(r==='dashboard')addDashboardTerritory(data);
}

function scheduleEnhance(){loadData().then(data=>setTimeout(()=>enhance(data),0))}
const observer=new MutationObserver(()=>{if(route()!=='piracicaba')scheduleEnhance()});
window.addEventListener('DOMContentLoaded',()=>{const app=document.querySelector(APP);if(app)observer.observe(app,{childList:true});scheduleEnhance()});
window.addEventListener('hashchange',scheduleEnhance);
})();