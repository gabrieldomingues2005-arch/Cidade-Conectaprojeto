(()=>{
'use strict';
const APP='#app';
const official={
  prefeitura:'https://piracicaba.sp.gov.br/',
  atendimento:'https://sistemas.pmp.sp.gov.br/semad/protocolo/atendimento156/',
  geo:'https://geo.piracicaba.sp.gov.br/'
};
function section(){
  const el=document.createElement('section');
  el.className='section cityContext';
  el.id='piraContext';
  el.innerHTML=`<div class="wrap"><div class="card cityIntro"><span class="cityLabel">📍 Piracicaba · São Paulo</span><h2>Feito para organizar ocorrências urbanas de Piracicaba</h2><p class="muted">O Cidade Conecta foi contextualizado para Piracicaba, com mapa centrado no município, registros por bairro e uma identidade visual inspirada nas cores usadas pela Prefeitura e pela bandeira da cidade.</p><div class="cityGrid"><div class="cityFeature"><span class="cityIcon">🏘️</span><b>Visão por bairro</b><span class="small muted">Organize e acompanhe problemas de regiões como Centro, Vila Rezende, Paulista, Santa Terezinha e demais bairros do município.</span></div><div class="cityFeature"><span class="cityIcon">🗺️</span><b>Mapa de Piracicaba</b><span class="small muted">As ocorrências podem ser localizadas no mapa para facilitar análise territorial e futuras ações comunitárias.</span></div><div class="cityFeature"><span class="cityIcon">📊</span><b>Indicadores locais</b><span class="small muted">Categorias, bairros e status ajudam a transformar relatos em informação organizada para apresentação do projeto.</span></div></div><div class="cityOfficial"><strong>Canais oficiais de Piracicaba</strong><div class="small muted">O Cidade Conecta é um projeto acadêmico independente. Para solicitações oficiais, utilize os serviços do Município.</div><div class="cityLinks"><a class="cityLink" href="${official.prefeitura}" target="_blank" rel="noopener noreferrer">🏛️ Portal da Prefeitura</a><a class="cityLink" href="${official.atendimento}" target="_blank" rel="noopener noreferrer">☎️ Atendimento 156</a><a class="cityLink" href="${official.geo}" target="_blank" rel="noopener noreferrer">🧭 Geoprocessamento</a></div><div class="cityDisclaimer">Estes links levam a páginas oficiais externas. O Cidade Conecta não representa nem substitui a Prefeitura Municipal de Piracicaba.</div></div></div></div>`;
  return el;
}
function enhance(){
  const app=document.querySelector(APP);if(!app)return;
  const route=location.hash.replace(/^#\/?/,'').split('/')[0];
  if(route===''){
    const hero=app.querySelector('.hero');
    if(hero&&!document.querySelector('#piraContext')) hero.insertAdjacentElement('afterend',section());
  }
}
const observer=new MutationObserver(()=>enhance());
window.addEventListener('DOMContentLoaded',()=>{const app=document.querySelector(APP);if(app)observer.observe(app,{childList:true});enhance()});
window.addEventListener('hashchange',()=>setTimeout(enhance,0));
})();
