import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../assets/supabase-bridge.js',import.meta.url),'utf8');
function fixture({fail=false,timeout=false,bodyTimeout=false,missingCount=false,noLegacy=false}={}){
 const calls=[];
 const ctx={window:{CIDADE_CONECTA_CONFIG:{dataMode:'hybrid-write',supabase:{enabled:true,url:'https://example.invalid',publishableKey:'public-key',legacyAnonJwt:noLegacy?'':'anon-jwt',submitFunction:'submit-occurrence',trackFunction:'track-occurrence'}},addEventListener(){},dispatchEvent(){}},CustomEvent:class{},AbortController,performance,clearTimeout,setTimeout:fn=>setTimeout(fn,10),fetch:async(url,options)=>{calls.push({url,options});if(fail)throw new TypeError('offline');if(timeout)return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(new Error('timeout'),{name:'AbortError'}))));if(bodyTimeout)return {ok:true,json:()=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(new Error('body timeout'),{name:'AbortError'}))))};return new Response(JSON.stringify(url.includes('municipalities')?[{ibge_code:'3538709',name:'Piracicaba'}]:[]),{status:200,headers:missingCount?{}:{'content-range':'0-0/9'}})}};
 vm.runInNewContext(source,ctx);return {api:ctx.window.CidadeConectaSupabase,calls};
}
test('concurrent health checks share request and confirm city',async()=>{const {api,calls}=fixture();const a=api.health(),b=api.health();assert.equal(a,b);assert.equal(await a,true);assert.equal(calls.length,5);assert.equal(api.state.details.categoriesCount,9);assert.equal(api.state.connected,true)});
test('health failure becomes disconnected',async()=>{const {api}=fixture({fail:true});assert.equal(await api.health(),false);assert.equal(api.state.writeReady,false)});
for(const options of [{timeout:true},{bodyTimeout:true}])test(`timeout covers request and body: ${JSON.stringify(options)}`,async()=>{const {api}=fixture(options);await assert.rejects(api.select('municipalities'),error=>error.code==='request_timeout')});
test('failed counts are unknown, never false zero',async()=>{const {api}=fixture({missingCount:true});assert.equal(await api.countTable('categories'),null)});
test('submission is never automatically retried',async()=>{const {api,calls}=fixture({fail:true});await assert.rejects(api.submitOccurrence({title:'test'}));assert.equal(calls.length,1);assert.equal(calls[0].options.method,'POST')});
test('publishable key is never substituted for JWT',async()=>{const {api,calls}=fixture({noLegacy:true});await api.select('categories');assert.equal(calls[0].options.headers.Authorization,undefined);assert.equal(calls[0].options.cache,'no-store')});
test('public list is approved only with bounded integer limit',async()=>{const {api,calls}=fixture();await api.listPublicOccurrences(999.9);assert.match(calls[0].url,/moderation_status=eq.approved/);assert.match(calls[0].url,/limit=500/)});
