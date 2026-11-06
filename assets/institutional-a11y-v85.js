(()=>{'use strict';
const KEY='cidadeConectaA11yV1';
const root=document.documentElement;
const body=document.body;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
let state={scale:1,contrast:false};
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  if(Number.isFinite(saved.scale))state.scale=clamp(saved.scale,.875,1.25);
  state.contrast=saved.contrast===true;
}catch{}
function apply(announce=false){
  root.style.fontSize=(state.scale*100).toFixed(1)+'%';
  body.classList.toggle('cc-high-contrast-v85',state.contrast);
  document.querySelectorAll('[data-a11y="contrast"]').forEach(btn=>{
    btn.setAttribute('aria-pressed',String(state.contrast));
    btn.title=state.contrast?'Desativar alto contraste':'Ativar alto contraste';
  });
  document.querySelectorAll('[data-a11y-scale]').forEach(el=>el.textContent=Math.round(state.scale*100)+'%');
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  if(announce){
    const live=document.getElementById('a11yAnnouncerV85');
    if(live)live.textContent='Preferências de acessibilidade atualizadas: texto em '+Math.round(state.scale*100)+'%'+(state.contrast?', alto contraste ativado.':'.');
  }
}
function bind(){
  document.querySelectorAll('[data-a11y="decrease"]').forEach(btn=>btn.addEventListener('click',()=>{state.scale=clamp(Math.round((state.scale-.125)*1000)/1000,.875,1.25);apply(true)}));
  document.querySelectorAll('[data-a11y="increase"]').forEach(btn=>btn.addEventListener('click',()=>{state.scale=clamp(Math.round((state.scale+.125)*1000)/1000,.875,1.25);apply(true)}));
  document.querySelectorAll('[data-a11y="reset"]').forEach(btn=>btn.addEventListener('click',()=>{state.scale=1;state.contrast=false;apply(true)}));
  document.querySelectorAll('[data-a11y="contrast"]').forEach(btn=>btn.addEventListener('click',()=>{state.contrast=!state.contrast;apply(true)}));
}
apply(false);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();