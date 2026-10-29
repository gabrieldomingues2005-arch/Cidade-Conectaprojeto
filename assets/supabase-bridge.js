(()=>{
'use strict';
const cfg=window.CIDADE_CONECTA_CONFIG||{};
const sb=cfg.supabase||{};
const REQUEST_TIMEOUT_MS=12000;
let healthPromise=null;
const state={configured:false,connected:false,writeReady:false,lastError:null,lastCheckedAt:null,details:{municipality:null,categoriesCount:null,regionsCount:null,neighborhoodsCount:null,activeOccurrencesCount:null,readLatencyMs:null}};
function configured(){return Boolean(sb.enabled&&sb.url&&sb.publishableKey)}
function bearer(){return sb.legacyAnonJwt||''}
function headers(extra={}){const out={'apikey':sb.publishableKey,'Accept':'application/json',...extra};if(bearer())out.Authorization=`Bearer ${bearer()}`;return out}
async function parseResponse(response){let payload=null;try{payload=await response.json()}catch(error){if(error?.name==='AbortError')throw error;if(response.ok)throw new Error('Resposta inválida do serviço.')}if(response.ok)return payload;const message=payload?.message||payload?.error||payload?.hint||`Supabase HTTP ${response.status}`;const error=new Error(String(message));error.status=response.status;error.payload=payload;throw error}
// Mantém o limite até o corpo terminar. Escrita nunca é repetida automaticamente.
async function request(path,options={},parse=parseResponse){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
 try{
  const response=await fetch(`${sb.url}${path}`,{...options,cache:'no-store',signal:controller.signal});
  return await parse(response);
 }catch(error){
  if(error?.name==='AbortError'){const timeout=new Error('Tempo limite de comunicação excedido.');timeout.code='request_timeout';timeout.status=0;throw timeout}
  throw error;
 }finally{clearTimeout(timer)}
}
async function select(table,query='select=*',extraHeaders={}){if(!configured())throw new Error('Supabase não configurado');return request(`/rest/v1/${encodeURIComponent(table)}?${query}`,{headers:headers(extraHeaders)})}
async function invokeFunction(name,payload={}){if(!configured())throw new Error('Supabase não configurado');if(!name)throw new Error('Edge Function não configurada');return request(`/functions/v1/${encodeURIComponent(name)}`,{method:'POST',headers:headers({'Content-Type':'application/json'}),body:JSON.stringify(payload)})}
async function countTable(table,query='select=id'){
 if(!configured())return null;
 try{return await request(`/rest/v1/${encodeURIComponent(table)}?${query}`,{headers:headers({'Range-Unit':'items','Range':'0-0','Prefer':'count=exact'})},response=>{
  if(!response.ok)return null;
  const total=(response.headers.get('content-range')||'').split('/')[1];
  return total&&/^\d+$/.test(total)?Number(total):null;
 })}catch{return null}
}
async function submitOccurrence(payload){if(!sb.submitFunction)throw new Error('Endpoint de envio não configurado');return invokeFunction(sb.submitFunction,payload)}
async function trackOccurrence(protocol,trackingKey=null){if(!sb.trackFunction)throw new Error('Endpoint de acompanhamento não configurado');const payload=await invokeFunction(sb.trackFunction,{protocol:String(protocol||'').trim().toUpperCase(),trackingKey:trackingKey||null});return payload?.occurrence||null}
async function listPublicOccurrences(limit=200){const safeLimit=Math.min(500,Math.max(1,Math.trunc(Number(limit)||200)));return select('occurrences',['select=protocol,title,description,neighborhood_label,public_location,public_latitude,public_longitude,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,resolved_at,categories(slug,name)','public_visible=eq.true','moderation_status=eq.approved','order=created_at.desc',`limit=${safeLimit}`].join('&'))}
async function checkHealth(){
 state.configured=configured();state.lastCheckedAt=new Date().toISOString();state.writeReady=false;
 state.details={municipality:null,categoriesCount:null,regionsCount:null,neighborhoodsCount:null,activeOccurrencesCount:null,readLatencyMs:null};
 if(!state.configured){state.connected=false;state.lastError='not-configured';emit();return false}
 const t0=performance.now();
 try{
  const rows=await select('municipalities','select=ibge_code,name&ibge_code=eq.3538709&limit=1');
  const ok=Array.isArray(rows)&&rows.length===1&&String(rows[0]?.ibge_code)==='3538709';
  state.connected=ok;
  // Prontidão de configuração; a disponibilidade das funções é confirmada em cada operação.
  state.writeReady=ok&&cfg.dataMode==='hybrid-write'&&Boolean(sb.submitFunction&&sb.trackFunction&&bearer());
  state.lastError=ok?null:'municipality-not-found';
  if(ok){
   state.details.municipality=rows[0].name||'Piracicaba';state.details.readLatencyMs=Math.round(performance.now()-t0);
   emit();
   const counts=await Promise.all([countTable('categories','select=id&active=eq.true'),countTable('administrative_regions','select=id'),countTable('neighborhoods','select=id'),countTable('occurrences','select=id&public_visible=eq.true&moderation_status=eq.approved')]);
   [state.details.categoriesCount,state.details.regionsCount,state.details.neighborhoodsCount,state.details.activeOccurrencesCount]=counts;
  }
 }catch(error){state.connected=false;state.writeReady=false;state.lastError=String(error?.message||error)}
 emit();return state.connected;
}
function health(){if(!healthPromise)healthPromise=checkHealth().finally(()=>{healthPromise=null});return healthPromise}
function emit(){window.dispatchEvent(new CustomEvent('cidadeconecta:supabase-status',{detail:{...state,details:{...state.details}}}))}
window.CidadeConectaSupabase=Object.freeze({state,health,select,invokeFunction,countTable,submitOccurrence,trackOccurrence,listPublicOccurrences});
window.addEventListener('DOMContentLoaded',()=>health());
})();
