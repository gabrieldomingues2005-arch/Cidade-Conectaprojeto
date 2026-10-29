import {spawn} from 'node:child_process';
import {mkdir,writeFile,mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const cfgText=await readFile('assets/runtime-config.js','utf8');
const pick=(name)=>cfgText.match(new RegExp(name+"\\s*:\\s*'([^']+)'"))?.[1]||'';
const SUPABASE_URL=pick('url');
const PUBLISHABLE=pick('publishableKey');
const LEGACY_ANON=pick('legacyAnonJwt');
if(!SUPABASE_URL||!PUBLISHABLE||!LEGACY_ANON)throw new Error('Config pública do Supabase incompleta.');
const PROTOCOL='CC-2026-01002';
const TITLE='Teste QA Cidade Conecta v2';
const OUT=process.env.QA_SCREENSHOT_DIR||'artifacts/qa-live-v2';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await mkdir(OUT,{recursive:true});

async function waitPublicOccurrence(){
 const headers={'apikey':PUBLISHABLE,'Authorization':'Bearer '+LEGACY_ANON,'Accept':'application/json'};
 const url=SUPABASE_URL+'/rest/v1/occurrences?select=protocol,title,moderation_status,public_visible&protocol=eq.'+encodeURIComponent(PROTOCOL)+'&public_visible=eq.true&moderation_status=eq.approved';
 for(let i=0;i<120;i++){
  const response=await fetch(url,{headers});let body=null;try{body=await response.json()}catch{}
  if(response.ok&&Array.isArray(body)&&body.some(x=>x.protocol===PROTOCOL)){console.log('QA_PUBLIC_OCCURRENCE_READY '+PROTOCOL);return}
  await pause(500)
 }
 throw new Error('Ocorrência QA não ficou disponível para leitura pública.')
}

async function runBrowser(){
 const port=4187,base='http://127.0.0.1:'+port;
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
 for(let i=0;i<50;i++){try{const r=await fetch(base+'/index.html');if(r.ok)break}catch{}await pause(100)}
 const profile=await mkdtemp(path.join(tmpdir(),'cidade-live-map-'));
 const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank']);
 let socket;const results=[];
 try{
  const endpoint=await new Promise((resolve,reject)=>{
   let log='';const timer=setTimeout(()=>reject(new Error('Chrome não iniciou: '+log)),30000);
   chrome.stderr.on('data',chunk=>{log+=chunk;const m=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1])}});
   chrome.once('error',reject);chrome.once('exit',code=>reject(new Error('Chrome encerrou: '+code)))
  });
  const debugPort=new URL(endpoint).port;
  const targets=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  let id=0;const pending=new Map();const jsErrors=[];const badSupabase=[];
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error('CDP timeout '+method))},20000);pending.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}))});
  socket.addEventListener('message',event=>{
   const m=JSON.parse(event.data);
   if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)}return}
   if(m.method==='Runtime.exceptionThrown')jsErrors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text||'JS error');
   if(m.method==='Network.responseReceived'){const r=m.params.response;if(r.url.includes(new URL(SUPABASE_URL).host)&&r.status>=400)badSupabase.push({url:r.url,status:r.status})}
  });
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||'Falha JS');return r.result.value};
  const navigate=async url=>{await send('Page.navigate',{url});await pause(500)};
  const waitFor=async expression=>{for(let i=0;i<240;i++){try{if(await evaluate(expression))return}catch{}await pause(100)}throw new Error('Condição não atendida: '+expression)};
  const capture=async name=>{const m=await send('Page.getLayoutMetrics');const s=m.cssContentSize||m.contentSize||{width:1366,height:900};const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(s.width),height:Math.min(Math.ceil(s.height),5000),scale:1}});await writeFile(path.join(OUT,name+'.png'),Buffer.from(shot.data,'base64'))};

  await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
  await navigate(base+'/index.html#/mapa');
  await waitFor(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`);
  assert.ok(await evaluate(`Boolean(document.querySelector('[data-map-open="${PROTOCOL}"]'))`),'Lista do mapa não contém ocorrência real');
  await waitFor(`Boolean(window.L)&&document.querySelector('#publicMap')?.classList.contains('leaflet-container')`);
  const publicText=await evaluate(`document.querySelector('#app').textContent`);
  assert.ok(!publicText.includes('qa@example.invalid'),'UI pública vazou contato privado');
  assert.ok(!publicText.includes('-22.725321'),'UI pública vazou latitude exata');
  await capture('mapa-real-390');results.push({gate:'mapa-real',status:'PASS'});

  await evaluate(`document.querySelector('[data-map-pane="list"]').click();true`);await pause(200);
  assert.ok(await evaluate(`document.querySelector('.mapExperienceV58')?.classList.contains('showListV53')`));
  assert.ok(await evaluate(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`));
  await capture('lista-real-390');results.push({gate:'lista-real',status:'PASS'});

  await evaluate(`document.querySelector('[data-map-pane="regions"]').click();true`);
  await waitFor(`!document.querySelector('[data-map-region="1"]').disabled`);
  await waitFor(`/\\d/.test(document.querySelector('[data-map-region-count="1"]').textContent)`);
  const regionCount=await evaluate(`document.querySelector('[data-map-region-count="1"]').textContent`);
  const regionDiag=await evaluate(`(async()=>{const d=await fetch('data/piracicaba.json',{cache:'no-cache'}).then(r=>r.json());const reg=(d.administrativeRegions||[]).find(r=>Number(r.id)===1);const norm=v=>String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const hoods=(reg?.neighborhoods||[]).map(x=>norm(String(x).replace(/^Parte do /i,'')));const rows=(window.CidadeConectaLocalDB?.occurrences||[]).map(o=>({protocol:o.protocol,bairro:o.bairro,cloudOrigin:Boolean(o.cloudOrigin),moderationStatus:o.moderationStatus}));return{countText:document.querySelector('[data-map-region-count="1"]').textContent,region1Hoods:hoods,rows,matching:rows.filter(o=>hoods.includes(norm(o.bairro))).map(o=>o.protocol)}})()`);
  console.log('QA_REGION_DIAG '+JSON.stringify(regionDiag));
  const regionNumber=Number((String(regionCount).match(/\\d+/)||[])[0]||0);
  assert.ok(regionNumber>=1,'Região 1 deveria conter pelo menos a ocorrência QA em Centro');
  await capture('regioes-real-390');
  await evaluate(`document.querySelector('[data-map-region="1"]').click();document.querySelector('[data-map-pane="list"]').click();true`);await pause(250);
  assert.ok(await evaluate(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`),'Centro/Região 1 não manteve ocorrência QA');
  results.push({gate:'regioes-real',status:'PASS',region1Count:regionNumber});

  await evaluate(`document.querySelector('[data-map-open="${PROTOCOL}"]').click();document.querySelector('[data-map-pane="map"]').click();true`);await pause(900);
  const popup=await evaluate(`document.querySelector('.leaflet-popup-content')?.textContent||''`);
  assert.ok(popup.includes(TITLE),'Marcador real não abriu popup da ocorrência QA');
  assert.deepEqual(jsErrors,[],'Erros JavaScript no mapa real');
  assert.deepEqual(badSupabase,[],'Requests Supabase 4xx/5xx no navegador real');
  results.push({gate:'popup-real',status:'PASS'});

  await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
  await navigate(base+'/index.html#/mapa');
  await waitFor(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`);
  assert.ok((await evaluate('document.documentElement.scrollWidth'))<=1367,'Overflow horizontal desktop');
  await capture('mapa-real-1366');results.push({gate:'mapa-desktop-real',status:'PASS'});
 } finally {
  await writeFile(path.join(OUT,'results.json'),JSON.stringify(results,null,2));
  socket?.close();chrome.kill();server.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})
 }
}

await waitPublicOccurrence();
await runBrowser();
console.log('QA_LIVE_MAP_V2_PASS '+PROTOCOL);
