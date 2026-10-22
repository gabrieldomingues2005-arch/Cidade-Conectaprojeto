import fs from 'node:fs/promises';

const runtime=await fs.readFile('assets/runtime-config.js','utf8');
const pick=(name)=>{
  const m=runtime.match(new RegExp(name+"\\s*:\\s*'([^']+)'"));
  if(!m)throw new Error('runtime missing '+name);
  return m[1];
};
const base=pick('url');
const publishable=pick('publishableKey');
const anon=pick('legacyAnonJwt');
const headers={
  'content-type':'application/json',
  'apikey':publishable,
  'authorization':'Bearer '+anon,
  'origin':'https://gabrieldomingues2005-arch.github.io',
  'user-agent':'cidade-conecta-live-v2-ci'
};
const post=async(name,body)=>{
  const res=await fetch(base+'/functions/v1/'+name,{method:'POST',headers,body:JSON.stringify(body)});
  const text=await res.text();
  let json; try{json=JSON.parse(text)}catch{json={raw:text}}
  return {status:res.status,json};
};

const marker='QA backend v2 '+new Date().toISOString();
const submit=await post('submit-occurrence',{
  category:'vias',
  title:'QA integração backend v2',
  description:'Ocorrência controlada para validar submissão, protocolo, tracking e leitura pública do Cidade Conecta v2.',
  neighborhood:'Centro',
  address:'',
  latitude:-22.7253,
  longitude:-47.6492,
  contact:{},
  website:''
});
if(submit.status!==201)throw new Error('submit failed '+JSON.stringify(submit));
if(!submit.json.protocol||!submit.json.trackingKey)throw new Error('submit missing protocol/tracking');

await new Promise(r=>setTimeout(r,1100));
const track=await post('track-occurrence',{
  protocol:submit.json.protocol,
  trackingKey:submit.json.trackingKey
});
if(track.status!==200||!track.json.occurrence)throw new Error('track failed '+JSON.stringify(track));
if(track.json.occurrence.protocol!==submit.json.protocol)throw new Error('track protocol mismatch');

const publicBefore=await fetch(base+'/rest/v1/occurrences?select=protocol,title,status,moderation_status,public_latitude,public_longitude&protocol=eq.'+encodeURIComponent(submit.json.protocol),{
  headers:{apikey:publishable,authorization:'Bearer '+anon,accept:'application/json'}
});
const publicBeforeRows=await publicBefore.json();
if(!Array.isArray(publicBeforeRows))throw new Error('public REST invalid');

const admin=await post('admin-occurrences',{action:'session'});
if(admin.status!==401)throw new Error('admin without user should be 401, got '+admin.status);

const result={
  marker,
  protocol:submit.json.protocol,
  trackingKey:submit.json.trackingKey,
  moderationStatus:submit.json.moderationStatus,
  trackStatus:track.json.occurrence.status,
  trackModeration:track.json.occurrence.moderation_status,
  publicRowsBeforeApproval:publicBeforeRows.length,
  adminAnonymousStatus:admin.status
};
await fs.mkdir('artifacts/live-v2',{recursive:true});
await fs.writeFile('artifacts/live-v2/result.json',JSON.stringify(result,null,2));
console.log('LIVE_V2_RESULT '+JSON.stringify(result));
