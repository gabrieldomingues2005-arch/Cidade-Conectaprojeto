(()=>{
'use strict';
const DATA_URL='data/piracicaba.json';
const STORAGE_KEY='cidadeConecta2026v3';
const IBGE_BOUNDARY='https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3538709?formato=application/vnd.geo%2Bjson&qualidade=minima';
const OFFICIAL_REGIONS_PDF='https://piracicaba.sp.gov.br/wp-content/uploads/2024/12/MAPA-DAS-REGIOES-ADMINISTRATIVAS-FINAL.pdf';
const OFFICIAL_MAPS='https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/';
const OFFICIAL_GEO='https://piracicaba.geopixel.com.br/geopixelcidades3/';
const CATS={vias:'Vias públicas',iluminacao:'Iluminação pública',residuos:'Resíduos',agua:'Água / saneamento',alagamentos:'Alagamentos',sinalizacao:'Sinalização',acessibilidade:'Acessibilidade',areas:'Áreas públicas',outros:'Outros'};
let dataCache=null,boundaryMap=null,queued=false;
const route=()=>location.hash.replace(/^#\/?/,'').split('/')[0];
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const n=v=>Number(v||0).toLocaleString('pt-BR');
const nf=(v,d=2)=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});

async function data(){
  if(dataCache)return dataCache;
  try{const r=await fetch(DATA_URL,{cache:'no-cache'});if(!r.ok)return null;dataCache=await r.json();return dataCache}catch{return null}
}
function readOccurrences(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(d?.occurrences)?d.occurrences:[]}catch{return[]}}
function allNeighborhoods(d){
  const names=[];
  for(const r of d?.administrativeRegions||[])for(const b of r.neighborhoods||[])names.push(b,b.replace(/^Parte do /i,''));
  names.push(...(d?.ruralAndIsolatedUrbanNuclei||[]));
  return [...new Set(names.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
}
function findRegions(bairro,d){
  if(!bairro||!d)return[];
  const q=norm(bairro),exact=[],partial=[];
  for(const r of d.administrativeRegions||[]){
    for(const raw of r.neighborhoods||[]){
      const candidates=[raw,raw.replace(/^Parte do /i,'')].map(norm);
      if(candidates.includes(q)){exact.push(r);break}
      if(q.length>=4&&candidates.some(x=>x.includes(q)||q.includes(x))){partial.push(r);break}
    }
  }
  const base=exact.length?exact:partial;
  return [...new Map(base.map(r=>[r.id,r])).values()];
}
function isRuralReference(name,d){const q=norm(name);return (d?.ruralAndIsolatedUrbanNuclei||[]).find(x=>norm(x)===q)||null}
function routingFor(category,d){return d?.suggestedRouting?.[category]||'Triagem de atendimento / 156'}
function occurrenceRegion(o,d){
  if(Number.isInteger(o?.regionId)){const found=(d.administrativeRegions||[]).find(r=>r.id===o.regionId);if(found)return[found]}
  return findRegions(o?.bairro,d);
}
function getProtocolFromPage(){
  const hidden=document.querySelector('#adminProtocol')?.value;
  if(hidden)return hidden;
  const hash=location.hash.match(/ocorrencia\/([^/?#]+)/i);if(hash)return decodeURIComponent(hash[1]);
  const e=[...document.querySelectorAll('.eyebrow')].find(x=>/^CC-\d{4}-\d+/i.test(x.textContent.trim()));
  return e?.textContent.trim()||'';
}

function ensureDatalist(d){
  const input=document.querySelector('#bairro');if(!input)return;
  let dl=document.querySelector('#piraBairros');
  if(!dl){dl=document.createElement('datalist');dl.id='piraBairros';document.body.appendChild(dl)}
  if(!dl.children.length)dl.innerHTML=allNeighborhoods(d).map(x=>`<option value="${esc(x)}"></option>`).join('');
  input.setAttribute('list','piraBairros');
  input.setAttribute('autocomplete','off');
  const field=input.closest('.field');
  if(field&&!field.querySelector('.piraBairroHelp')){
    const help=document.createElement('span');help.className='help piraBairroHelp';help.textContent='Comece a digitar para usar a base territorial de bairros e núcleos de Piracicaba.';field.appendChild(help);
  }
  const advisor=document.querySelector('#piraAdvisor');
  const showAmbiguity=()=>{
    if(!advisor)return;
    let warn=document.querySelector('#piraRegionWarning');
    const regs=findRegions(input.value,d);
    if(regs.length>1){
      if(!warn){warn=document.createElement('div');warn.id='piraRegionWarning';warn.className='geoAmbiguity';advisor.insertAdjacentElement('afterend',warn)}
      warn.innerHTML=`⚠️ <b>${esc(input.value)}</b> aparece associado a mais de uma região na base de referência (${regs.map(r=>'Região '+r.id).join(' e ')}). Confirme a posição no mapa oficial antes de uso institucional.`;
    }else warn?.remove();
  };
  input.addEventListener('input',showAmbiguity);showAmbiguity();
}

function regionSummary(regs){
  if(!regs.length)return'<span class="mini">🧭 Região não identificada</span>';
  if(regs.length===1)return`<span class="mini">🧭 Região ${regs[0].id}</span>`;
  return`<span class="mini">🧭 Regiões ${regs.map(r=>r.id).join(' / ')}</span>`;
}
function enhanceOccurrence(d){
  if(!['ocorrencia','acompanhar','admin'].includes(route()))return;
  const p=getProtocolFromPage();if(!p)return;
  const o=readOccurrences().find(x=>String(x.protocol).toUpperCase()===String(p).toUpperCase());if(!o)return;
  const regs=occurrenceRegion(o,d);
  const article=[...document.querySelectorAll('.detail .card')].find(x=>x.querySelector('.eyebrow'));
  const chips=article?.querySelector('.chips');
  if(chips&&!chips.querySelector('[data-pira-territory]')){
    const holder=document.createElement('span');holder.dataset.piraTerritory='1';holder.className='piraTerritoryChips';holder.innerHTML=`<span class="mini">📍 Piracicaba · SP</span>${regionSummary(regs)}`;chips.appendChild(holder);
  }
  const aside=document.querySelector('.detail aside.card');
  if(aside&&!aside.querySelector('#piraRoutingHint')){
    const box=document.createElement('div');box.id='piraRoutingHint';box.className='routingHint';
    const regionText=regs.length===1?`Região ${regs[0].id}`:regs.length>1?`Regiões candidatas ${regs.map(r=>r.id).join(' e ')}`:'região não identificada pelo bairro';
    box.innerHTML=`<span>Encaminhamento sugerido do protótipo</span><b>${esc(routingFor(o.category,d))}</b><small>${esc(regionText)} · Esta indicação não é encaminhamento oficial da Prefeitura.</small>`;
    aside.appendChild(box);
  }
}

function renderBoundarySection(d){
  if(route()!=='piracicaba'||document.querySelector('#geoBoundarySection'))return;
  const app=document.querySelector('#app');if(!app||!app.querySelector('.geoHead'))return;
  const section=document.createElement('section');section.id='geoBoundarySection';section.className='section geoBoundarySection';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Limite municipal no mapa</h2><p class="muted">A linha do município é carregada dinamicamente pela API de Malhas Geográficas do IBGE. As nove regiões administrativas permanecem baseadas no mapa oficial municipal; não desenhamos polígonos aproximados para evitar apresentar limites inventados.</p></div><a class="btn secondary" href="${OFFICIAL_REGIONS_PDF}" target="_blank" rel="noopener noreferrer">Mapa oficial das regiões ↗</a></div><div class="geoBoundaryGrid"><div class="card"><div id="municipalBoundaryMap" class="municipalBoundaryMap" aria-label="Mapa do limite municipal de Piracicaba"></div><div id="boundaryStatus" class="boundaryStatus">Carregando limite municipal do IBGE…</div></div><aside class="card boundaryInfo"><span class="cityLabel">Malha municipal oficial</span><h3>O que este mapa mostra</h3><p>O contorno representa o município de Piracicaba segundo a malha disponibilizada pelo IBGE. Ele serve como referência para manter os registros dentro do contexto territorial correto.</p><div class="boundaryFacts"><span><b>${nf(d.municipio.areaKm2,3)} km²</b> área territorial</span><span><b>${n(d.municipio.populationEstimate)}</b> habitantes estimados</span><span><b>3538709</b> código IBGE</span></div><div class="notice warning">Os limites internos das regiões administrativas não são inferidos. Quando houver uma camada vetorial municipal adequada para consumo pelo projeto, ela poderá ser adicionada sem alterar a lógica do sistema.</div></aside></div></div>`;
  const first=app.querySelector('.section');
  if(first?.nextElementSibling)first.nextElementSibling.insertAdjacentElement('afterend',section);else app.appendChild(section);
  initBoundaryMap(d);
}
async function initBoundaryMap(d){
  const el=document.querySelector('#municipalBoundaryMap');if(!el||!window.L||boundaryMap)return;
  boundaryMap=L.map(el,{scrollWheelZoom:false}).setView(d.municipio.center||[-22.7253,-47.6492],9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(boundaryMap);
  L.circleMarker(d.municipio.center||[-22.7253,-47.6492],{radius:5,weight:2,fillOpacity:.7}).addTo(boundaryMap).bindPopup('Ponto de referência central do mapa de Piracicaba');
  const status=document.querySelector('#boundaryStatus');
  try{
    const r=await fetch(IBGE_BOUNDARY,{headers:{Accept:'application/vnd.geo+json'}});if(!r.ok)throw new Error('HTTP '+r.status);
    const geo=await r.json();
    const layer=L.geoJSON(geo,{style:{color:'#13706e',weight:3,opacity:.9,fillColor:'#bff054',fillOpacity:.06}}).addTo(boundaryMap);
    const b=layer.getBounds();if(b.isValid())boundaryMap.fitBounds(b.pad(.04));
    if(status)status.innerHTML='✅ Limite municipal carregado pela API de Malhas Geográficas do IBGE.';
  }catch(err){
    console.warn('[Cidade Conecta] limite IBGE indisponível',err);
    if(status)status.innerHTML=`⚠️ O limite vetorial não pôde ser carregado agora. O mapa-base continua disponível. <a href="https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html" target="_blank" rel="noopener noreferrer">Consultar IBGE ↗</a>`;
  }
  setTimeout(()=>boundaryMap?.invalidateSize(),100);
}

function lookupResult(value,d){
  const regs=findRegions(value,d),rural=isRuralReference(value,d);
  if(regs.length===1){const r=regs[0];return`<div class="lookupResult okLookup"><span class="regionNumber">R${r.id}</span><div><b>${esc(value)} → Região ${r.id}</b><p>${n(r.population)} habitantes · ${nf(r.areaKm2)} km² · ${nf(r.densityHabKm2)} hab/km²</p></div></div>`}
  if(regs.length>1)return`<div class="lookupResult warnLookup"><span>⚠️</span><div><b>Correspondência em mais de uma região</b><p>${esc(value)} aparece na base associada às regiões ${regs.map(r=>r.id).join(' e ')}. Use o mapa municipal para confirmar o trecho.</p></div></div>`;
  if(rural)return`<div class="lookupResult"><span>🌾</span><div><b>${esc(rural)}</b><p>Núcleo urbano isolado/área rural de referência. Não é atribuído automaticamente a uma das 9 regiões urbanas neste protótipo.</p></div></div>`;
  return`<div class="lookupResult"><span>🔎</span><div><b>Bairro não localizado na base atual</b><p>Confira a grafia ou consulte os mapas oficiais do município.</p></div></div>`;
}
function renderLookup(d){
  if(route()!=='piracicaba'||document.querySelector('#geoLookupSection'))return;
  const app=document.querySelector('#app');if(!app||!app.querySelector('.geoHead'))return;
  const names=allNeighborhoods(d);
  const section=document.createElement('section');section.id='geoLookupSection';section.className='section sectionSoft';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Localizador de bairro e região</h2><p class="muted">Pesquise um bairro de Piracicaba para descobrir a região administrativa correspondente na base de referência.</p></div></div><div class="card geoLookupCard"><form id="geoLookupForm" class="geoLookupForm"><div class="field"><label for="geoBairroLookup">Bairro ou núcleo</label><input id="geoBairroLookup" list="geoBairrosLookup" placeholder="Ex.: Vila Rezende, Paulista, Piracicamirim" autocomplete="off"><datalist id="geoBairrosLookup">${names.map(x=>`<option value="${esc(x)}"></option>`).join('')}</datalist></div><div class="field"><label for="geoCatLookup">Tipo de ocorrência</label><select id="geoCatLookup"><option value="">Selecione para ver roteamento sugerido</option>${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select></div><button class="btn primary" type="submit">Consultar território</button></form><div id="geoLookupResult" class="geoLookupOutput"><p class="muted">Digite um bairro para iniciar.</p></div></div></div>`;
  const boundary=document.querySelector('#geoBoundarySection');if(boundary)boundary.insertAdjacentElement('afterend',section);else app.appendChild(section);
  const form=section.querySelector('#geoLookupForm'),input=section.querySelector('#geoBairroLookup'),cat=section.querySelector('#geoCatLookup'),out=section.querySelector('#geoLookupResult');
  const show=()=>{if(!input.value.trim()){out.innerHTML='<p class="muted">Digite um bairro para iniciar.</p>';return}out.innerHTML=lookupResult(input.value.trim(),d)+(cat.value?`<div class="lookupRouting"><span>Encaminhamento sugerido do protótipo</span><b>${esc(routingFor(cat.value,d))}</b><small>Não representa encaminhamento oficial do Município.</small></div>`:'')};
  form.addEventListener('submit',e=>{e.preventDefault();show()});input.addEventListener('input',show);cat.addEventListener('change',show);
}

function renderOfficialLayers(d){
  if(route()!=='piracicaba'||document.querySelector('#officialLayers'))return;
  const app=document.querySelector('#app');if(!app||!app.querySelector('.geoHead'))return;
  const layers=d.officialMapLayers||[];
  const section=document.createElement('section');section.id='officialLayers';section.className='section';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Camadas geográficas oficiais disponíveis</h2><p class="muted">Catálogo de temas publicados pelo Município que podem orientar futuras integrações cartográficas.</p></div><div class="split"><a class="btn secondary" href="${OFFICIAL_MAPS}" target="_blank" rel="noopener noreferrer">Mapas do Município ↗</a><a class="btn secondary" href="${OFFICIAL_GEO}" target="_blank" rel="noopener noreferrer">Geoprocessamento novo ↗</a></div></div><div class="geoLayerGrid">${layers.map(x=>`<article class="card geoLayer"><span class="icon">${esc(x.icon)}</span><div><b>${esc(x.name)}</b><p class="small muted">${esc(x.group)}</p></div></article>`).join('')}</div><div class="notice" style="margin-top:16px">🗺️ As referências acima não são copiadas como polígonos no Cidade Conecta. O sistema só exibirá uma camada quando houver fonte vetorial apropriada e a origem estiver identificada.</div></div>`;
  app.appendChild(section);
}
function renderRoutingTable(d){
  if(route()!=='piracicaba'||document.querySelector('#routingReference'))return;
  const app=document.querySelector('#app');if(!app||!app.querySelector('.geoHead'))return;
  const section=document.createElement('section');section.id='routingReference';section.className='section sectionSoft';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Triagem sugerida por categoria</h2><p class="muted">Uma regra de organização para o protótipo. A Prefeitura poderá definir o fluxo real caso exista parceria futura.</p></div></div><div class="card tableWrap"><table class="routingTable"><thead><tr><th>Categoria</th><th>Área sugerida no protótipo</th><th>Uso</th></tr></thead><tbody>${Object.entries(CATS).map(([k,v])=>`<tr><td><b>${esc(v)}</b></td><td>${esc(routingFor(k,d))}</td><td><span class="mini">Sugestão de triagem</span></td></tr>`).join('')}</tbody></table></div></div>`;
  app.appendChild(section);
}

function regionStats(d){
  const occ=readOccurrences();
  return(d.administrativeRegions||[]).map(r=>{
    const list=occ.filter(o=>occurrenceRegion(o,d).some(x=>x.id===r.id));
    const count=list.length,per10k=r.population?count/r.population*10000:0;
    return{r,count,per10k};
  });
}
function renderDashboardRates(d){
  if(route()!=='dashboard'||document.querySelector('#geoRates'))return;
  const app=document.querySelector('#app');if(!app)return;
  const stats=regionStats(d),max=Math.max(1,...stats.map(x=>x.per10k));
  const section=document.createElement('section');section.id='geoRates';section.className='section sectionSoft';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Taxa demonstrativa por região</h2><p class="muted">Ocorrências salvas neste navegador por 10 mil habitantes da população de referência de cada região. Com poucos registros, esta taxa serve apenas para demonstrar a metodologia.</p></div><a class="btn secondary" href="#/piracicaba">Explorar território</a></div><div class="card rateChart">${stats.map(x=>`<div class="rateRow"><span>R${x.r.id}</span><div><b>${x.count} ocorrência(s)</b><div class="territoryTrack"><i style="width:${Math.round(x.per10k/max*100)}%"></i></div></div><strong>${nf(x.per10k,2)}/10 mil</strong></div>`).join('')}</div></div>`;
  app.appendChild(section);
}
function renderMapTerritory(d){
  if(route()!=='mapa'||document.querySelector('#mapTerritorySummary'))return;
  const card=document.querySelector('#publicMap')?.closest('.card');if(!card)return;
  const stats=regionStats(d),known=stats.reduce((s,x)=>s+x.count,0),total=readOccurrences().length;
  const box=document.createElement('div');box.id='mapTerritorySummary';box.className='mapTerritorySummary';
  box.innerHTML=`<div><span class="geoAdvisorLabel">Leitura territorial</span><b>${known} de ${total} registros reconhecidos por região</b><small>Classificação calculada pelo nome do bairro.</small></div><div class="regionMiniGrid">${stats.map(x=>`<span title="Região ${x.r.id}">R${x.r.id}<b>${x.count}</b></span>`).join('')}</div><a class="btn soft smallBtn" href="#/piracicaba">Ver geografia</a>`;
  const filters=card.querySelector('.filters');if(filters)filters.insertAdjacentElement('beforebegin',box);else card.prepend(box);
}
function renderAdminHint(d){
  if(route()!=='admin'||document.querySelector('#adminGeoHint'))return;
  const form=document.querySelector('#adminUpdate');if(!form)return;
  const p=document.querySelector('#adminProtocol')?.value,o=readOccurrences().find(x=>x.protocol===p);if(!o)return;
  const regs=occurrenceRegion(o,d),box=document.createElement('div');box.id='adminGeoHint';box.className='adminGeoHint';
  box.innerHTML=`<span class="geoAdvisorLabel">Contexto territorial</span><b>${regs.length===1?'Região '+regs[0].id:regs.length>1?'Regiões '+regs.map(r=>r.id).join(' / '):'Região não identificada'} · Piracicaba/SP</b><small>Triagem sugerida: ${esc(routingFor(o.category,d))}</small>`;
  form.querySelector('h2')?.insertAdjacentElement('afterend',box);
}

function destroyBoundaryIfNeeded(){if(route()!=='piracicaba'&&boundaryMap){boundaryMap.remove();boundaryMap=null}}
async function enhance(){
  queued=false;const d=await data();if(!d)return;destroyBoundaryIfNeeded();
  ensureDatalist(d);
  if(route()==='piracicaba'){
    renderBoundarySection(d);renderLookup(d);renderOfficialLayers(d);renderRoutingTable(d);
    document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active',a.dataset.route==='piracicaba'));
  }
  enhanceOccurrence(d);renderDashboardRates(d);renderMapTerritory(d);renderAdminHint(d);
}
function schedule(){if(queued)return;queued=true;setTimeout(enhance,80)}
const observer=new MutationObserver(schedule);
window.addEventListener('DOMContentLoaded',()=>{const app=document.querySelector('#app');if(app)observer.observe(app,{childList:true,subtree:true});schedule()});
window.addEventListener('hashchange',schedule);
})();
