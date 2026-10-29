// Verificação HTTP somente leitura; execução manual, fora do CI offline.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../assets/runtime-config.js',import.meta.url),'utf8'),context);
const sb=context.window.CIDADE_CONECTA_CONFIG.supabase;
assert.equal(sb.projectRef,'qzpofoxxrjunyayczcfu','Projeto de integração deve ser o Cidade Conecta v2');
assert.equal(new URL(sb.url).hostname,`${sb.projectRef}.supabase.co`);
const headers={apikey:sb.publishableKey,Authorization:`Bearer ${sb.legacyAnonJwt}`,Accept:'application/json'};
const checks=[];
async function request(path,options={}){
 const response=await fetch(sb.url+path,{headers,cache:'no-store',signal:AbortSignal.timeout(15000),...options});
 const body=await response.json().catch(()=>null);
 return {response,body};
}
async function check(label,fn){try{const details=await fn();checks.push({label,status:'PASS',...details});console.log(`✓ ${label}: ${JSON.stringify(details)}`)}catch(error){checks.push({label,status:'FAIL',error:String(error.message)});console.error(`✖ ${label}: ${error.message}`)}}
await check('Município oficial',async()=>{const {response,body}=await request('/rest/v1/municipalities?select=ibge_code,name&ibge_code=eq.3538709');assert.equal(response.status,200);assert.equal(body.length,1);assert.equal(String(body[0].ibge_code),'3538709');return {http:response.status,name:body[0].name}});
for(const [table,query] of [['categories','select=slug,name&active=eq.true'],['administrative_regions','select=id'],['neighborhoods','select=id']]){
 await check(`Base pública ${table}`,async()=>{const {response,body}=await request(`/rest/v1/${table}?${query}`);assert.equal(response.status,200);assert.ok(Array.isArray(body)&&body.length>0);return {http:response.status,count:body.length}});
}
await check('Contrato da listagem pública',async()=>{const query='select=protocol,title,description,neighborhood_label,public_location,public_latitude,public_longitude,status,responsible_agency,moderation_status,territory_resolution_status,created_at,updated_at,resolved_at,categories(slug,name)&public_visible=eq.true&moderation_status=eq.approved&limit=1';const {response,body}=await request('/rest/v1/occurrences?'+query);assert.equal(response.status,200);assert.ok(Array.isArray(body));assert.ok(body.every(o=>o.moderation_status==='approved'));return {http:response.status,sampleSize:body.length}});
for(const table of ['users_profile','occurrence_private_location','occurrence_contacts','audit_log'])await check(`Privado bloqueado: ${table}`,async()=>{const {response}=await request(`/rest/v1/${table}?select=*&limit=0`);assert.ok([401,403].includes(response.status),`Acesso anônimo inesperado: HTTP ${response.status}`);return {http:response.status}});
await check('Admin exige sessão real',async()=>{const {response}=await request('/functions/v1/admin-occurrences',{method:'POST',headers:{apikey:sb.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({action:'session'})});assert.equal(response.status,401);return {http:response.status}});
for(const name of [sb.submitFunction,sb.trackFunction])await check(`CORS ${name}`,async()=>{const response=await fetch(sb.url+'/functions/v1/'+name,{method:'OPTIONS',headers:{Origin:'https://gabrieldomingues2005-arch.github.io','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,authorization,content-type'},signal:AbortSignal.timeout(15000)});assert.ok(response.ok);assert.equal(response.headers.get('access-control-allow-origin'),'https://gabrieldomingues2005-arch.github.io');return {http:response.status}});
console.log(JSON.stringify({project:sb.projectRef,checkedAt:new Date().toISOString(),checks},null,2));
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
