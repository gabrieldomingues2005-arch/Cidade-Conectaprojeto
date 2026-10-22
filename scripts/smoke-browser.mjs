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
 window.__qaScenario='unavailable';
 if(location.search.includes('qaLeaflet=1')){
  window.__leafletQA={fit:0,fly:0,popup:0,invalidates:0};
  const chain=()=>({addTo(){return this},bindPopup(){return this},openPopup(){window.__leafletQA.popup++;return this},on(){return this},setLatLng(){return this},getLatLng(){return {lat:-22.725,lng:-47.649}}});
  const mapObj={
   _zoom:12,setView(){return this},getZoom(){return this._zoom},removeLayer(){return this},
   fitBounds(){window.__leafletQA.fit++;return this},flyTo(){window.__leafletQA.fly++;return this},
   invalidateSize(){window.__leafletQA.invalidates++;return this},on(){return this}
  };
  window.L={
   map(){return mapObj},
   tileLayer(){const handlers={};return{on(name,fn){handlers[name]=fn;if(name==='load')setTimeout(fn,10);return this}}},
   marker(){return chain()},circleMarker(){return chain()},divIcon(o){return o},
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
  }
  return json(503,{message:'Serviço temporariamente indisponível'});
 };
 `});
 const capture=async name=>{const metrics=await send('Page.getLayoutMetrics');const size=metrics.cssContentSize||metrics.contentSize||{width:1366,height:900};const image=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(size.width),height:Math.min(Math.ceil(size.height),5000),scale:1}});await writeFile(path.join(output,name+'.png'),Buffer.from(image.data,'base64'))};
 const waitFor=async expression=>{for(let n=0;n<150;n++){if(await evaluate(expression))return;await pause(100)}throw new Error(`Condição não atendida: ${expression}`)};
 const routes=[['home','#/','#homeSearch'],['registrar','#/registrar','#occForm'],['acompanhar','#/acompanhar','#followForm'],['mapa','#/mapa','#publicMap'],['dashboard','#/dashboard','.dashboardKpisV51'],['rede','#/rede-municipal','#municipalNetworkRoot'],['admin','#/admin','#adminLoginForm']];
 for(const width of [390,768,1366]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const [name,hash,selector] of routes){
   errors.length=0;await send('Page.navigate',{url:base+'/index.html'+hash});await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);await pause(350);
   const data=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,text:document.querySelector('#app').textContent,unlabelled:[...document.querySelectorAll('#app input:not([type=hidden]),#app select,#app textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id)})`);
   await capture(`${name}-${width}`);
   if(name==='mapa'&&width===390){
    await evaluate(`document.querySelector('[data-map-pane="list"]')?.click()`);await pause(80);await capture('mapa-lista-390');
    await evaluate(`document.querySelector('[data-map-pane="regions"]')?.click()`);await pause(80);await capture('mapa-regioes-390');
    await evaluate(`document.querySelector('[data-map-pane="map"]')?.click()`);await pause(80);
   }
   assert.equal(data.width,width);assert.ok(data.scroll<=width+1,`${name} ${width}: overflow ${data.scroll}`);assert.ok(!data.text.includes('Página não encontrada'));assert.deepEqual(data.unlabelled,[],`${name}: campos sem label`);assert.deepEqual(errors,[],`${name}: erro JS`);
   // Menu abre, é anunciado e fecha por Escape.
   const visible=await evaluate(`getComputedStyle(document.querySelector('#menu')).display!=='none'`);
   if(visible){await evaluate(`document.querySelector('#menu').click()`);assert.equal(await evaluate(`document.querySelector('#menu').getAttribute('aria-expanded')`),'true');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});assert.equal(await evaluate(`document.querySelector('#menu').getAttribute('aria-expanded')`),'false')}
   if(name==='admin'){await evaluate(`document.querySelector('#adminEmail').focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert.equal(await evaluate('document.activeElement.id'),'adminPassword')}
   results.push({route:hash,width,status:'PASS'});console.log(`✓ ${name} ${width}`);
  }
 }
 // Exercita o caminho real do mapa com uma implementação Leaflet local de QA.
 errors.length=0;
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
 console.log(`✓ ${results.length} cenários de navegador`);
}catch(error){results.push({scenario,status:'FAIL',error:String(error)});throw error}
finally{await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));socket?.close();chrome.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200})}
