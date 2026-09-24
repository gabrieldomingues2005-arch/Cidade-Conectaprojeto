(()=>{
'use strict';
const STORAGE_KEY='cidadeConecta2026v3';
const cfg=window.CIDADE_CONECTA_CONFIG||{};
const $=s=>document.querySelector(s);

function dataMode(){
  const sb=cfg.supabase||{};
  if(!(sb.enabled&&sb.url&&sb.publishableKey))return 'local';
  if(cfg.dataMode==='hybrid-write'){const st=window.CidadeConectaSupabase?.state||{};if(!st.connected)return 'configured';return st.writeReady?'hybrid-write':'hybrid-read'}
  if(cfg.dataMode==='hybrid-read')return window.CidadeConectaSupabase?.state?.connected?'hybrid-read':'configured';
  return 'cloud';
}
function statusText(){
  if(!navigator.onLine)return {label:'Offline',detail:'Aplicação em modo offline/cache local',cls:'offline'};
  const mode=dataMode();
  if(mode==='hybrid-write'){const latency=window.CidadeConectaSupabase?.state?.details?.readLatencyMs;return {label:'Supabase ativo'+(latency?' · '+latency+'ms':''),detail:'Leitura pública e envio seguro de ocorrências conectados ao backend do Cidade Conecta.',cls:'cloud'}};
  if(mode==='hybrid-read')return {label:'Supabase leitura',detail:'Backend conectado para leitura; escrita segura indisponível no momento.',cls:'cloud'};
  if(mode==='configured')return {label:'Supabase configurado',detail:'Backend configurado; aguardando confirmação da conexão',cls:'local'};
  if(mode==='cloud')return {label:'Banco conectado',detail:'Backend do Cidade Conecta configurado',cls:'cloud'};
  return {label:'Modo local',detail:'Dados demonstrativos neste navegador',cls:'local'};
}
function ensureStatus(){
  const header=$('.headerActions');
  if(!header||$('#systemStatus'))return;
  const el=document.createElement('button');
  el.id='systemStatus';
  el.type='button';
  el.className='systemStatus';
  el.setAttribute('aria-label','Status do sistema');
  header.insertBefore(el,header.firstChild);
  el.onclick=()=>{
    const s=statusText();
    const toast=$('#toast');
    if(toast){toast.textContent=s.detail;toast.classList.remove('hidden');setTimeout(()=>toast.classList.add('hidden'),4300)}
  };
  paintStatus();
}
function paintStatus(){
  const el=$('#systemStatus');if(!el)return;
  const s=statusText();
  el.className=`systemStatus ${s.cls}`;
  el.innerHTML=`<span class="systemDot"></span><span>${s.label}</span>`;
  el.title=s.detail;
}
function normalizeProtocolInput(input){
  if(!input||input.dataset.protocolFormatBound)return;
  input.dataset.protocolFormatBound='1';
  input.addEventListener('input',()=>{
    const raw=input.value.toUpperCase().replace(/[^A-Z0-9-]/g,'');
    input.value=raw.slice(0,18);
  });
}
function addTechnicalCard(){
  const route=location.hash.replace(/^#\/?/,'').split('/')[0];
  if(route!=='sobre'||$('#techStatusCard'))return;
  const wrap=$('#app .wrap.grid2');if(!wrap)return;
  const card=document.createElement('section');
  card.id='techStatusCard';card.className='card techStatusCard';
  const s=statusText();
  const mode=dataMode();
  const dataLabel=mode==='hybrid-write'?'Supabase (leitura + envio)':mode==='hybrid-read'?'Supabase (leitura)':s.label;
  card.innerHTML=`<h2>Estado técnico do protótipo</h2><div class="techGrid"><div><span>Versão</span><b>${cfg.appVersion||'5.3.0'}</b></div><div><span>Território</span><b>Piracicaba/SP</b></div><div><span>Dados</span><b>${dataLabel}</b></div><div><span>Conectividade</span><b>${navigator.onLine?'Online':'Offline'}</b></div></div><p class="small muted">O Supabase do Cidade Conecta é independente do Raiz Carbon. Novas ocorrências são enviadas por Edge Function segura, recebem token privado de acompanhamento e entram como pendentes de moderação.</p>`;
  wrap.insertAdjacentElement('afterend',card);
}
function addAdminReset(){
  const route=location.hash.replace(/^#\/?/,'').split('/')[0];
  if(route!=='admin'||$('#resetDemo'))return;
  const exit=$('#exitAdmin');if(!exit)return;
  const b=document.createElement('button');
  b.id='resetDemo';b.type='button';b.className='btn secondary smallBtn';b.textContent='Restaurar demo';
  exit.parentElement.insertBefore(b,exit);
  b.onclick=()=>{
    if(!confirm('Restaurar os dados demonstrativos deste navegador? Registros locais criados para teste serão removidos.'))return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('cidadeConectaDraftV4');
    location.reload();
  };
}
function addCopySiteLink(){
  const footer=$('footer .foot');if(!footer||$('#copySiteLink'))return;
  const b=document.createElement('button');
  b.id='copySiteLink';b.type='button';b.className='footerLinkButton';b.textContent='Copiar link do site';
  b.onclick=async()=>{
    const url=location.origin+location.pathname;
    try{await navigator.clipboard.writeText(url);const t=$('#toast');if(t){t.textContent='Link do site copiado.';t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2500)}}catch{}
  };
  footer.lastElementChild?.appendChild(b);
}
function keyboardShortcuts(e){
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    if(location.hash!=='#/')location.hash='#/';
    setTimeout(()=>$('#homeProtocol')?.focus(),100);
  }
  if(e.key==='Escape')$('#nav')?.classList.remove('open');
}
function enhancePage(){
  ensureStatus();
  paintStatus();
  normalizeProtocolInput($('#homeProtocol'));
  normalizeProtocolInput($('#protocolInput'));
  addTechnicalCard();
  addAdminReset();
  addCopySiteLink();
}
window.addEventListener('online',paintStatus);
window.addEventListener('offline',paintStatus);
window.addEventListener('cidadeconecta:supabase-status',()=>{paintStatus();document.querySelector('#techStatusCard')?.remove();setTimeout(addTechnicalCard,0)});
window.addEventListener('keydown',keyboardShortcuts);
window.addEventListener('hashchange',()=>setTimeout(enhancePage,30));
window.addEventListener('DOMContentLoaded',()=>{
  const app=$('#app');
  if(app)new MutationObserver(()=>setTimeout(enhancePage,0)).observe(app,{childList:true,subtree:true});
  enhancePage();
});
})();
