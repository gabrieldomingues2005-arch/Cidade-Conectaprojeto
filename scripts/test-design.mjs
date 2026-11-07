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
 assert.match(app,/Abrir apresentação DEMO com dados fictícios/);
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

test('estética institucional preserva identidade própria e aviso independente',()=>{
 const html=read('index.html'),app=read('assets/app.js'),civic=read('assets/civic.css');
 assert.match(html,/cc-institutional-v83/);
 assert.match(html,/Protótipo acadêmico independente/);
 assert.match(html,/Cidade Conecta Piracicaba<\/span><small>Participação cidadã/);
 assert.match(html,/Participação urbana · Piracicaba, SP/);
 assert.doesNotMatch(html,/<\/script>\\n\s*<script/);
 assert.match(app,/Como podemos ajudar\?/);
 assert.match(app,/Registre\. Acompanhe\. Veja resultados\./);
 assert.match(app,/Do relato ao resultado/);
 assert.match(app,/ccBreadcrumbV89/);
 assert.match(app,/O que significa cada status\?/);
 assert.match(app,/STATUS_HELP/);
 assert.match(app,/resolutionSummaryV90/);
 assert.match(app,/mapGuideV90/);
 assert.match(app,/registerTrustV91/);
 assert.match(app,/afterSubmitV91/);
 assert.match(app,/followPromiseV91/);
 assert.match(app,/Mapa interativo indisponível/);
 assert.doesNotMatch(app,/mapGuideV90[^\n]*\\+iconSvg/);
 assert.match(app,/Referência informativa; não implica encaminhamento oficial/);
 assert.match(app,/acompanhamento publicado/);
 assert.match(app,/Guia de serviços/);
 assert.match(civic,/--cc83-navy:#0b3f55/);
 assert.match(civic,/homePortalSearchBoxV83/);
 assert.match(html,/cc-institutional-pira-v85/);
 assert.match(html,/institutional-pira-v85\.css\?v=9\.2\.1/);
 assert.match(html,/civic\.css\?v=9\.3\.0/);
 assert.match(html,/civic-pages\.js\?v=9\.3\.0/);
 assert.match(html,/civic-demo\.js\?v=9\.3\.0/);
 assert.match(html,/institutional-a11y-v85\.js\?v=8\.5\.1/);
 assert.match(html,/civic-ui\.js\?v=9\.2\.0/);
 assert.match(html,/civic-city-news\.js\?v=9\.3\.0/);
 assert.doesNotMatch(html,/logo-gov|marca-gov|bras[aã]o/i);
});

test('barra superior mantém foco em acompanhamento',()=>{const ui=readFileSync('assets/civic-ui.js','utf8');assert.match(ui,/Atualizações de ocorrências/);assert.match(ui,/Ver acompanhamento/);assert.doesNotMatch(ui,/Atualizações da cidade/);});

test('fotos licenciadas usam URLs diretas',()=>{const city=readFileSync('assets/civic-city-news.js','utf8'),demo=readFileSync('assets/civic-demo.js','utf8');assert.doesNotMatch(city,/Special:Redirect\/file/);assert.doesNotMatch(demo,/Special:Redirect\/file/);assert.match(city,/upload\.wikimedia\.org/);assert.match(demo,/upload\.wikimedia\.org/);});
