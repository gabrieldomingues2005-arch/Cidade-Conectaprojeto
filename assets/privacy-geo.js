(()=>{
'use strict';
const STORAGE_KEY='cidadeConecta2026v3';
const MUNICIPALITY_IBGE='3538709';
const PUBLIC_DECIMALS=3;
let pendingSubmit=false;

const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const roundPublic=v=>Number.isFinite(Number(v))?Number(Number(v).toFixed(PUBLIC_DECIMALS)):null;

function regionMatches(bairro,data){
  if(!bairro||!data)return[];
  const q=norm(bairro),matches=[];
  for(const r of data.administrativeRegions||[]){
    for(const raw of r.neighborhoods||[]){
      const vals=[raw,raw.replace(/^Parte do /i,'')].map(norm);
      if(vals.includes(q)){
        matches.push(r.id);
        break;
      }
    }
  }
  return [...new Set(matches)];
}
function loadDb(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function saveDb(db){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));return true}catch{return false}}

function protectLatestOccurrence(){
  pendingSubmit=false;
  const db=loadDb();
  if(!db||!Array.isArray(db.occurrences)||!db.occurrences.length)return;
  const now=Date.now();
  const candidates=db.occurrences
    .filter(o=>o?.localOwner&&o?.created&&Math.abs(now-new Date(o.created).getTime())<15000)
    .sort((a,b)=>new Date(b.created)-new Date(a.created));
  const o=candidates[0];if(!o||o.geoPrivacyVersion||o.cloudOrigin)return;

  const exactLat=Number(o.lat),exactLng=Number(o.lng);
  o.privateData=o.privateData&&typeof o.privateData==='object'?o.privateData:{};
  if(Number.isFinite(exactLat)&&Number.isFinite(exactLng)){
    o.privateData.exactLocation={
      latitude:exactLat,
      longitude:exactLng,
      visibility:'private-local-legacy'
    };
    o.lat=roundPublic(exactLat);
    o.lng=roundPublic(exactLng);
    o.publicLocationPrecision='approximate-3-decimals';
  }

  const data=window.CidadeConectaPiracicaba;
  o.municipality={name:'Piracicaba',state:'SP',ibgeCode:MUNICIPALITY_IBGE};
  if(data){
    const matches=regionMatches(o.bairro,data);
    if(matches.length===1){o.regionId=matches[0];o.territoryResolutionStatus='name-match'}
    else if(matches.length>1){delete o.regionId;o.territoryResolutionStatus='ambiguous';o.regionCandidates=matches}
    else{o.territoryResolutionStatus='unresolved'}
    o.suggestedAgency=data.suggestedRouting?.[o.category]||'Triagem de atendimento / 156';
  }
  o.geoPrivacyVersion='1.0';
  saveDb(db);
}

function addPrivacyNotice(){
  if(location.hash.replace(/^#\/?/,'').split('/')[0]!=='registrar')return;
  const coord=document.querySelector('#coordText');
  if(!coord||document.querySelector('#geoPrivacyNotice'))return;
  const note=document.createElement('div');
  note.id='geoPrivacyNotice';note.className='geoPrivacyNotice';
  note.innerHTML='<span>🛡️</span><div><b>Privacidade de localização</b><small>No registro local, a posição escolhida é preservada como dado privado e o mapa público usa uma coordenada aproximada. Em produção, a separação deverá ocorrer no backend.</small></div>';
  coord.closest('.field')?.appendChild(note);
}

function watchForm(){
  const form=document.querySelector('#occForm');
  if(form&&!form.dataset.geoPrivacyBound){
    form.dataset.geoPrivacyBound='1';
    form.addEventListener('submit',()=>{
      if(pendingSubmit)return;
      pendingSubmit=true;
      setTimeout(protectLatestOccurrence,0);
    },true);
  }
  addPrivacyNotice();
}

const observer=new MutationObserver(()=>watchForm());
window.addEventListener('DOMContentLoaded',()=>{
  const app=document.querySelector('#app');if(app)observer.observe(app,{childList:true,subtree:true});
  watchForm();
});
window.addEventListener('hashchange',()=>setTimeout(watchForm,0));
})();
