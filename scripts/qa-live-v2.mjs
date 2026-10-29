import {spawn} from 'node:child_process';
import {mkdir,writeFile,mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';

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

async function request(url,options={}){
  const response=await fetch(url,options);
  let body=null; try{body=await response.json()}catch{}
  return {response,body};
}
const authHeaders={'apikey':PUBLISHABLE,'Content-Type':'application/json','Accept':'application/json'};

async function provisionSession(){
  let r=await request(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:authHeaders,body:'{}'});
  if(r.response.ok&&r.body?.access_token&&r.body?.user?.id){
    console.log('QA_USER_CREATED '+r.body.user.id+' mode=anonymous');
    return {session:r.body,userId:r.body.user.id,mode:'anonymous'};
  }
  const email='qa-live-'+randomUUID()+'@gmail.com';
  const password=randomBytes(30).toString('base64url');
  r=await request(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:authHeaders,body:JSON.stringify({email,password})});
  const userId=r.body?.user?.id||r.body?.id||null;
  if(userId)console.log('QA_USER_CREATED '+userId+' mode=email');
  if(r.response.ok&&r.body?.access_token&&userId)return {session:r.body,userId,mode:'email'};
  if(!userId)throw new Error('Não foi possível provisionar usuário QA: HTTP '+r.response.status);
  console.log('QA_WAIT_CONFIRMATION '+userId);
  for(let i=0;i<120;i++){
    const sign=await request(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:authHeaders,body:JSON.stringify({email,password})});
    if(sign.response.ok&&sign.body?.access_token){
      console.log('QA_SESSION_OK '+userId);
      return {session:sign.body,userId,mode:'email'};
    }
    await pause(1000);
  }
  throw new Error('Usuário QA não obteve sessão após confirmação.');
}

async function waitAdmin(session,userId){
  const headers={'apikey':PUBLISHABLE,'Authorization':'Bearer '+session.access_token,'Content-Type':'application/json','Accept':'application/json'};
  for(let i=0;i<120;i++){
    const r=await request(SUPABASE_URL+'/functions/v1/admin-occurrences',{method:'POST',headers,body:JSON.stringify({action:'session'})});
    if(r.response.ok&&r.body?.authenticated===true){
      console.log('QA_ADMIN_AUTHORIZED '+userId+' role='+(r.body?.profile?.role||''));
      return;
    }
    if(i%10===0)console.log('QA_WAIT_ROLE '+userId+' status='+r.response.status);
    if(![401,403,503].includes(r.response.status))throw new Error('Admin session inesperada: '+r.response.status);
    await pause(1000);
  }
  throw new Error('Conta QA não recebeu autorização interna a tempo.');
}

async function waitPublicOccurrence(){
  const headers={'apikey':PUBLISHABLE,'Authorization':'Bearer '+LEGACY_ANON,'Accept':'application/json'};
  const url=SUPABASE_URL+'/rest/v1/occurrences?select=protocol,title,moderation_status,public_visible&protocol=eq.'+encodeURIComponent(PROTOCOL)+'&public_visible=eq.true&moderation_status=eq.approved';
  for(let i=0;i<120;i++){
    const r=await request(url,{headers});
    if(r.response.ok&&Array.isArray(r.body)&&r.body.some(x=>x.protocol===PROTOCOL)){
      console.log('QA_PUBLIC_OCCURRENCE_READY '+PROTOCOL);
      return;
    }
    await pause(1000);
  }
  throw new Error('Ocorrência QA não ficou disponível para a leitura pública.');
}

async function runBrowser(session){
  const port=4187,base='http://127.0.0.1:'+port;
  const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
  for(let i=0;i<50;i++){try{const r=await fetch(base+'/index.html');if(r.ok)break}catch{}await pause(100)}
  const profile=await mkdtemp(path.join(tmpdir(),'cidade-live-'));
  const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank']);
  let socket;const results=[];
  try{
    const endpoint=await new Promise((resolve,reject)=>{
      let log='';const timer=setTimeout(()=>reject(new Error('Chrome não iniciou: '+log)),30000);
      chrome.stderr.on('data',chunk=>{log+=chunk;const m=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1])}});
      chrome.once('error',reject);chrome.once('exit',code=>reject(new Error('Chrome encerrou: '+code)));
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
    const waitFor=async expression=>{for(let i=0;i<200;i++){try{if(await evaluate(expression))return}catch{}await pause(100)}throw new Error('Condição não atendida: '+expression)};
    const capture=async name=>{const m=await send('Page.getLayoutMetrics');const s=m.cssContentSize||m.contentSize||{width:1366,height:900};const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(s.width),height:Math.min(Math.ceil(s.height),5000),scale:1}});await writeFile(path.join(OUT,name+'.png'),Buffer.from(shot.data,'base64'))};

    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
    await navigate(base+'/index.html#/admin');
    const stored={access_token:session.access_token,refresh_token:session.refresh_token,expires_at:Number(session.expires_at)||Math.floor(Date.now()/1000)+3600,user:session.user||null};
    await evaluate(`sessionStorage.setItem('cidadeConectaAuthSessionV1',${JSON.stringify(JSON.stringify(stored))});location.reload();true`);
    await waitFor(`window.CidadeConectaAuth?.state?.status==='authorized'&&document.querySelector('#adminList')&&!document.querySelector('#adminList .skeletonStackV56')`);
    const adminText=await evaluate(`document.querySelector('#app').textContent`);
    assert.ok(adminText.includes(PROTOCOL));assert.ok(adminText.includes(TITLE));
    assert.ok(!adminText.includes('qa@example.invalid'));assert.ok(!adminText.includes('-22.725321'));
    await evaluate(`const x=document.querySelector('#adminSearch');x.value='${PROTOCOL}';x.dispatchEvent(new Event('input',{bubbles:true}));true`);
    await waitFor(`document.querySelectorAll('#adminList [data-admin-open]').length===1`);
    await evaluate(`document.querySelector('[data-admin-open="${PROTOCOL}"]').click();true`);
    await waitFor(`document.querySelector('#adminDetail')?.textContent?.includes('${TITLE}')`);
    const detailText=await evaluate(`document.querySelector('#adminDetail').textContent`);
    assert.ok(!detailText.includes('qa@example.invalid'));assert.ok(!detailText.includes('-22.725321'));
    await capture('admin-authenticated-real');results.push({gate:'admin-real-authenticated',status:'PASS'});

    badSupabase.length=0;jsErrors.length=0;
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
    await navigate(base+'/index.html#/mapa');
    await waitFor(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`);
    assert.ok(await evaluate(`Boolean(document.querySelector('[data-map-open="${PROTOCOL}"]'))`));
    await waitFor(`Boolean(window.L)&&document.querySelector('#publicMap')?.classList.contains('leaflet-container')`);
    await capture('mapa-real-390');results.push({gate:'mapa-real',status:'PASS'});

    await evaluate(`document.querySelector('[data-map-pane="list"]').click();true`);await pause(250);
    assert.ok(await evaluate(`document.querySelector('.mapExperienceV58')?.classList.contains('showListV53')`));
    assert.ok(await evaluate(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`));
    await capture('lista-real-390');results.push({gate:'lista-real',status:'PASS'});

    await evaluate(`document.querySelector('[data-map-pane="regions"]').click();true`);await pause(300);
    await waitFor(`!document.querySelector('[data-map-region="1"]').disabled`);
    const regionCount=await evaluate(`document.querySelector('[data-map-region-count="1"]').textContent`);
    assert.ok(/\\d/.test(regionCount));
    await capture('regioes-real-390');
    await evaluate(`document.querySelector('[data-map-region="1"]').click();document.querySelector('[data-map-pane="list"]').click();true`);await pause(250);
    assert.ok(await evaluate(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`));
    results.push({gate:'regioes-real',status:'PASS'});

    await evaluate(`document.querySelector('[data-map-open="${PROTOCOL}"]').click();document.querySelector('[data-map-pane="map"]').click();true`);await pause(900);
    const popup=await evaluate(`document.querySelector('.leaflet-popup-content')?.textContent||''`);
    assert.ok(popup.includes(TITLE));
    assert.deepEqual(jsErrors,[]);assert.deepEqual(badSupabase,[]);

    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
    await navigate(base+'/index.html#/mapa');
    await waitFor(`document.querySelector('#mapResults')?.textContent?.includes('${PROTOCOL}')`);
    assert.ok((await evaluate('document.documentElement.scrollWidth'))<=1367);
    await capture('mapa-real-1366');results.push({gate:'mapa-desktop-real',status:'PASS'});
  } finally {
    await writeFile(path.join(OUT,'results.json'),JSON.stringify(results,null,2));
    socket?.close();chrome.kill();server.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  }
}

const qa=await provisionSession();
await writeFile(path.join(OUT,'qa-user-id.txt'),qa.userId+'\n');
await waitAdmin(qa.session,qa.userId);
await waitPublicOccurrence();
await runBrowser(qa.session);
console.log('QA_LIVE_V2_PASS '+qa.userId);
