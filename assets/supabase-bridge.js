(()=>{
'use strict';
const cfg=window.CIDADE_CONECTA_CONFIG||{};
const sb=cfg.supabase||{};
const state={configured:false,connected:false,lastError:null,lastCheckedAt:null};

function configured(){return Boolean(sb.enabled&&sb.url&&sb.publishableKey)}
function headers(){return {'apikey':sb.publishableKey,'Authorization':`Bearer ${sb.publishableKey}`,'Accept':'application/json'}}
async function select(table,query='select=*'){
  if(!configured())throw new Error('Supabase não configurado');
  const response=await fetch(`${sb.url}/rest/v1/${encodeURIComponent(table)}?${query}`,{headers:headers()});
  if(!response.ok)throw new Error(`Supabase HTTP ${response.status}`);
  return response.json();
}
async function health(){
  state.configured=configured();
  state.lastCheckedAt=new Date().toISOString();
  if(!state.configured){state.connected=false;state.lastError='not-configured';emit();return false}
  try{
    const rows=await select('municipalities','select=ibge_code,name&ibge_code=eq.3538709&limit=1');
    state.connected=Array.isArray(rows)&&rows.length===1;
    state.lastError=state.connected?null:'municipality-not-found';
  }catch(error){state.connected=false;state.lastError=String(error?.message||error)}
  emit();
  return state.connected;
}
function emit(){window.dispatchEvent(new CustomEvent('cidadeconecta:supabase-status',{detail:{...state}}))}
window.CidadeConectaSupabase=Object.freeze({state,health,select});
window.addEventListener('DOMContentLoaded',()=>health());
})();
