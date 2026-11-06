import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const css=read('assets/design-system.css');
// Testa a paleta padrão; overrides de prefers-contrast não podem mascará-la.
const rootTokens=css.match(/:root\s*\{([^}]+)\}/)[1];
const tokens=Object.fromEntries([...rootTokens.matchAll(/--cc6-([\w-]+):\s*(#[a-f\d]{6})[;\s]/gi)].map(m=>[m[1],m[2]]));
function luminance(hex){return hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const [x,y]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(x+.05)/(y+.05)}
for(const [fg,bg] of [['ink','surface'],['muted','surface'],['muted','soft'],['inverse','brand'],['accent-ink','accent'],['success','success-bg'],['warning','warning-bg'],['danger','danger-bg'],['info','info-bg'],['forward','forward-bg']])test(`text contrast ${fg}/${bg} >=4.5`,()=>assert.ok(contrast(tokens[fg],tokens[bg])>=4.5,`${fg}/${bg}: ${contrast(tokens[fg],tokens[bg]).toFixed(2)}`));
for(const [fg,bg] of [['border-strong','surface'],['border-strong','soft'],['focus','surface']])test(`control contrast ${fg}/${bg} >=3`,()=>assert.ok(contrast(tokens[fg],tokens[bg])>=3));
test('the exact versioned design assets are installed for first offline load',async()=>{
 const h={},context={self:{addEventListener:(n,f)=>h[n]=f,skipWaiting:async()=>{}},caches:{open:async()=>({addAll:async list=>{context.list=list}})}};
 vm.runInNewContext(read('sw.js'),context);let p;h.install({waitUntil:x=>p=x});await p;
 for(const m of read('index.html').matchAll(/(?:src|href)="(assets\/[^"?]+\?v=[^"]+)"/g))assert.ok(context.list.includes('./'+m[1]),m[1]);
});
const app=read('assets/app.js');
function appFixture(){
 const context={window:{addEventListener(){}},localStorage:{getItem:()=>null},structuredClone,document:{},console};
 vm.runInNewContext(app.replace(/\}\)\(\);\s*$/,'window.qaDesign={adminCloudTable};})();'),context);
 return context;
}
test('internal table has column semantics, mobile labels and escaped data',()=>{
 const c=appFixture(),html=c.window.qaDesign.adminCloudTable([{protocol:'CC-2026-01000',title:'<unsafe>',status:'Recebida',neighborhood_label:'Centro'}]);
 assert.equal((html.match(/scope="col"/g)||[]).length,5);assert.equal((html.match(/data-label=/g)||[]).length,5);
 assert.match(html,/&lt;unsafe&gt;/);assert.doesNotMatch(html,/<unsafe>/);assert.match(html,/aria-label="Abrir ocorrência CC-2026-01000"/);
});
test('territorial summaries use the sanitized public view, preserving own private record lookup',()=>{
 for(const [file,end] of [['assets/piracicaba.js','function findRegion('],['assets/piracicaba-mapas.js','function allNeighborhoods(']]){
  const source=read(file),start=source.indexOf('function readOccurrences('),c={window:{CidadeConectaPublicRecords:()=>[],CidadeConectaLocalDB:{occurrences:[{protocol:'owner'}]}},localStorage:{getItem:()=>null},STORAGE_KEY:'test'};
  vm.runInNewContext(source.slice(start,source.indexOf(end,start)),c);assert.equal(c.readOccurrences(true).length,0);
  if(file.includes('mapas'))assert.equal(c.readOccurrences(false)[0].protocol,'owner');
 }
});

test('home orienta primeiro acesso e separa público de demonstração',()=>{
 const html=read('index.html'),app=read('assets/app.js'),civic=read('assets/civic.css');
 assert.match(app,/O que você quer fazer\?/);
 assert.match(app,/Explorar a versão DEMO/);
 assert.match(app,/Público/);
 assert.match(app,/Demonstração/);
 assert.match(civic,/homeIntentGridV82/);
 assert.match(civic,/recentSourceV82/);
 assert.match(html,/Ver apresentação DEMO/);
});
test('navegação anuncia mudança de rota para tecnologia assistiva',()=>{
 const html=read('index.html'),app=read('assets/app.js');
 assert.match(html,/id="routeAnnouncer"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(app,/routeAnnouncer/);
});
