(()=>{
'use strict';
const DATA_URL='data/piracicaba.json';
let dataCache=null;
const route=()=>location.hash.replace(/^#\/?/,'').split('/')[0];
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function data(){
  if(dataCache)return dataCache;
  try{const r=await fetch(DATA_URL,{cache:'no-cache'});if(!r.ok)return null;dataCache=await r.json();return dataCache}catch{return null}
}
async function render(){
  if(route()!=='piracicaba'||document.querySelector('#officialLayers'))return;
  const app=document.querySelector('#app');if(!app)return;
  const d=await data();if(!d||route()!=='piracicaba'||document.querySelector('#officialLayers'))return;
  const layers=d.officialMapLayers||[];
  if(!layers.length)return;
  const section=document.createElement('section');
  section.id='officialLayers';section.className='section';
  section.innerHTML=`<div class="wrap"><div class="titleRow"><div><h2>Camadas geográficas disponíveis na Prefeitura</h2><p class="muted">Temas que podem orientar uma evolução futura do mapa do Cidade Conecta. Por enquanto, o protótipo apenas referencia essas bases; ele não copia nem afirma representar os limites oficiais.</p></div><a class="btn secondary" href="https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/" target="_blank" rel="noopener noreferrer">Abrir Mapas do Município ↗</a></div><div class="grid3">${layers.map(x=>`<article class="card callout"><span class="icon">${esc(x.icon)}</span><div><b>${esc(x.name)}</b><p class="small muted">${esc(x.group)}</p></div></article>`).join('')}</div><div class="notice" style="margin-top:16px">🗺️ Próxima evolução técnica: quando houver uma fonte geográfica adequada para consumo pela aplicação, esses temas poderão virar camadas reais no mapa — por exemplo bairros, risco de enchentes, zoneamento e equipamentos públicos.</div></div>`;
  const sources=app.querySelector('.geoSources');
  if(sources?.parentElement?.parentElement) sources.parentElement.parentElement.insertAdjacentElement('beforebegin',section);
  else app.appendChild(section);
}
function schedule(){setTimeout(render,80)}
const observer=new MutationObserver(schedule);
window.addEventListener('DOMContentLoaded',()=>{const app=document.querySelector('#app');if(app)observer.observe(app,{childList:true});schedule()});
window.addEventListener('hashchange',schedule);
})();
