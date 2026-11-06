/* Conta cidadã opcional: sessão real separada do Admin + conta DEMO isolada. */
(()=>{
'use strict';
const cfg=window.CIDADE_CONECTA_CONFIG?.supabase||{},KEY='cidadeConectaCitizenAccountSessionV1',DEMO_KEY='cidadeConectaDemoCitizenSessionV1',DEMO_STATE_KEY='cidadeConectaDemoCitizenStateV1',TIMEOUT=12000;
let refreshPromise=null;
const state={status:'checking',session:null,user:null,profile:null,preferences:null,follows:[],neighborhoods:[],notifications:[],unread:0,error:'',pendingVerification:false,demo:false,weekly:null,milestones:[],created:[],saved:[],recent:[]};

const emit=()=>window.dispatchEvent(new CustomEvent('cidadeconecta:account-state',{detail:snapshot()}));
const snapshot=()=>({status:state.status,user:state.user?{id:state.user.id,email:state.user.email}:null,profile:state.profile?{...state.profile}:null,preferences:state.preferences?{...state.preferences}:null,follows:[...state.follows],neighborhoods:[...state.neighborhoods],notifications:state.notifications.map(x=>({...x})),unread:state.unread,error:state.error,pendingVerification:state.pendingVerification,demo:state.demo,weekly:state.weekly?{...state.weekly}:null,milestones:state.milestones.map(x=>({...x})),created:[...state.created],saved:[...state.saved],recent:state.recent.map(x=>({...x}))});
const configured=()=>Boolean(cfg.enabled&&cfg.projectRef==='qzpofoxxrjunyayczcfu'&&cfg.url==='https://qzpofoxxrjunyayczcfu.supabase.co'&&cfg.publishableKey);
const demoAccount=()=>window.CidadeConectaDemo?.account||null;
function saveSession(session){state.session=session||null;try{session?sessionStorage.setItem(KEY,JSON.stringify(session)):sessionStorage.removeItem(KEY)}catch{}}
function readSession(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');return x?.access_token&&x?.refresh_token?x:null}catch{return null}}
function demoActive(){try{return sessionStorage.getItem(DEMO_KEY)==='1'}catch{return false}}
function setDemoActive(on){try{on?sessionStorage.setItem(DEMO_KEY,'1'):sessionStorage.removeItem(DEMO_KEY)}catch{}}
function readDemoState(){try{return JSON.parse(sessionStorage.getItem(DEMO_STATE_KEY)||'null')||{}}catch{return{}}}
function writeDemoState(value){try{sessionStorage.setItem(DEMO_STATE_KEY,JSON.stringify(value))}catch{}}
function clearDemoState(){try{sessionStorage.removeItem(DEMO_STATE_KEY);sessionStorage.removeItem(DEMO_KEY)}catch{}}
function resetState(){Object.assign(state,{status:'anonymous',session:null,user:null,profile:null,preferences:null,follows:[],neighborhoods:[],notifications:[],unread:0,error:'',pendingVerification:false,demo:false,weekly:null,milestones:[],created:[],saved:[],recent:[]})}
function applyDemo(){
 const data=demoAccount();if(!data)return null;
 const local=readDemoState(),readIds=new Set(Array.isArray(local.readIds)?local.readIds:[]),preferences={...data.preferences,...(local.preferences||{})};
 state.session=null;state.user={id:data.profile.id,email:data.credentials.email};state.profile={...data.profile};state.preferences=preferences;
 state.follows=Array.isArray(local.follows)?[...local.follows]:[...data.follows];
 state.neighborhoods=Array.isArray(local.neighborhoods)?[...local.neighborhoods]:[...data.neighborhoods];
 state.notifications=data.notifications.map(n=>({...n,read_at:n.read_at||readIds.has(n.id)?(n.read_at||new Date().toISOString()):null}));
 state.unread=state.notifications.filter(n=>!n.read_at).length;state.status='authenticated';state.error='';state.pendingVerification=false;state.demo=true;
 state.weekly={...data.weekly};state.milestones=data.milestones.map(x=>({...x}));state.created=[...data.created];state.saved=[...data.saved];state.recent=data.recent.map(x=>({...x}));
 emit();return snapshot()
}
function persistDemo(){
 if(!state.demo)return;
 writeDemoState({follows:[...state.follows],neighborhoods:[...state.neighborhoods],preferences:{...state.preferences},readIds:state.notifications.filter(n=>n.read_at).map(n=>n.id)})
}
async function fetchTimed(url,options={}){const c=new AbortController(),t=setTimeout(()=>c.abort(),TIMEOUT);try{return await fetch(url,{...options,signal:c.signal,cache:'no-store'})}finally{clearTimeout(t)}}
async function parse(res){let body=null;try{body=await res.json()}catch{}if(res.ok)return body;const e=new Error(String(body?.msg||body?.message||body?.error_description||body?.error||('HTTP '+res.status)));e.status=res.status;e.payload=body;throw e}
const headers=(token,extra={})=>({apikey:cfg.publishableKey,...(token?{Authorization:'Bearer '+token}:{}),...extra});
function normalize(payload){if(!payload?.access_token||!payload?.refresh_token)return null;return{access_token:payload.access_token,refresh_token:payload.refresh_token,expires_at:Number(payload.expires_at)||Math.floor(Date.now()/1000)+Number(payload.expires_in||3600),user:payload.user||null}}
async function auth(path,{method='GET',token=null,body=null}={}){return parse(await fetchTimed(cfg.url+'/auth/v1/'+path,{method,headers:headers(token,body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined}))}
async function refreshSession(){if(refreshPromise)return refreshPromise;refreshPromise=(async()=>{const s=state.session||readSession();if(!s?.refresh_token)throw Error('Sessão indisponível');const p=await auth('token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}}),n=normalize(p);if(!n)throw Error('Sessão inválida');saveSession(n);return n})();try{return await refreshPromise}finally{refreshPromise=null}}
async function token(){let s=state.session||readSession();if(!s)return null;if(Number(s.expires_at||0)<=Math.floor(Date.now()/1000)+60)s=await refreshSession();else saveSession(s);return s.access_token}
async function invoke(action,payload={}){if(state.demo)throw Error('A conta DEMO não envia alterações ao servidor.');let t=await token();if(!t)throw Error('Entre na sua conta para sincronizar.');let res=await fetchTimed(cfg.url+'/functions/v1/citizen-account',{method:'POST',headers:headers(t,{'Content-Type':'application/json'}),body:JSON.stringify({action,...payload})});if(res.status===401){const s=await refreshSession();t=s.access_token;res=await fetchTimed(cfg.url+'/functions/v1/citizen-account',{method:'POST',headers:headers(t,{'Content-Type':'application/json'}),body:JSON.stringify({action,...payload})})}return parse(res)}
function applyProfile(data){state.demo=false;state.weekly=null;state.milestones=[];state.created=[];state.saved=[];state.recent=[];state.profile=data?.profile||null;state.preferences=data?.preferences||null;state.follows=(data?.follows||[]).map(x=>x.protocol).filter(Boolean);state.neighborhoods=(data?.neighborhoods||[]).map(x=>x.neighborhood_label).filter(Boolean);state.notifications=Array.isArray(data?.notifications)?data.notifications:[];state.unread=Number(data?.unread)||0;state.status='authenticated';state.error='';state.pendingVerification=false;emit();return snapshot()}
async function refreshProfile(){if(state.demo)return applyDemo()||snapshot();if(!state.session&&!readSession())return snapshot();try{return applyProfile(await invoke('profile'))}catch(e){state.error=String(e?.message||e);if(Number(e?.status)===401){saveSession(null);state.user=null;state.profile=null;state.status='anonymous'}else state.status='error';emit();return snapshot()}}
async function syncLocal(){if(state.demo||state.status!=='authenticated')return snapshot();const C=window.CidadeConectaCitizen,U=window.CidadeConectaUI,protocols=C?.state?.().following||[],neighborhoods=U?.favoriteNames?.()||[];if(protocols.length||neighborhoods.length){await invoke('sync_local',{protocols,neighborhoods});await refreshProfile()}return snapshot()}
async function init(){state.error='';if(demoActive()&&demoAccount()){saveSession(null);return applyDemo()}if(!configured()){state.status='unconfigured';emit();return snapshot()}const s=readSession();if(!s){state.status='anonymous';emit();return snapshot()}state.session=s;try{const t=await token(),u=await auth('user',{token:t});state.user=u?.user||u;await refreshProfile();await syncLocal()}catch(e){saveSession(null);state.user=null;state.profile=null;state.status='anonymous';state.error=String(e?.message||e);emit()}return snapshot()}
async function signIn(email,password){
 const normalized=String(email||'').trim().toLowerCase(),secret=String(password||''),demo=demoAccount();
 if(demo&&normalized===String(demo.credentials.email).toLowerCase()&&secret===String(demo.credentials.password)){
  saveSession(null);setDemoActive(true);return applyDemo()
 }
 clearDemoState();
 if(!configured())throw Error('Conta indisponível neste ambiente.');
 const p=await auth('token?grant_type=password',{method:'POST',body:{email:normalized,password:secret}}),s=normalize(p);if(!s)throw Error('Não foi possível iniciar a sessão.');saveSession(s);state.user=s.user||null;await refreshProfile();await syncLocal();return snapshot()
}
async function signUp(email,password,name){clearDemoState();if(!configured())throw Error('Conta indisponível neste ambiente.');const p=await auth('signup',{method:'POST',body:{email:String(email||'').trim().toLowerCase(),password:String(password||''),data:{name:String(name||'').trim().slice(0,80)}}}),s=normalize(p);if(s){saveSession(s);state.user=s.user||null;await refreshProfile();await syncLocal();return snapshot()}state.status='pending';state.pendingVerification=true;state.error='';emit();return snapshot()}
async function signOut(){if(state.demo){clearDemoState();resetState();emit();return}try{const t=await token();if(t)await auth('logout',{method:'POST',token:t})}catch{}saveSession(null);resetState();emit()}
async function follow(protocol,on=true){
 if(state.demo){const list=new Set(state.follows);on?list.add(String(protocol)):list.delete(String(protocol));state.follows=[...list];persistDemo();emit();return{following:on,protocol}}
 const r=await invoke(on?'follow':'unfollow',{protocol});await refreshProfile();return r
}
async function favorite(neighborhood,on=true){
 if(state.demo){const list=new Set(state.neighborhoods);on?list.add(String(neighborhood)):list.delete(String(neighborhood));state.neighborhoods=[...list];persistDemo();emit();return{favorite:on,neighborhood}}
 const r=await invoke(on?'favorite_neighborhood':'unfavorite_neighborhood',{neighborhood});await refreshProfile();return r
}
async function savePreferences(payload){
 if(state.demo){state.preferences={...state.preferences,display_name:String(payload.displayName||state.preferences?.display_name||'Gabriel Demo').slice(0,80),notify_occurrences:payload.notifyOccurrences!==false,notify_neighborhoods:payload.notifyNeighborhoods!==false,digest_frequency:['none','daily','weekly'].includes(payload.digestFrequency)?payload.digestFrequency:'weekly',updated_at:new Date().toISOString()};persistDemo();emit();return{saved:true,preferences:{...state.preferences}}}
 const r=await invoke('save_preferences',payload);await refreshProfile();return r
}
async function markNotification(id){
 if(state.demo){state.notifications=state.notifications.map(n=>n.id===id?{...n,read_at:n.read_at||new Date().toISOString()}:n);state.unread=state.notifications.filter(n=>!n.read_at).length;persistDemo();emit();return{read:true,id}}
 const r=await invoke('mark_notification',{id});await refreshProfile();return r
}
async function markAll(){
 if(state.demo){const now=new Date().toISOString();state.notifications=state.notifications.map(n=>({...n,read_at:n.read_at||now}));state.unread=0;persistDemo();emit();return{readAll:true}}
 const r=await invoke('mark_all_notifications');await refreshProfile();return r
}
function demoCredentials(){const d=demoAccount()?.credentials;return d?{email:d.email,password:d.password}:null}

const ready=init();
window.CidadeConectaAccount=Object.freeze({state:()=>snapshot(),ready,init,refresh:refreshProfile,signIn,signUp,signOut,follow,favorite,savePreferences,markNotification,markAll,syncLocal,invoke,demoCredentials});
})();