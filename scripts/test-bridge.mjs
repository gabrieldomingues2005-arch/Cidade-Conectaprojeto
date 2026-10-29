import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../assets/supabase-bridge.js',import.meta.url),'utf8');
function harness({mode='ok',legacy=true,dataMode='hybrid-write',enabled=true}={}){
 const calls=[];let current=mode;
 const context={window:{CIDADE_CONECTA_CONFIG:{dataMode,supabase:{enabled,url:'https://backend.invalid',publishableKey:'sb_publishable_test',legacyAnonJwt:legacy?'anon-jwt':'',submitFunction:'submit-occurrence',trackFunction:'track-occurrence'}},addEventListener(){},dispatchEvent(){}},
  fetch:async(url,options)=>{
   calls.push({url,options});
   if(current==='timeout')return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(new Error(),{name:'AbortError'}))));
   if(current==='network')throw new TypeError('network');
   if(current==='503')return new Response('{"error":"unavailable"}',{status:503});
   if(current==='body-timeout')return {ok:true,json:()=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(new Error(),{name:'AbortError'}))))};
   if(options.headers.Prefer)return new Response('[]',{headers:current==='missing-count'?{}:{'content-range':'0-0/9'}});
   return new Response(JSON.stringify(url.includes('/municipalities')?[{ibge_code:current==='wrong-city'?'1':'3538709',name:'Piracicaba'}]:[]));
  },AbortController,Response,CustomEvent:class{},performance,setTimeout:fn=>setTimeout(fn,20),clearTimeout};
 vm.runInNewContext(source,context);
 return {api:context.window.CidadeConectaSupabase,calls,setMode:mode=>current=mode};
}
test('public health validates Piracicaba and shares concurrent checks',async()=>{
 const h=harness();const [a,b]=await Promise.all([h.api.health(),h.api.health()]);
 assert.equal(a,true);assert.equal(b,true);assert.equal(h.api.state.writeReady,true);
 assert.equal(h.calls.filter(c=>c.url.includes('/municipalities')).length,1);
 assert.equal(h.api.state.details.categoriesCount,9);
});
test('a different municipality does not enable sending',async()=>{const h=harness({mode:'wrong-city'});assert.equal(await h.api.health(),false);assert.equal(h.api.state.writeReady,false)});
test('read-only config never enables sending',async()=>{const h=harness({dataMode:'hybrid-read'});await h.api.health();assert.equal(h.api.state.writeReady,false)});
test('unconfigured health does not request network',async()=>{const h=harness({enabled:false});assert.equal(await h.api.health(),false);assert.equal(h.calls.length,0)});
for(const mode of ['network','503','timeout'])test(`outage ${mode} resets stale health and recovers`,async()=>{
 const h=harness();await h.api.health();h.setMode(mode);assert.equal(await h.api.health(),false);
 assert.equal(h.api.state.writeReady,false);assert.equal(h.api.state.details.categoriesCount,null);
 h.setMode('ok');assert.equal(await h.api.health(),true);
});
test('timeout covers response body, not just headers',async()=>{
 const h=harness({mode:'body-timeout'});await assert.rejects(h.api.select('municipalities'),e=>e.code==='request_timeout');
});
test('all requests bypass HTTP cache; public keys never become bearer JWT',async()=>{
 const h=harness({legacy:false});await h.api.select('categories');
 assert.equal(h.calls[0].options.cache,'no-store');assert.equal(h.calls[0].options.headers.apikey,'sb_publishable_test');assert.equal(h.calls[0].options.headers.Authorization,undefined);
 await h.api.health();assert.equal(h.api.state.writeReady,false);
});
test('failed submission is sent once and preserves the HTTP error',async()=>{
 const h=harness({mode:'503'});await assert.rejects(h.api.submitOccurrence({title:'test'}),e=>e.status===503);assert.equal(h.calls.length,1);
});
test('unknown counts stay unknown, zero is never inferred',async()=>{const h=harness({mode:'missing-count'});assert.equal(await h.api.countTable('categories'),null)});
test('public list is restricted to approved visible records with bounded integer limit',async()=>{
 const h=harness();await h.api.listPublicOccurrences(9999);assert.match(h.calls[0].url,/public_visible=eq.true/);assert.match(h.calls[0].url,/moderation_status=eq.approved/);assert.match(h.calls[0].url,/limit=500$/);
});
