// Chrome DevTools Protocol; Node 22, sem bibliotecas ou serviços de teste externos.
import {spawn} from 'node:child_process';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE||'http://127.0.0.1:4173';
const output=process.env.SMOKE_SCREENSHOT_DIR||'artifacts/ui-smoke';
await mkdir(output,{recursive:true});
const profile=await mkdtemp(path.join(tmpdir(),'cidade-chrome-'));
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank']);
let socket;const results=[];let scenario='unavailable';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(new Error('Chrome não iniciou em 30s: '+log)),30000);chrome.stderr.on('data',chunk=>{log+=chunk;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}});chrome.once('error',reject);chrome.once('exit',code=>reject(new Error(`Chrome encerrou: ${code}`)))});
 const port=new URL(endpoint).port;
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 let id=0;const pending=new Map(),errors=[];
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(new Error(`CDP timeout: ${method}`))},20000);pending.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}))});
 socket.addEventListener('message',async event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)}return}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));if(m.method==='Fetch.requestPaused'){const {requestId,request}=m.params;try{const u=new URL(request.url);if(u.origin!==new URL(base).origin){await send('Fetch.fulfillRequest',{requestId,responseCode:503,body:Buffer.from('{}').toString('base64'),responseHeaders:[{name:'Content-Type',value:'application/json'}]})}else await send('Fetch.continueRequest',{requestId})}catch(error){errors.push(String(error))}}});
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await send('Network.setBypassServiceWorker',{bypass:true});await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||'Falha de avaliação');return r.result.value};
 // Fixtures existem apenas no browser de QA: nenhuma chamada externa sai do teste.
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
 window.__qaScenario=location.search.includes('qaCivic=1')?'qa-public':'unavailable';
 if(location.search.includes('qaPerf=1')&&navigator.serviceWorker)navigator.serviceWorker.register=async()=>{throw Error('Worker registration excluded from lab navigation timing')};
 if(location.search.includes('qaLeaflet=1')){
  window.__leafletQA={fit:0,fly:0,popup:0,invalidates:0,heatCoordinates:[]};
  const chain=()=>({addTo(){return this},bindPopup(){return this},openPopup(){window.__leafletQA.popup++;return this},on(){return this},setLatLng(){return this},getLatLng(){return {lat:-22.725,lng:-47.649}}});
  const mapObj={
   _zoom:12,remove(){window.__leafletQA.removed=true;return this},setView(){return this},getZoom(){return this._zoom},removeLayer(){return this},
   fitBounds(){window.__leafletQA.fit++;return this},flyTo(){window.__leafletQA.fly++;return this},
   invalidateSize(){window.__leafletQA.invalidates++;return this},on(){return this}
  };
  window.L={
   map(){return mapObj},
   tileLayer(){const handlers={};return{on(name,fn){handlers[name]=fn;if(name==='load')setTimeout(fn,10);return this}}},
   marker(){return chain()},circleMarker(coords,options){if(options?.interactive===false)window.__leafletQA.heatCoordinates.push(coords);return chain()},divIcon(o){return o},
   latLngBounds(){return{pad(){return this}}},
   geoJSON(){return chain()},
   control:{zoom(){return{addTo(){return this}}},layers(){return{addTo(){return this}}}}
  };
 }
 const originalFetch=window.fetch.bind(window);
 window.fetch=async function(input,options={}){
  const url=new URL(typeof input==='string'?input:input.url,location.href);
  if(url.origin===location.origin)return originalFetch(input,options);
  const mode=window.__qaScenario;
  if(mode==='network'||mode==='offline')throw new TypeError('Rede indisponível (QA)');
  if(mode==='timeout')return new Promise((resolve,reject)=>options.signal?.addEventListener('abort',()=>reject(Object.assign(new Error('Timeout QA'),{name:'AbortError'}))));
  const json=(status,payload)=>Promise.resolve(new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}}));
  if(mode==='qa-public'&&url.pathname.includes('/rest/v1/occurrences')){
   const rows=Array.from({length:40},(_,i)=>{const created=new Date(Date.now()-(i<20?10:40)*86400000-i*60000).toISOString(),updated=i===0&&window.__qaUpdated?new Date().toISOString():new Date(Date.parse(created)+86400000).toISOString(),status=i===0?(window.__qaUpdated?'Resolvida':'Em andamento'):i%4===0?'Resolvida':'Recebida';return{protocol:'CC-2026-'+String(9000+i).padStart(5,'0'),title:'QA iluminação pública '+i,description:'Relato público fictício para QA do navegador.',neighborhood_label:i%2?'Paulista':'Centro',status,public_visible:true,moderation_status:'approved',public_latitude:-22.725123-i*.0001,public_longitude:-47.649456-i*.0001,responsible_agency:'Referência de QA',created_at:created,updated_at:updated,resolved_at:status==='Resolvida'?updated:null,categories:{slug:'iluminacao',name:'Iluminação'},occurrence_history:[{status:'Recebida',note:'Nota pública de QA',public_note:true,created_at:created},{status,note:'Atualização pública de QA',public_note:true,created_at:updated},{status:'Recebida',note:'PRIVATE_NOTE_QA',public_note:false,created_at:updated}],email:'PRIVATE_EMAIL_QA',exact_address:'PRIVATE_ADDRESS_QA',trackingKey:'PRIVATE_TOKEN_QA',auth_user_id:'PRIVATE_AUTH_QA'}});
   return new Response(JSON.stringify(rows),{status:200,headers:{'Content-Type':'application/json','Content-Range':'0-39/40'}});
  }
  if(mode==='qa-public'&&url.pathname.includes('/functions/v1/community-actions')){const b=JSON.parse(options.body||'{}');window.__qaCommunity=window.__qaCommunity||{};if(b.action==='recurrence')window.__qaCommunity[b.protocol]=true;return json(200,{protocol:b.protocol,registered:!!window.__qaCommunity[b.protocol],recurrenceCount:window.__qaCommunity[b.protocol]?7:6,canGiveFeedback:true,feedbackSaved:b.action==='feedback',myResolution:b.resolution||null,satisfaction:null})}
  if(url.pathname.includes('/auth/v1/')){
   if(mode==='unavailable')return json(503,{message:'Serviço temporariamente indisponível'});
   if(mode==='401')return json(401,{message:'Sessão inválida'});
   if(url.pathname.endsWith('/user'))return json(200,{id:'qa-user'});
   return json(200,{access_token:'qa-access',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600});
  }
  if(url.pathname.includes('/functions/v1/admin-occurrences')){
   const body=JSON.parse(options.body||'{}');
   if(mode==='403')return json(403,{error:'internal_access_denied',message:'Permissão insuficiente',role:'citizen'});
   if(mode==='empty')return json(200,body.action==='session'?{authenticated:true,profile:{id:'qa-profile',role:'triage'}}:{occurrences:[]});
   if(mode==='qa-list'){
    const rows=[{protocol:'CC-2026-09001',title:'Iluminação de demonstração para QA',neighborhood_label:'Centro',status:'Recebida',categories:{slug:'iluminacao',name:'Iluminação'},created_at:'2026-11-02T12:00:00Z'},{protocol:'CC-2026-09002',title:'Calçada de demonstração para QA',neighborhood_label:'Paulista',status:'Em análise',categories:{slug:'acessibilidade',name:'Acessibilidade'},created_at:'2026-11-02T13:00:00Z'}];
    return json(200,body.action==='session'?{authenticated:true,profile:{id:'qa-profile',role:'triage',name:'Equipe de teste'}}:body.action==='detail'?{occurrence:{...rows.find(r=>r.protocol===body.protocol),description:'Descrição pública de demonstração, sem dados pessoais.',history:[{status:'Recebida',note:'Nota pública para QA.',created_at:'2026-11-02T12:00:00Z'}]}}:{occurrences:rows});
   }
  }
  return json(503,{message:'Serviço temporariamente indisponível'});
 };
 `});
 const capture=async name=>{const metrics=await send('Page.getLayoutMetrics');const size=metrics.cssContentSize||metrics.contentSize||{width:1366,height:900};const image=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(size.width),height:Math.min(Math.ceil(size.height),5000),scale:1}});await writeFile(path.join(output,name+'.png'),Buffer.from(image.data,'base64'))};
 const waitFor=async expression=>{for(let n=0;n<150;n++){if(await evaluate(expression))return;await pause(100)}throw new Error(`Condição não atendida: ${expression}`)};
 const routes=[['home','#/','#homeSearch'],['registrar','#/registrar','#occForm'],['acompanhar','#/acompanhar','#followForm'],['mapa','#/mapa','#publicMap'],['dashboard','#/dashboard','.dashboardKpisV51'],['rede','#/rede-municipal','#municipalNetworkRoot'],['admin','#/admin','#adminLoginForm'],['minhas','#/minhas','.mineSummaryV50'],['bairro','#/bairro?nome=Centro','.neighborhoodHeroV55'],['ocorrencia','#/ocorrencia/CC-2026-00001','.detailV52'],['piracicaba','#/piracicaba','.geoMunicipal'],['sobre','#/sobre','#app .grid2'],['privacidade','#/privacidade','#app .grid2'],...['agora','feed','resolvidas','comparar','dados-abertos','relatorios','transparencia'].map(n=>[n,'#/'+n,'#civicPublicPage'])];
 for(const width of [320,390,768,1366]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const [name,hash,selector] of routes){
   errors.length=0;await send('Page.navigate',{url:base+'/index.html'+hash});await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);await pause(350);
   const data=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,text:document.querySelector('#app').textContent,unlabelled:[...document.querySelectorAll('#app input:not([type=hidden]),#app select,#app textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id)})`);
   await capture(`${name}-${width}`);
   if(name==='mapa'){
    if(width===390)await evaluate(`document.querySelector('[data-map-pane="list"]')?.click()`);
    const overlapping=await evaluate(`[...document.querySelectorAll('.mapResultItemV58')].filter(row=>{const radar=row.querySelector('.mapResultRadarV58')?.getBoundingClientRect(),meta=row.querySelector('.mapResultMeta')?.getBoundingClientRect();return radar&&meta&&radar.height>0&&meta.height>0&&radar.top<meta.bottom-1}).length`);
    assert.equal(overlapping,0,`mapa ${width}: Radar do bairro sobrepõe o status`);
   }
   if(name==='mapa'&&width===390){
    await evaluate(`document.querySelector('[data-map-pane="list"]')?.click()`);await pause(80);await capture('mapa-lista-390');
    await evaluate(`document.querySelector('[data-map-pane="regions"]')?.click()`);
    await waitFor(`!document.querySelector('[data-map-region="1"]')?.disabled`);
    assert.ok(await evaluate(`/\\d/.test(document.querySelector('[data-map-region-count="1"]')?.textContent||'')`),'mapa regiões: contador da Região 1 não foi preenchido');
    await pause(80);await capture('mapa-regioes-390');
    await evaluate(`document.querySelector('[data-map-pane="map"]')?.click()`);await pause(80);
   }
   assert.equal(data.width,width);assert.ok(data.scroll<=width+1,`${name} ${width}: overflow ${data.scroll}`);assert.ok(!data.text.includes('Página não encontrada'));assert.deepEqual(data.unlabelled,[],`${name}: campos sem label`);assert.deepEqual(errors,[],`${name}: erro JS`);
   // Menu abre, é anunciado e fecha por Escape.
   const visible=await evaluate(`getComputedStyle(document.querySelector('#menu')).display!=='none'`);
   if(visible){await evaluate(`document.querySelector('#menu').click()`);assert.equal(await evaluate(`document.querySelector('#menu').getAttribute('aria-expanded')`),'true');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});assert.equal(await evaluate(`document.querySelector('#menu').getAttribute('aria-expanded')`),'false')}
   if(width===1366)assert.equal(await evaluate(`getComputedStyle(document.querySelector('#nav')).display`),'flex','Navegação desktop deve ficar visível');
   const cutControls=await evaluate(`[...document.querySelectorAll('#app input:not([type=hidden]),#app select,#app textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left< -1||r.right>innerWidth+1)}).map(e=>e.id)`);
   assert.deepEqual(cutControls,[],name+' '+width+': controle cortado');
   if(name==='admin'){await evaluate(`document.querySelector('#adminEmail').focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert.equal(await evaluate('document.activeElement.id'),'adminPassword')}
   results.push({route:hash,width,status:'PASS'});console.log(`✓ ${name} ${width}`);
  }
 }
 for(scenario of ['unavailable','network','timeout','offline','401','403','empty']){
  await evaluate(`Object.defineProperty(navigator,'onLine',{configurable:true,value:true});window.dispatchEvent(new Event('online'));window.__qaScenario=${JSON.stringify(scenario)};sessionStorage.setItem('cidadeConectaAuthSessionV1',JSON.stringify({access_token:'qa-access',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600}));location.hash='#/admin';`);
  if(scenario==='offline')await evaluate(`Object.defineProperty(navigator,'onLine',{configurable:true,value:false});window.dispatchEvent(new Event('offline'))`);
  await evaluate('window.CidadeConectaAuth.init()');await evaluate(`window.dispatchEvent(new HashChangeEvent('hashchange'))`);
  if(scenario==='401')await waitFor(`Boolean(document.querySelector('#adminLoginForm'))`);else await pause(180);
  const state=await evaluate(`({status:CidadeConectaAuth.state.status,saved:!!sessionStorage.getItem('cidadeConectaAuthSessionV1'),login:!!document.querySelector('#adminLoginForm'),text:document.querySelector('#app').textContent})`);
  await capture(`admin-${scenario}`);
  assert.equal(state.status,scenario==='401'?'anonymous':scenario==='403'?'denied':scenario==='empty'?'authorized':'error');assert.equal(state.saved,scenario!=='401');if(scenario==='401')assert.ok(state.login);
  if(scenario==='offline')assert.equal(await evaluate(`document.querySelector('#offlineNoticeV56').hidden`),false);
  results.push({scenario,status:'PASS'});console.log(`✓ admin ${scenario}`);
 }
 // Busca modal: atalho preserva rota, Tab fica contido e Escape devolve foco.
 errors.length=0;
 await evaluate(`sessionStorage.removeItem('cidadeConectaAuthSessionV1')`);
 await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:base+'/index.html?qaView=keyboard#/mapa'});await waitFor(`Boolean(document.querySelector('#mapSearch'))`);
 await evaluate(`document.querySelector('#globalSearchBtn').focus()`);
 const press=async(key,code,modifiers=0)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,modifiers})};
 await press('k','KeyK',2);await waitFor(`document.activeElement.id==='commandInput'`);
 assert.equal(await evaluate('location.hash'),'#/mapa','Busca não deve mudar a rota ao abrir');
 assert.equal(await evaluate(`document.querySelector('#app').inert`),true);
 await press('Tab','Tab',8);
 assert.equal(await evaluate('document.activeElement.classList.contains("commandItemV53")'),true,'Shift+Tab deve ir ao último resultado');
 await press('Tab','Tab');assert.equal(await evaluate('document.activeElement.id'),'commandInput');
 await capture('busca-modal-1366');await press('Escape','Escape');
 assert.equal(await evaluate('document.activeElement.id'),'globalSearchBtn');assert.equal(await evaluate(`document.querySelector('#app').inert`),false);
 assert.deepEqual(errors,[],'Busca: erro JS');results.push({scenario:'busca-teclado',status:'PASS'});
 // Preenchimento apenas local: nenhuma submissão, nenhum dado real.
 await send('Page.navigate',{url:base+'/index.html?qaView=form#/registrar'});await waitFor(`Boolean(document.querySelector('#title'))`);
 await evaluate(`document.querySelector('[data-category-choice="vias"]').click();for(const [id,value] of Object.entries({bairro:'Centro',title:'Verificação visual do formulário',description:'Descrição pública fictícia usada apenas no navegador de QA.',name:'Contato privado de QA',email:'qa@example.invalid'})){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}))}`);
 assert.ok((await evaluate(`document.querySelector('#publicPreview').textContent`)).includes('Verificação visual do formulário'));
 assert.ok(!(await evaluate(`document.querySelector('#publicPreview').textContent`)).includes('qa@example.invalid'));
 await evaluate(`document.querySelector('#saveDraft').click()`);assert.ok(await evaluate(`Boolean(localStorage.getItem('cidadeConectaDraftV4'))`));
 await capture('registrar-preenchido-1366');results.push({scenario:'formulario-previa-privacidade',status:'PASS'});
 // Admin preenchido somente por fixtures; RLS/Auth reais não são contornados.
 for(const width of [320,390,1366]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base+'/index.html?qaView=admin-'+width+'#/admin'});await waitFor(`Boolean(document.querySelector('#adminLoginForm'))`);
  await evaluate(`window.__qaScenario='qa-list';sessionStorage.setItem('cidadeConectaAuthSessionV1',JSON.stringify({access_token:'qa-access',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600}));window.CidadeConectaAuth.init()`);
  await evaluate(`window.dispatchEvent(new HashChangeEvent('hashchange'))`);
  await waitFor(`document.querySelectorAll('.adminTableV60 tbody tr').length===2`);await capture('admin-fila-'+width);
  assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`));
  await evaluate(`const e=document.querySelector('#adminSearch');e.value='não existe';e.dispatchEvent(new Event('input',{bubbles:true}))`);
  assert.ok((await evaluate(`document.querySelector('#adminList').textContent`)).includes('Nenhuma ocorrência encontrada'));
  await evaluate(`document.querySelector('#adminClear').click()`);await waitFor(`document.querySelectorAll('.adminTableV60 tbody tr').length===2`);
  await evaluate(`document.querySelector('[data-admin-open]').click()`);await waitFor(`Boolean(document.querySelector('.adminReadOnlyV57'))`);
  await capture('admin-detalhe-'+width);results.push({scenario:'admin-fila-filtros-'+width,status:'PASS'});
  await evaluate(`sessionStorage.removeItem('cidadeConectaAuthSessionV1')`);
 }
 // Exercita o caminho real do mapa com uma implementação Leaflet local de QA.
 errors.length=0;
 await evaluate(`sessionStorage.removeItem('cidadeConectaAuthSessionV1')`);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:base+'/index.html?qaLeaflet=1#/mapa'});
 await waitFor(`Boolean(window.L)&&document.querySelectorAll('[data-map-open]').length>0`);
 await pause(250);
 let leaf=await evaluate(`({...window.__leafletQA,items:document.querySelectorAll('[data-map-open]').length,hash:location.hash})`);
 assert.ok(leaf.items>0,'mapa Leaflet QA: lista vazia');
 assert.ok(leaf.fit>0,'mapa Leaflet QA: fitBounds inicial não executou');
 await evaluate(`document.querySelector('[data-map-pane="list"]')?.click();document.querySelector('[data-map-status="Em andamento"]')?.click()`);
 await pause(80);
 assert.ok((await evaluate('location.hash')).includes('status=Em+andamento'),'mapa Leaflet QA: filtros não sincronizaram a URL');
 const fitBefore=await evaluate('window.__leafletQA.fit');
 await evaluate(`document.querySelector('[data-map-pane="map"]')?.click()`);
 await pause(120);
 assert.ok((await evaluate('window.__leafletQA.fit'))>fitBefore,'mapa Leaflet QA: fit adiado não executou ao voltar ao mapa');
 await evaluate(`document.querySelector('[data-map-pane="list"]')?.click();document.querySelector('[data-map-open]')?.click()`);
 await pause(700);
 leaf=await evaluate(`({...window.__leafletQA})`);
 assert.ok(leaf.fly>0,'mapa Leaflet QA: item da lista não focou o marcador');
 assert.ok(leaf.popup>0,'mapa Leaflet QA: popup do marcador não abriu');
 assert.deepEqual(errors,[],'mapa Leaflet QA: erro JS');
 await capture('mapa-leaflet-stub-390');
 results.push({scenario:'map-leaflet-stub',status:'PASS'});console.log('✓ mapa Leaflet stub 390');

 await evaluate(`location.hash='#/admin'`);
 await waitFor(`Boolean(document.querySelector('#adminLoginForm'))`);
 assert.equal(await evaluate('Boolean(window.__leafletQA.removed)'),true,'Leaflet stub deve permitir destruir o mapa ao sair da rota');
 assert.deepEqual(errors,[],'Transição mapa → admin deve ocorrer sem exceções');


 // Novas leituras: fixtures isoladas, nunca inseridas no backend real.
 scenario='civic-populated';errors.length=0;
 await send('Page.navigate',{url:base+'/index.html?qaCivic=1#/agora'});
 await waitFor(`window.CidadeConectaPublicSource?.state().status==='live'&&document.querySelector('.civic-kpis')?.textContent.includes('40')`);
 assert.equal(await evaluate('CidadeConectaPublicSource.state().rows.length'),40);
 for(const marker of ['PRIVATE_EMAIL_QA','PRIVATE_ADDRESS_QA','PRIVATE_TOKEN_QA','PRIVATE_AUTH_QA','PRIVATE_NOTE_QA'])assert.ok(!(await evaluate(`document.querySelector('#app').textContent`)).includes(marker));
 await evaluate(`location.hash='#/ocorrencia/CC-2026-09000'`);await waitFor(`Boolean(document.querySelector('[data-civic-follow]'))`);
 await evaluate(`document.querySelector('[data-civic-follow]').click()`);
 assert.equal(await evaluate(`CidadeConectaCitizen.isFollowing('CC-2026-09000')`),true);
 await evaluate(`window.__qaUpdated=true;CidadeConectaPublicSource.refresh(true)`);
 await waitFor(`CidadeConectaCitizen.state().unread===1`);
 await evaluate(`document.querySelector('#notificationBtn').focus();document.querySelector('#notificationBtn').click()`);
 assert.equal(await evaluate(`document.querySelector('#app').inert`),true);
 await capture('notificacoes-atualizacao-1366');
 await evaluate(`document.querySelector('[data-civic-read-all]').click()`);assert.equal(await evaluate(`CidadeConectaCitizen.state().unread`),0);
 await press('k','KeyK',2);assert.equal(await evaluate(`Boolean(document.querySelector('.civic-overlay'))`),false,'Busca deve substituir o painel de notificações');assert.equal(await evaluate(`document.querySelector('#commandPalette').classList.contains('hidden')`),false);await press('Escape','Escape');assert.equal(await evaluate('document.activeElement.id'),'notificationBtn');
 await evaluate(`location.hash='#/ocorrencia/CC-2026-09000'`);await evaluate(`window.dispatchEvent(new HashChangeEvent('hashchange'))`);
 await waitFor(`Boolean(document.querySelector('[data-community-feedback]'))`);
 await evaluate(`document.querySelector('[data-community-recurrence]').click()`);
 await waitFor(`document.querySelector('[data-community-recurrence]')?.textContent==='Relato semelhante registrado'`);
 await evaluate(`document.querySelector('[name=resolution][value=yes]').checked=true;document.querySelector('[data-community-feedback]').requestSubmit()`);
 await waitFor(`document.querySelector('.civic-community-message')?.textContent.includes('confirmada')`);
 results.push({scenario:'civic-follow-notifications-recurrence-feedback',status:'PASS'});
 await waitFor(`document.querySelector('#toast').classList.contains('hidden')`);
 for(const width of [390,768,1366]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const [name,hash]of [['agora','agora'],['pulso','dashboard'],['dados','dados-abertos'],['relatorio','relatorios'],['feed','feed'],['pessoal','minhas?tab=acompanhando'],['comparacao','comparar?hood=Centro&hood=Paulista'],['radar','bairro?nome=Centro'],['resolucao','ocorrencia/CC-2026-09000']]){
   await evaluate(`location.hash=${JSON.stringify('#/'+hash)}`);await pause(180);
   assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name+' populated '+width+' overflow');
   if(name==='pulso'){assert.equal(await evaluate(`Boolean(document.querySelector('#territoryDash,#geoRates'))`),false,'Pulso não deve misturar extensões demonstrativas')}assert.deepEqual(errors,[],name+' populated JS');await capture('civic-'+name+'-'+width);results.push({scenario:'civic-'+name,width,status:'PASS'});
  }
 }
 await evaluate(`location.hash='#/dados-abertos'`);await pause(80);
 const exported=await evaluate(`(async()=>{const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.__qaExportBlob=blob;return original(blob)};document.querySelector('[data-civic-export=json]').click();const text=await window.__qaExportBlob.text();URL.createObjectURL=original;return JSON.parse(text)})()`);
 assert.equal(exported.occurrences.length,40);assert.equal(Object.keys(exported.occurrences[0]).length,12);
 for(const marker of ['PRIVATE_EMAIL_QA','PRIVATE_ADDRESS_QA','PRIVATE_TOKEN_QA','PRIVATE_AUTH_QA','PRIVATE_NOTE_QA'])assert.ok(!JSON.stringify(exported).includes(marker));
 results.push({scenario:'public-export-button-allowlist',status:'PASS'});
 await evaluate(`document.querySelector('[data-civic-share-page]').click()`);await waitFor(`Boolean(document.querySelector('#civicShowQr'))`);
 await evaluate(`document.querySelector('#civicShowQr').click()`);await waitFor(`Boolean(document.querySelector('#civicQr svg'))`);
 assert.ok((await evaluate(`document.querySelector('#civicShareUrl').value`)).endsWith('#/dados-abertos'));
 await capture('compartilhar-qr-1366');await press('Escape','Escape');
 results.push({scenario:'public-share-local-qr',status:'PASS'});

 // Camadas, filtros e localização aproximada: apenas dados públicos, sem persistir posição atual.
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:base+'/index.html?qaCivic=1&qaLeaflet=1#/mapa'});
 await waitFor(`window.CidadeConectaPublicSource?.state().status==='live'&&Boolean(document.querySelector('#mapHeat'))`);
 await evaluate(`document.querySelector('#mapHeat').checked=true;document.querySelector('#mapHeat').dispatchEvent(new Event('change',{bubbles:true}))`);
 await waitFor(`window.__leafletQA.heatCoordinates.length>0`);
 assert.ok(await evaluate(`window.__leafletQA.heatCoordinates.every(c=>c.every(n=>Number(n.toFixed(3))===n))`),'Calor deve usar apenas coordenadas públicas aproximadas');
 await evaluate(`document.querySelector('#mapFrom').value='2099-01-01';document.querySelector('#mapFrom').dispatchEvent(new Event('change',{bubbles:true}))`);
 assert.equal(await evaluate(`document.querySelector('#mapResultCount').textContent`),'0');
 await evaluate(`document.querySelector('#mapClear').click();window.__qaGeoCalls=0;Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition(ok){window.__qaGeoCalls++;ok({coords:{latitude:-22.725987654321,longitude:-47.649987654321}})}}});document.querySelector('#mapLocate').click()`);
 assert.equal(await evaluate('window.__qaGeoCalls'),0,'Localização não deve ser pedida antes da explicação');
 await evaluate(`document.querySelector('#confirmNearby').click()`);assert.equal(await evaluate('window.__qaGeoCalls'),1);
 assert.ok(await evaluate(`!location.href.includes('987654321')&&!JSON.stringify(localStorage).includes('987654321')`),'Posição atual não pode ir para URL ou armazenamento');
 await capture('mapa-camadas-proximidade-390');
 results.push({scenario:'map-heat-dates-nearby-privacy',status:'PASS'});

 // Zoom/reflow e reduced motion no conteúdo novo, sem esconder funcionalidades.
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
 await evaluate(`location.hash='#/minhas'`);await pause(80);
 await evaluate(`document.documentElement.style.fontSize='200%'`);
 await capture('pessoal-texto-200-390');const reflow=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(e=>({tag:e.tagName,id:e.id,cls:e.className,text:e.textContent.slice(0,70)})).slice(0,20)})`);assert.ok(reflow.scroll<=reflow.width+1,'Texto 200%: overflow '+JSON.stringify(reflow));const navCuts=await evaluate(`[...document.querySelectorAll('.mobileActionsV51>a,.mobileActionsV51>button')].filter(el=>{const node=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!node)return false;const range=document.createRange();range.selectNodeContents(node);const text=range.getBoundingClientRect(),box=el.getBoundingClientRect();return text.left<box.left-1||text.right>box.right+1}).map(el=>el.textContent)`);assert.deepEqual(navCuts,[],'Texto 200%: rótulos da navegação não podem se sobrepor');
 await evaluate(`document.documentElement.style.fontSize=''`);
 results.push({scenario:'text-200-reflow-reduced-motion',status:'PASS'});

 // Offline real no navegador: shell vem do Service Worker; preferências continuam locais.
 await evaluate(`navigator.serviceWorker.ready`);await send('Network.setBypassServiceWorker',{bypass:false});
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await send('Page.navigate',{url:base+'/index.html#/minhas'});await waitFor(`Boolean(document.querySelector('#myCity'))`);
 assert.equal(await evaluate(`document.querySelector('#offlineNoticeV56').hidden`),false);
 assert.equal(await evaluate(`CidadeConectaCitizen.isFollowing('CC-2026-09000')`),true);
 await capture('pwa-offline-pessoal-390');
 await evaluate(`location.hash='#/registrar'`);await waitFor(`Boolean(document.querySelector('#occForm'))`);
 await evaluate(`document.querySelector('[data-category-choice="iluminacao"]').click();for(const[id,value]of Object.entries({bairro:'Centro',title:'QA offline controlado',description:'Este formulário não pode ser enviado quando o navegador está offline.'})){const x=document.getElementById(id);x.value=value;x.dispatchEvent(new Event('input',{bubbles:true}))}document.querySelector('#agree').checked=true;document.querySelector('#occForm').requestSubmit()`);
 await waitFor(`document.querySelector('#toast')?.textContent.includes('Nada foi enviado')`);
 assert.equal(await evaluate(`CidadeConectaLocalDB.occurrences.filter(o=>o.localOwner).length`),0,'Offline não pode inventar um envio ou protocolo');
 await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await send('Network.setBypassServiceWorker',{bypass:true});await send('Network.setCacheDisabled',{cacheDisabled:true});
 results.push({scenario:'pwa-offline-shell-preferences-no-fake-send',status:'PASS'});

 // Comparação de desempenho em laboratório: mesmo navegador/servidor e rede externa bloqueada.
 await send('Performance.enable');const performanceSamples=[];
 for(const [version,url]of [['before',base+'/artifacts/baseline/index.html?qaPerf=1#/'],['after',base+'/index.html?qaPerf=1#/']])for(let sample=0;sample<3;sample++){
  await send('Page.navigate',{url});await waitFor(`Boolean(document.querySelector('#homeSearch'))`);await pause(550);
  const nav=await evaluate(`(()=>{const n=performance.getEntriesByType('navigation')[0],r=performance.getEntriesByType('resource').filter(x=>new URL(x.name).origin===location.origin);return{domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd,resourceBytes:r.reduce((n,x)=>n+x.encodedBodySize,0),requests:r.length}})()`);
  const m=await send('Performance.getMetrics');performanceSamples.push({version,sample,...nav,metrics:Object.fromEntries(m.metrics.filter(x=>['ScriptDuration','LayoutDuration','TaskDuration','JSHeapUsedSize'].includes(x.name)).map(x=>[x.name,x.value]))});
 }
 await writeFile(path.join(output,'performance-before-after.json'),JSON.stringify({scope:'Lab comparison; external network blocked; not Core Web Vitals',samples:performanceSamples},null,2));
 results.push({scenario:'performance-before-after',status:'PASS'});

 console.log(`✓ ${results.length} cenários de navegador`);
}catch(error){results.push({scenario,status:'FAIL',error:String(error)});throw error}
finally{await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));socket?.close();chrome.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200})}
