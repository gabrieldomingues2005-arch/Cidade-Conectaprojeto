// Read-only/live QA against the single official backend. Never prints API keys.
import vm from 'node:vm';
import fs from 'node:fs';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('assets/runtime-config.js','utf8'),ctx);
const s=ctx.window.CIDADE_CONECTA_CONFIG.supabase;
if(s.projectRef!=='qzpofoxxrjunyayczcfu'||s.url!=='https://qzpofoxxrjunyayczcfu.supabase.co')throw Error('Wrong project');
const headers={apikey:s.publishableKey,Authorization:'Bearer '+s.legacyAnonJwt,'Content-Type':'application/json'};
const body={action:'read',protocol:'CC-2026-01002',deviceKey:'a'.repeat(64)};
const tests=[
 ['community leitura pública com chave publishable','/functions/v1/community-actions',{method:'POST',headers:{apikey:s.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)},[404]],
 ['community registro não publicado','/functions/v1/community-actions',{method:'POST',headers,body:JSON.stringify(body)},[404]],
 ['community protocolo inválido','/functions/v1/community-actions',{method:'POST',headers,body:JSON.stringify({...body,protocol:'invalid'})},[400]],
 ['community array recusado','/functions/v1/community-actions',{method:'POST',headers,body:'[]'},[400]],
 ['community origem recusada','/functions/v1/community-actions',{method:'POST',headers:{...headers,Origin:'https://invalid.example'},body:JSON.stringify(body)},[403]],
 ['RPC interno negado anon','/rest/v1/rpc/community_participation_internal',{method:'POST',headers,body:JSON.stringify({p_action:'read',p_protocol:body.protocol,p_device_hash:'a'.repeat(64),p_fingerprint_hash:'b'.repeat(64)})},[401,403]],
 ['Admin negado anon','/functions/v1/admin-occurrences',{method:'POST',headers,body:JSON.stringify({action:'list'})},[401,403]],
 ...['occurrence_private_location','users_profile','audit_log'].map(name=>['anon não lê '+name,'/rest/v1/'+name+'?select=*',{headers},[401,403]])
];
const results=[];
for(const [name,path,options,expected]of tests){const r=await fetch(s.url+path,{...options,signal:AbortSignal.timeout(15000)});results.push({name,status:r.status,result:expected.includes(r.status)?'PASS':'FAIL'});await r.text()}
fs.mkdirSync('artifacts/qa-evolution',{recursive:true});
fs.writeFileSync('artifacts/qa-evolution/backend-http.json',JSON.stringify({at:new Date().toISOString(),project:s.projectRef,results},null,2));
console.log(JSON.stringify(results));if(results.some(x=>x.result==='FAIL'))process.exitCode=1;
