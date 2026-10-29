import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8').replace(/\}\)\(\);\s*$/, 'window.testUI={bindFollow,remoteToOccurrence,publicCoord,syncPublicCloudOccurrences,publicMetricRecords};})();');
function harness(api){
 const attrs={},form={},input={value:'CC-2026-01001'},box={innerHTML:'',isConnected:true,setAttribute:(k,v)=>attrs[k]=v};
 const context={window:{CidadeConectaSupabase:api,addEventListener(){}},document:{querySelector:s=>({'#followForm':form,'#followResult':box,'#protocolInput':input}[s]||null),querySelectorAll:()=>[]},localStorage:{getItem:()=>null},console:{warn(){}},structuredClone,matchMedia:()=>({matches:true}),setTimeout:()=>{},URL,URLSearchParams};
 vm.runInNewContext(source,context);context.window.testUI.bindFollow();
 return {ui:context.window.testUI,attrs,box,input,submit:()=>form.onsubmit({preventDefault(){}})};
}
for(const mode of ['disconnected','network','timeout','503'])test(`tracking ${mode} never claims a missing protocol`,async()=>{
 const api={state:{connected:mode!=='disconnected'},trackOccurrence:async()=>{throw new Error(mode)}};
 const h=harness(api);await h.submit();assert.match(h.box.innerHTML,/Consulta indisponível/);assert.doesNotMatch(h.box.innerHTML,/Protocolo não encontrado/);assert.equal(h.attrs['aria-busy'],'false');
});
test('successful empty tracking may report not found',async()=>{
 const h=harness({state:{connected:true},trackOccurrence:async()=>null});await h.submit();assert.match(h.box.innerHTML,/Protocolo não encontrado/);assert.doesNotMatch(h.box.innerHTML,/Consulta indisponível/);
});
test('local demo tracking works without backend',async()=>{
 const h=harness({state:{connected:false}});h.input.value='CC-2026-00001';await h.submit();assert.match(h.box.innerHTML,/Buraco grande/);assert.doesNotMatch(h.box.innerHTML,/Consulta indisponível/);
});
test('missing coordinates stay absent instead of adding a marker at zero',()=>{
 const h=harness(null);for(const value of [null,undefined,''])assert.equal(h.ui.publicCoord(value),null);
 const o=h.ui.remoteToOccurrence({protocol:'CC-2026-01001',public_latitude:null,public_longitude:null});assert.equal(o.lat,null);assert.equal(o.lng,null);assert.equal(h.ui.publicCoord(0),0);
});
test('earlier tracking response cannot replace the latest submitted result',async()=>{
 let finish;const h=harness({state:{connected:true},trackOccurrence:()=>new Promise(r=>finish=r)});
 const pending=h.submit();h.input.value='CC-2026-00001';await h.submit();finish(null);await pending;
 assert.match(h.box.innerHTML,/Buraco grande/);assert.doesNotMatch(h.box.innerHTML,/Protocolo não encontrado/);
});

test('healthy empty backend replaces demo metrics without deleting local protocols',async()=>{
 const h=harness({state:{connected:true},listPublicOccurrences:async()=>[]});
 assert.equal(h.ui.publicMetricRecords().length,4);
 assert.equal(await h.ui.syncPublicCloudOccurrences(),true);
 assert.equal(h.ui.publicMetricRecords().length,0);
 h.input.value='CC-2026-00001';await h.submit();assert.match(h.box.innerHTML,/Buraco grande/);
});
test('public refresh removes withdrawn records from every public metric',async()=>{
 let rows=[{protocol:'CC-2026-01001',moderation_status:'approved',public_latitude:-22.7,public_longitude:-47.6}];
 const h=harness({state:{connected:true},listPublicOccurrences:async()=>rows});
 await h.ui.syncPublicCloudOccurrences();assert.equal(h.ui.publicMetricRecords().length,1);
 rows=[];await h.ui.syncPublicCloudOccurrences();assert.equal(h.ui.publicMetricRecords().length,0);
});
