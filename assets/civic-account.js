/* Conta cidadã opcional: sessão real separada do Admin + conta DEMO isolada. */
(()=>{
'use strict';
const cfg=window.CIDADE_CONECTA_CONFIG?.supabase||{},KEY='cidadeConectaCitizenAccountSessionV1',DEMO_KEY='cidadeConectaDemoCitizenSessionV1',DEMO_STATE_KEY='cidadeConectaDemoCitizenStateV1',TIMEOUT=12000;
let refreshPromise=null,revision=0;
const state={status:'checking',session:null,user:null,profile:null,preferences:null,follows:[],neighborhoods:[],notifications:[],unread:0,error:'',pendingVerification:false,pendingEmail:'',confirmationMessage:'',demo:false,weekly:null,milestones:[],activity:[],recommendations:[],created:[],saved:[],recent:[]};

const emit=()=>window.dispatchEvent(new CustomEvent('cidadeconecta:account-state',{detail:snapshot()}));
const snapshot=()=>({status:state.status,user:state.user?{id:state.user.id,email:state.user.email}:null,profile:state.profile?{...state.profile}:null,preferences:state.preferences?{...state.preferences}:null,follows:[...state.follows],neighborhoods:[...state.neighborhoods],notifications:state.notifications.map(x=>({...x})),unread:state.unread,error:state.error,pendingVerification:state.pendingVerification,pendingEmail:state.pendingEmail,confirmationMessage:state.confirmationMessage,demo:state.demo,weekly:state.weekly?{...state.weekly}:null,milestones:state.milestones.map(x=>({...x})),activity:state.activity.map(x=>({...x})),recommendations:state.recommendations.map(x=>({...x})),created:[...state.created],saved:[...state.saved],recent:state.recent.map(x=>({...x}))});
const configured=()=>Boolean(cfg.enabled&&cfg.projectRef==='qzpofoxxrjunyayczcfu'&&cfg.url==='https://qzpofoxxrjunyayczcfu.supabase.co'&&cfg.publishableKey);
const demoAccount=()=>window.CidadeConectaDemo?.account||null;
const scope=()=>state.demo?'demo':state.user?.id?'account:'+state.user.id:state.status==='checking'?'checking':'';
function saveSession(session){state.session=session||null;try{session?sessionStorage.setItem(KEY,JSON.stringify(session)):sessionStorage.removeItem(KEY)}catch{}}
function readSession(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');return x?.access_token&&x?.refresh_token?x:null}catch{return null}}
function demoActive(){try{return sessionStorage.getItem(DEMO_KEY)==='1'}catch{return false}}
function setDemoActive(on){try{on?sessionStorage.setItem(DEMO_KEY,'1'):sessionStorage.removeItem(DEMO_KEY)}catch{}}
function readDemoState(){try{return JSON.parse(sessionStorage.getItem(DEMO_STATE_KEY)||'null')||{}}catch{return{}}}
function writeDemoState(value){try{sessionStorage.setItem(DEMO_STATE_KEY,JSON.stringify(value))}catch{}}
function clearDemoState(){try{sessionStorage.removeItem(DEMO_STATE_KEY);sessionStorage.removeItem(DEMO_KEY)}catch{}}
function resetState(){revision++;refreshPromise=null;Object.assign(state,{status:'anonymous',session:null,user:null,profile:null,preferences:null,follows:[],neighborhoods:[],notifications:[],unread:0,error:'',pendingVerification:false,pendingEmail:'',confirmationMessage:'',demo:false,weekly:null,milestones:[],activity:[],recommendations:[],created:[],saved:[],recent:[]})}
function applyDemo(){
 const data=demoAccount();if(!data)return null;
 const local=readDemoState(),readIds=new Set(Array.isArray(local.readIds)?local.readIds:[]),preferences={...data.preferences,...(local.preferences||{})};
 state.session=null;state.user={id:data.profile.id,email:data.credentials.email};state.profile={...data.profile};state.preferences=preferences;
 state.follows=Array.isArray(local.follows)?[...local.follows]:[...data.follows];
 state.neighborhoods=Array.isArray(local.neighborhoods)?[...local.neighborhoods]:[...data.neighborhoods];
 state.notifications=data.notifications.map(n=>({...n,read_at:n.read_at||readIds.has(n.id)?(n.read_at||new Date().toISOString()):null}));
 state.unread=state.notifications.filter(n=>!n.read_at).length;state.status='authenticated';state.error='';state.pendingVerification=false;state.demo=true;
 state.weekly={...data.weekly};state.milestones=data.milestones.map(x=>({...x}));state.activity=(data.activity||[]).map(x=>({...x}));state.recommendations=(data.recommendations||[]).map(x=>({...x}));state.created=[...data.created];state.saved=Array.isArray(local.saved)?[...local.saved]:[...data.saved];state.recent=data.recent.map(x=>({...x}));
 emit();return snapshot()
}
function persistDemo(){
 if(!state.demo)return;
 writeDemoState({follows:[...state.follows],neighborhoods:[...state.neighborhoods],saved:[...state.saved],preferences:{...state.preferences},readIds:state.notifications.filter(n=>n.read_at).map(n=>n.id)})
}
async function fetchTimed(url,options={}){const c=new AbortController(),t=setTimeout(()=>c.abort(),TIMEOUT);try{return await fetch(url,{...options,signal:c.signal,cache:'no-store'})}finally{clearTimeout(t)}}
async function parse(res){let body=null;try{body=await res.json()}catch{}if(res.ok)return body;const e=new Error(String(body?.msg||body?.message||body?.error_description||body?.error||('HTTP '+res.status)));e.status=res.status;e.code=body?.error_code||body?.code;e.payload=body;throw e}
const headers=(token,extra={})=>({apikey:cfg.publishableKey,...(token?{Authorization:'Bearer '+token}:{}),...extra});
function normalize(payload){if(!payload?.access_token||!payload?.refresh_token)return null;return{access_token:payload.access_token,refresh_token:payload.refresh_token,expires_at:Number(payload.expires_at)||Math.floor(Date.now()/1000)+Number(payload.expires_in||3600),user:payload.user||null}}
async function auth(path,{method='GET',token=null,body=null}={}){return parse(await fetchTimed(cfg.url+'/auth/v1/'+path,{method,headers:headers(token,body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined}))}
async function refreshSession(){
 if(refreshPromise)return refreshPromise;
 const session=state.session||readSession(),current=revision;
 if(!session?.refresh_token)throw Error('Sessão indisponível');
 const pending=refreshPromise=(async()=>{
  const data=await auth('token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}),next=normalize(data);
  if(!next||current!==revision)throw Error('Sessão inválida');
  saveSession(next);return next
 })();
 try{return await pending}finally{if(refreshPromise===pending)refreshPromise=null}
}
async function token(){let s=state.session||readSession();if(!s)return null;if(Number(s.expires_at||0)<=Math.floor(Date.now()/1000)+60)s=await refreshSession();else saveSession(s);return s.access_token}
async function invoke(action,payload={}){
 if(state.demo)throw Error('A conta DEMO não envia alterações ao servidor.');
 const current=revision;
 const request=t=>{
  if(!t||current!==revision)throw Error('Entre na sua conta para continuar.');
  return fetchTimed(cfg.url+'/functions/v1/citizen-account',{method:'POST',headers:headers(t,{'Content-Type':'application/json'}),body:JSON.stringify({action,...payload})})
 };
 let res=await request(await token());
 if(res.status===401&&current===revision)res=await request((await refreshSession()).access_token);
 if(current!==revision)throw Error('A sessão mudou.');
 return parse(res)
}
function applyProfile(data){state.demo=false;state.weekly=null;state.milestones=[];state.activity=[];state.recommendations=[];state.created=[];state.saved=[];state.recent=[];state.profile=data?.profile||null;state.preferences=data?.preferences||null;state.follows=(data?.follows||[]).map(x=>x.protocol).filter(Boolean);state.neighborhoods=(data?.neighborhoods||[]).map(x=>x.neighborhood_label).filter(Boolean);state.notifications=Array.isArray(data?.notifications)?data.notifications:[];state.unread=Number(data?.unread)||0;state.status='authenticated';state.error='';state.pendingVerification=false;emit();return snapshot()}
async function refreshProfile(){
 if(state.demo)return applyDemo()||snapshot();
 if(!state.session&&!readSession())return snapshot();
 const current=revision;
 try{const data=await invoke('profile');if(current===revision)return applyProfile(data)}
 catch(e){if(current===revision){if(Number(e?.status)===401){saveSession(null);resetState()}else state.status='error';state.error=String(e?.message||e);emit()}}
 return snapshot()
}
async function syncLocal(){
 if(state.demo||state.status!=='authenticated')return snapshot();
 const protocols=window.CidadeConectaCitizen?.visitorState?.().following||[],neighborhoods=window.CidadeConectaUI?.visitorFavoriteNames?.()||[];
 if(protocols.length||neighborhoods.length){await invoke('sync_local',{protocols,neighborhoods});await refreshProfile()}
 return snapshot()
}
function confirmationUrl(){
 const url=new URL(location.href);url.hash='';url.search='';return url.href
}
function confirmationFromUrl(){
 const hash=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search);
 if(!hash.has('access_token')&&!hash.has('error')&&!query.has('error'))return null;
 // Retira credenciais e erros da barra antes de iniciar qualquer chamada de rede.
 history.replaceState(null,'',location.pathname+'#/conta');
 return{params:hash.has('access_token')||hash.has('error')?hash:query}
}
async function consumeConfirmation(callback){
 clearDemoState();saveSession(null);resetState();
 const params=callback.params;
 try{
  if(params.has('error'))throw Error('O link de confirmação expirou ou já foi usado. Entre com sua senha se o e-mail já foi confirmado, ou solicite outro link.');
  if(!['signup','email'].includes(params.get('type')||'signup'))throw Error('Este link não é uma confirmação de cadastro.');
  const session=normalize(Object.fromEntries(params));
  if(!session)throw Error('Link de confirmação incompleto. Solicite outro e-mail.');
  const user=await auth('user',{token:session.access_token});
  if(!user?.id||!user.email_confirmed_at)throw Error('Não foi possível validar a confirmação. Solicite outro e-mail.');
  session.user=user;
  await startSession(session);
  state.confirmationMessage='E-mail confirmado. Sua conta está conectada.';emit();
 }catch(e){
  if(!state.session)resetState();
  state.error=String(e?.message||'Não foi possível confirmar o e-mail.');emit();
 }
 return snapshot()
}
async function init(){
 const callback=confirmationFromUrl();
 if(callback)return consumeConfirmation(callback);
 state.error='';
 if(demoActive()&&demoAccount()){saveSession(null);return applyDemo()}
 if(!configured()){state.status='unconfigured';emit();return snapshot()}
 const session=readSession();if(!session){state.status='anonymous';emit();return snapshot()}
 const current=revision;state.session=session;
 try{const t=await token(),user=await auth('user',{token:t});if(current===revision){state.user=user?.user||user;await refreshProfile()}}
 catch(e){if(current===revision){saveSession(null);resetState();state.error=String(e?.message||e);emit()}}
 return snapshot()
}
async function startSession(session){
 clearDemoState();resetState();saveSession(session);state.user=session.user||null;state.status='checking';emit();
 const result=await refreshProfile();
 if(result.status!=='authenticated')throw Error(result.error||'Não foi possível carregar sua conta. Tente entrar novamente.');
 return result
}
async function signIn(email,password){
 const normalized=String(email||'').trim().toLowerCase(),secret=String(password||''),demo=demoAccount();
 if(demo&&normalized===String(demo.credentials.email).toLowerCase()&&secret===String(demo.credentials.password)){
  resetState();saveSession(null);setDemoActive(true);return applyDemo()
 }
 if(demo&&normalized===String(demo.credentials.email).toLowerCase())throw Error('Senha da conta DEMO incorreta. Use os dados exibidos na tela.');
 if(!configured())throw Error('Conta indisponível neste ambiente.');
 const current=revision;
 const data=await auth('token?grant_type=password',{method:'POST',body:{email:normalized,password:secret}}),session=normalize(data);
 if(!session)throw Error('Não foi possível iniciar a sessão.');
 return current===revision?startSession(session):snapshot()
}
async function signUp(email,password,name){
 if(!configured())throw Error('Conta indisponível neste ambiente.');
 const current=revision;
 const normalized=String(email||'').trim().toLowerCase();
 if(normalized===demoAccount()?.credentials.email?.toLowerCase())throw Error('O e-mail DEMO é reservado para a demonstração.');
 const data=await auth('signup?redirect_to='+encodeURIComponent(confirmationUrl()),{method:'POST',body:{email:normalized,password:String(password||''),data:{name:String(name||'').trim().slice(0,80)}}}),session=normalize(data);
 if(current!==revision)return snapshot();
 if(session)return startSession(session);
 clearDemoState();saveSession(null);resetState();state.status='pending';state.pendingVerification=true;state.pendingEmail=normalized;emit();return snapshot()
}
async function resendConfirmation(email){
 if(!configured())throw Error('Conta indisponível neste ambiente.');
 const normalized=String(email||state.pendingEmail||'').trim().toLowerCase();
 if(!normalized||normalized===demoAccount()?.credentials.email?.toLowerCase())throw Error('Informe o e-mail da sua conta real.');
 await auth('resend?redirect_to='+encodeURIComponent(confirmationUrl()),{method:'POST',body:{type:'signup',email:normalized}});
 return snapshot()
}
function showLogin(){state.pendingVerification=false;state.pendingEmail='';state.error='';state.status='anonymous';emit()}
function errorText(error){
 const code=error?.code||error?.payload?.error_code||error?.payload?.code;
 if(code==='invalid_credentials')return 'E-mail ou senha incorretos.';
 if(code==='email_not_confirmed')return 'Confirme seu e-mail antes de entrar. Você pode solicitar outro link abaixo.';
 if(code==='over_email_send_rate_limit'||Number(error?.status)===429)return 'Aguarde alguns minutos antes de solicitar outro e-mail.';
 if(code==='email_address_not_authorized')return 'O serviço de e-mail ainda precisa ser configurado para enviar confirmações a este endereço.';
 if(code==='weak_password')return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
 if(error?.name==='AbortError'||error instanceof TypeError)return 'Não foi possível conectar. Verifique a internet e tente novamente.';
 return String(error?.message||'Não foi possível concluir. Tente novamente.')
}
async function signOut(){
 const t=state.session?.access_token;clearDemoState();saveSession(null);resetState();emit();
 if(t)try{await auth('logout?scope=local',{method:'POST',token:t})}catch{}
}
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
function resetDemo(){
 if(!state.demo)return snapshot();
 clearDemoState();setDemoActive(true);return applyDemo()||snapshot()
}
function demoCredentials(){const d=demoAccount()?.credentials;return d?{email:d.email,password:d.password}:null}

function toggleDemoSaved(protocol){
 if(!state.demo||!window.CidadeConectaDemo.rows.some(o=>o.protocol===protocol))return false;
 const saved=!state.saved.includes(protocol);
 state.saved=saved?[protocol,...state.saved]:state.saved.filter(p=>p!==protocol);
 persistDemo();emit();return saved
}

const ready=init();
window.CidadeConectaAccount=Object.freeze({state:snapshot,scope,ready,init,refresh:refreshProfile,signIn,signUp,signOut,resendConfirmation,showLogin,errorText,follow,favorite,savePreferences,markNotification,markAll,syncLocal,invoke,demoCredentials,resetDemo,toggleDemoSaved});
})();