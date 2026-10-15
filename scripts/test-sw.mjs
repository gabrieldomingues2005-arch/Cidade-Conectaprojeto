import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
function harness(){
 const handlers={},deleted=[],writes=[],lookups=[];let core;
 const current={addAll:async list=>{core=list},match:async(...args)=>{lookups.push(args);return 'current-cache'},put:async(...args)=>writes.push(args)};
 const context={self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},location:{origin:'https://local.invalid'},URL,caches:{open:async()=>current,keys:async()=>['cidade-conecta-old','unrelated'],delete:async key=>deleted.push(key)},fetch:async()=>{throw new Error('offline')}};
 vm.runInNewContext(source,context);
 return {handlers,deleted,writes,lookups,getCore:()=>core};
}
test('installation precaches auth assets and versioned shell',async()=>{const h=harness();let p;h.handlers.install({waitUntil:x=>p=x});await p;assert.ok(h.getCore().includes('./assets/auth.js'));assert.ok(h.getCore().includes('./assets/app.js'));assert.ok(h.getCore().includes('./index.html'))});
test('activation removes old project caches and preserves unrelated caches',async()=>{const h=harness();let p;h.handlers.activate({waitUntil:x=>p=x});await p;assert.deepEqual(h.deleted,['cidade-conecta-old'])});
for(const url of ['https://backend.invalid/auth/v1/user','https://backend.invalid/functions/v1/admin-occurrences'])test(`external private response never cached: ${url}`,()=>{const h=harness();let intercepted=false;h.handlers.fetch({request:{method:'GET',url},respondWith:()=>intercepted=true});assert.equal(intercepted,false)});
test('POST never intercepted',()=>{const h=harness();let intercepted=false;h.handlers.fetch({request:{method:'POST',url:'https://local.invalid/api'},respondWith:()=>intercepted=true});assert.equal(intercepted,false)});
test('offline navigation falls back to current cache only',async()=>{const h=harness();let p;h.handlers.fetch({request:{method:'GET',url:'https://local.invalid/index.html',mode:'navigate'},respondWith:x=>p=x});assert.equal(await p,'current-cache');assert.equal(h.lookups[0][0],'./index.html')});
test('query versioned auth asset resolves inside current cache',async()=>{const h=harness();let p;h.handlers.fetch({request:{method:'GET',url:'https://local.invalid/assets/auth.js?v=new',mode:'cors'},respondWith:x=>p=x});assert.equal(await p,'current-cache');assert.equal(h.lookups[0][1].ignoreSearch,true)});
