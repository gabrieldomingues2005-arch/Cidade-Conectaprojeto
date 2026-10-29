import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const functions=source.slice(source.indexOf('function remoteToOccurrence('),source.indexOf('function publicExportOccurrence('));
function fixture(rows){
 const demo={protocol:'CC-2026-00001',title:'Demonstração'},old={protocol:'CC-2026-01001',cloudOrigin:true,moderationStatus:'approved'},own={protocol:'CC-2026-01002',cloudOrigin:true,moderationStatus:'pending',localOwner:true,privateData:{trackingKey:'private-test'}};
 const context={db:{occurrences:[demo,old,own]},window:{},console:{warn(){}},coordinate:value=>value==null||String(value).trim()===''?null:Number.isFinite(Number(value))?Number(value):null,saveDB(){},cloudApi:()=>({state:{connected:true},listPublicOccurrences:async()=>{if(rows instanceof Error)throw rows;return rows}})};
 vm.createContext(context);vm.runInContext('let cloudPublicProtocols=null;\n'+functions,context);return context;
}
test('offline fallback keeps demo and hides pending records',()=>{const c=fixture([]);assert.equal(c.publicMetricRecords().length,2)});
test('successful empty backend replaces demo metrics while preserving own tracking',async()=>{const c=fixture([]);assert.equal(await c.syncPublicCloudOccurrences(),true);assert.equal(c.publicMetricRecords().length,0);assert.equal(c.db.occurrences.length,3);assert.equal(c.db.occurrences[2].privateData.trackingKey,'private-test')});
test('live dataset excludes demo and stale records no longer in public response',async()=>{const c=fixture([{protocol:'CC-2026-02000',title:'Real',moderation_status:'approved',public_latitude:null,public_longitude:null}]);await c.syncPublicCloudOccurrences();const rows=c.publicMetricRecords();assert.equal(rows.length,1);assert.equal(rows[0].protocol,'CC-2026-02000');assert.equal(rows[0].lat,null);assert.equal(rows[0].lng,null)});
test('pending response cannot enter public metrics',async()=>{const c=fixture([{protocol:'CC-2026-02001',moderation_status:'pending'}]);await c.syncPublicCloudOccurrences();assert.equal(c.publicMetricRecords().length,0)});
test('failed sync does not masquerade as an empty successful response',async()=>{const c=fixture(new Error('offline'));assert.equal(await c.syncPublicCloudOccurrences(),false);assert.equal(c.publicMetricRecords().length,2)});
test('real update retains owner tracking token',async()=>{const c=fixture([{protocol:'CC-2026-01002',moderation_status:'approved',title:'Approved'}]);await c.syncPublicCloudOccurrences();assert.equal(c.publicMetricRecords()[0].privateData.trackingKey,'private-test')});

for(const file of ['piracicaba.js','piracicaba-mapas.js'])test(`territorial public summary uses the same live dataset: ${file}`,()=>{
 const script=readFileSync(new URL('../assets/'+file,import.meta.url),'utf8');
 const start=script.indexOf('function readOccurrences('),end=script.indexOf(file==='piracicaba.js'?'function findRegion(':'function allNeighborhoods(',start);
 const c={window:{CidadeConectaPublicData:{records:()=>[]}},localStorage:{getItem:()=>JSON.stringify({occurrences:[{protocol:'demo'}]})},STORAGE_KEY:'test'};
 vm.runInNewContext(script.slice(start,end),c);assert.equal(c.readOccurrences(true).length,0);
});
