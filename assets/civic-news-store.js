/* Leitura pública de matérias editoriais publicadas pelo Cidade Conecta. */
((root)=>{
'use strict';
const CFG=root.CIDADE_CONECTA_CONFIG||{},sb=CFG.supabase||{};
const PUBLIC_MEDIA_ORIGIN='https://qzpofoxxrjunyayczcfu.supabase.co/storage/v1/object/public/occurrence-public-media/';
let state={posts:[],status:'idle',error:'',lastSuccess:0},pending=null,lastAttempt=0;
const escText=(v,max)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
const safeSlug=v=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v||''))?String(v):'';
const safeProtocol=v=>/^CC-\d{4}-\d{5}$/.test(String(v||''))?String(v):'';
const safeMedia=row=>{
  if(!row)return null;
  const key=String(row.storage_key||'');
  if(!/^CC-\d{4}-\d{5}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(key))return null;
  return{url:PUBLIC_MEDIA_ORIGIN+key.split('/').map(encodeURIComponent).join('/'),alt:escText(row.alt_text,180)};
};
const snapshot=()=>({posts:state.posts.map(x=>({...x,cover:x.cover?{...x.cover}:null})),status:state.status,error:state.error,lastSuccess:state.lastSuccess});
function emit(){root.dispatchEvent(new CustomEvent('cidadeconecta:news-data',{detail:snapshot()}))}
async function refresh(force=false){
  if(pending)return pending;
  if(!force&&Date.now()-lastAttempt<60000&&state.status!=='idle')return snapshot();
  lastAttempt=Date.now();
  if(!navigator.onLine){state={...state,status:'offline',error:'Sem conexão para atualizar as matérias.'};emit();return snapshot()}
  if(!sb.enabled||sb.projectRef!=='qzpofoxxrjunyayczcfu'||sb.url!=='https://qzpofoxxrjunyayczcfu.supabase.co'){state={...state,status:'unconfigured',error:'Leitura editorial não configurada.'};emit();return snapshot()}
  pending=(async()=>{
    state={...state,status:'loading',error:''};emit();
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{
      const params=new URLSearchParams({select:'id,slug,title,summary,body,category,featured,cover_protocol,published_at,updated_at',status:'eq.published',order:'featured.desc,published_at.desc',limit:'50'});
      const res=await fetch(sb.url+'/rest/v1/news_posts?'+params,{headers:{apikey:sb.publishableKey,Accept:'application/json'},cache:'no-store',signal:controller.signal});
      if(!res.ok)throw Error('news_read_unavailable');
      const rows=await res.json();
      const protocols=[...new Set((rows||[]).map(x=>safeProtocol(x.cover_protocol)).filter(Boolean))];
      const mediaMap=new Map();
      if(protocols.length){
        const filter='in.('+protocols.join(',')+')';
        const mparams=new URLSearchParams({select:'protocol,storage_key,mime_type,alt_text',protocol:filter});
        const mr=await fetch(sb.url+'/rest/v1/occurrence_public_media?'+mparams,{headers:{apikey:sb.publishableKey,Accept:'application/json'},cache:'no-store',signal:controller.signal});
        if(mr.ok){for(const row of await mr.json())mediaMap.set(row.protocol,safeMedia(row))}
      }
      const posts=(Array.isArray(rows)?rows:[]).map(row=>({
        id:escText(row.id,64),slug:safeSlug(row.slug),title:escText(row.title,160),summary:escText(row.summary,500),body:escText(row.body,20000),
        category:escText(row.category,60)||'cidade-conecta',featured:row.featured===true,coverProtocol:safeProtocol(row.cover_protocol),
        publishedAt:escText(row.published_at,50),updatedAt:escText(row.updated_at,50),cover:mediaMap.get(row.cover_protocol)||null,
      })).filter(x=>x.slug&&x.title);
      state={posts,status:'live',error:'',lastSuccess:Date.now()};emit();return snapshot();
    }catch(error){state={...state,status:error?.name==='AbortError'?'timeout':'error',error:'Não foi possível atualizar as matérias editoriais.'};emit();return snapshot()}
    finally{clearTimeout(timer);pending=null}
  })();
  return pending;
}
root.CidadeConectaNewsSource=Object.freeze({state:()=>snapshot(),refresh});
root.addEventListener('load',()=>refresh());
})(window);