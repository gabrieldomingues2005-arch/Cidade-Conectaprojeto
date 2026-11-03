/* Preferências no aparelho e leitura pública: nenhuma sessão Auth é copiada. */
((root)=>{
'use strict';
const D=root.CidadeConectaData,KEY='cidadeConectaCitizenV1',CACHE='cidadeConectaPublicCacheV1',MAX_AGE=86400000;
const copy=v=>JSON.parse(JSON.stringify(v));
function createStore(storage,onChange=()=>{},clock=()=>Date.now()){
 let persistent=Boolean(storage),memory={following:[],recent:[],notices:[],snapshots:{},wardSince:{}};
 function load(){try{const raw=JSON.parse(storage?.getItem(KEY)||'null');if(raw&&typeof raw==='object')for(const key of Object.keys(memory))if(Object.hasOwn(raw,key))memory[key]=raw[key]}catch{persistent=false}}
 function safe(){
  memory.following=[...new Set((Array.isArray(memory.following)?memory.following:[]).filter(D.validProtocol))].slice(0,80);
  memory.recent=(Array.isArray(memory.recent)?memory.recent:[]).filter(x=>x&&((x.kind==='protocol'&&D.validProtocol(x.value))||(x.kind==='bairro'&&typeof x.value==='string'&&x.value.length<=90&&!/[@<>\d]/.test(x.value)))).slice(0,15).map(x=>({kind:x.kind,value:x.value,at:Number(x.at)||0}));
  memory.notices=(Array.isArray(memory.notices)?memory.notices:[]).filter(x=>x&&D.validProtocol(x.protocol)&&D.STATUSES.includes(x.status)&&clock()-(Number(x.at)||0)<30*MAX_AGE).slice(0,40).map(x=>({id:String(x.id).slice(0,160),protocol:x.protocol,category:Object.hasOwn(D.CATEGORIES,x.category)?x.category:'outros',bairro:D.publicText(x.bairro,90),status:x.status,type:['resolved','bairro','updated'].includes(x.type)?x.type:'updated',at:Number(x.at)||clock(),read:x.read===true}));
  if(!memory.snapshots||typeof memory.snapshots!=='object'||Array.isArray(memory.snapshots))memory.snapshots={};
  if(!memory.wardSince||typeof memory.wardSince!=='object'||Array.isArray(memory.wardSince))memory.wardSince={};
  memory.snapshots=Object.fromEntries(Object.entries(memory.snapshots).filter(([p,x])=>D.validProtocol(p)&&x&&D.STATUSES.includes(x.status)).slice(0,1000).map(([p,x])=>[p,{status:x.status,stamp:Number(x.stamp)||0}]));
  memory.wardSince=Object.fromEntries(Object.entries(memory.wardSince).filter(([w,n])=>w.length<=90&&Number.isFinite(Number(n))).map(([w,n])=>[w,Number(n)]));
 }
 function save(){safe();try{storage?.setItem(KEY,JSON.stringify(memory))}catch{persistent=false}onChange(state())}
 function state(){safe();return{...copy(memory),persistent,unread:memory.notices.filter(x=>!x.read).length}}
 load();safe();
 function follow(protocol,row){if(!D.validProtocol(protocol))return false;const has=memory.following.includes(protocol);memory.following=has?memory.following.filter(x=>x!==protocol):[protocol,...memory.following].slice(0,80);if(!has&&row){const o=D.project(row);if(o)memory.snapshots[protocol]={stamp:D.lastUpdate(o),status:o.status}}save();return!has}
 function recent(kind,value){if(kind==='protocol'&&!D.validProtocol(value))return;if(kind==='bairro'&&(!value||/[@<>\d]/.test(value)))return;memory.recent=[{kind,value,at:clock()},...memory.recent.filter(x=>x.kind!==kind||x.value!==value)].slice(0,15);save()}
 function reconcile(rows,wards=[]){
  const all=D.realRows(rows),names=wards.map(D.norm),next={},now=clock(),newNotices=[];
  for(const w of names)if(!Object.hasOwn(memory.wardSince,w))memory.wardSince[w]=now;
  for(const o of all){const own=memory.following.includes(o.protocol),ward=names.includes(D.norm(o.bairro));if(!own&&!ward)continue;const prior=memory.snapshots[o.protocol],stamp=D.lastUpdate(o),changed=prior&&(prior.status!==o.status||stamp>prior.stamp),freshWard=ward&&!prior&&(D.time(o.created)||0)>memory.wardSince[D.norm(o.bairro)];next[o.protocol]={stamp,status:o.status};if(!changed&&!freshWard)continue;
   const id=o.protocol+':'+stamp+':'+o.status;if(memory.notices.some(n=>n.id===id))continue;
   newNotices.push({id,protocol:o.protocol,category:o.category,bairro:o.bairro,status:o.status,type:o.status==='Resolvida'?'resolved':freshWard?'bairro':'updated',at:now,read:false});
  }
  const today=memory.notices.filter(n=>now-n.at<MAX_AGE).length;
  memory.notices=[...newNotices.slice(0,Math.min(5,Math.max(0,8-today))),...memory.notices].slice(0,40);
  memory.snapshots=next;memory.wardSince=Object.fromEntries(Object.entries(memory.wardSince).filter(([w])=>names.includes(w)));save();return newNotices.length;
 }
 return Object.freeze({state,follow,recent,reconcile,isFollowing:p=>memory.following.includes(p),read:id=>{const n=memory.notices.find(x=>x.id===id);if(n)n.read=true;save()},readAll:()=>{memory.notices.forEach(x=>x.read=true);save()},clearRecent:()=>{memory.recent=[];save()}});
}
function createSource({fetch:request,storage,config={},onChange=()=>{},online=()=>true,clock=()=>Date.now()}){
 let state={rows:[],status:'idle',complete:false,total:0,lastSuccess:0,error:'',cached:false},pending=null,lastAttempt=0;
 function emit(){onChange(snapshot())}
 function snapshot(){return{...state,rows:D.publicRows(state.rows)}}
 try{const c=JSON.parse(storage?.getItem(CACHE)||'null');if(c&&clock()-Number(c.at)<MAX_AGE&&Array.isArray(c.rows)){state={...state,rows:D.realRows(c.rows).slice(0,5000),status:'cached',complete:c.complete===true,total:Number(c.total)||0,lastSuccess:Number(c.at),cached:true}}}catch{}
 async function refresh(force=false){
  if(pending)return pending;if(!force&&clock()-lastAttempt<60000&&state.status!=='idle')return snapshot();
  lastAttempt=clock();const sb=config.supabase||{};
  if(!online()){state={...state,status:'offline',error:'Sem conexão. Exibindo apenas o conteúdo público já carregado.'};emit();return snapshot()}
  if(!sb.enabled){state={...state,status:'unconfigured',error:'Sem leitura pública online neste ambiente.'};emit();return snapshot()}
  if(sb.projectRef!=='qzpofoxxrjunyayczcfu'||sb.url!=='https://qzpofoxxrjunyayczcfu.supabase.co'){state={...state,status:'error',error:'Configuração pública do projeto não reconhecida.'};emit();return snapshot()}
  pending=(async()=>{
   state={...state,status:'loading',error:''};emit();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
   try{
    const all=[];let complete=false,total=null;
    for(let offset=0;offset<5000;offset+=500){
     const params=new URLSearchParams({select:'protocol,title,description,neighborhood_label,public_latitude,public_longitude,status,responsible_agency,public_visible,moderation_status,created_at,updated_at,resolved_at,categories(slug,name),occurrence_history(status,note,public_note,created_at)',public_visible:'eq.true',moderation_status:'eq.approved',order:'created_at.desc,protocol.desc',limit:'500',offset:String(offset)});
     const res=await request(sb.url+'/rest/v1/occurrences?'+params,{headers:{apikey:sb.publishableKey,Accept:'application/json',Prefer:'count=exact'},cache:'no-store',signal:controller.signal});
     if(!res.ok)throw new Error('public_read_unavailable');const page=await res.json();if(!Array.isArray(page))throw new Error('invalid_public_data');
     const n=Number(res.headers?.get('content-range')?.split('/')[1]);if(Number.isFinite(n))total=n;
     all.push(...page.map(D.remote).filter(Boolean));if(page.length<500||(total!==null&&all.length>=total)){complete=true;break}
    }
    state={rows:D.realRows(all),status:'live',complete,total:total??all.length,lastSuccess:clock(),error:'',cached:false};
    try{storage?.setItem(CACHE,JSON.stringify({rows:state.rows,complete,total:state.total,at:state.lastSuccess}))}catch{}
   }catch{state={...state,status:state.cached?'cached':'error',error:'A leitura pública está indisponível. Os dados anteriores, quando disponíveis, estão identificados como cache.'}}
   finally{clearTimeout(timer);pending=null;emit()}
   return snapshot();
  })();return pending;
 }
 return Object.freeze({state:snapshot,refresh});
}
root.CidadeConectaCitizenFactory=Object.freeze({createStore,createSource});
if(typeof document==='undefined')return;
let storage;try{storage=root.localStorage}catch{}
const event=(name,detail)=>root.dispatchEvent(new CustomEvent(name,{detail}));
root.CidadeConectaCitizen=createStore(storage,s=>event('cidadeconecta:citizen-state',s));
root.CidadeConectaPublicSource=createSource({fetch:root.fetch.bind(root),storage,config:root.CIDADE_CONECTA_CONFIG,onChange:s=>event('cidadeconecta:public-data',s),online:()=>root.navigator.onLine});
})(typeof window!=='undefined'?window:globalThis);
