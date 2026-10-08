(()=>{
'use strict';

const cfg=window.CIDADE_CONECTA_CONFIG||{};
const sb=cfg.supabase||{};
const STORAGE_KEY='cidadeConectaAuthSessionV1';
const ALLOWED_INTERNAL_ROLES=new Set(['triage','admin']);

const state={
  status:'checking',
  session:null,
  user:null,
  profile:null,
  lastError:null,
  lastCheckedAt:null
};

function configured(){
  return Boolean(sb.enabled&&sb.url&&sb.publishableKey);
}

function emit(){
  window.dispatchEvent(new CustomEvent('cidadeconecta:auth-state',{detail:{
    status:state.status,
    user:state.user?{id:state.user.id,email:state.user.email}:null,
    profile:state.profile?{id:state.profile.id,name:state.profile.name,role:state.profile.role}:null,
    lastError:state.lastError
  }}));
}

function saveSession(session){
  state.session=session||null;
  try{
    if(session)sessionStorage.setItem(STORAGE_KEY,JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  }catch{}
}

function readSession(){
  try{
    const raw=sessionStorage.getItem(STORAGE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    return parsed&&parsed.access_token&&parsed.refresh_token?parsed:null;
  }catch{
    return null;
  }
}

async function parseResponse(response){
  let payload=null;
  try{payload=await response.json()}catch{}
  if(response.ok)return payload;
  const message=payload?.msg||payload?.message||payload?.error_description||payload?.error||`Supabase HTTP ${response.status}`;
  const error=new Error(String(message));
  error.status=response.status;
  error.payload=payload;
  throw error;
}

function baseHeaders(token=null,extra={}){
  const out={'apikey':sb.publishableKey,'Accept':'application/json',...extra};
  if(token)out.Authorization=`Bearer ${token}`;
  return out;
}

async function authRequest(path,{method='GET',token=null,body=null}={}){
  if(!configured())throw new Error('Supabase não configurado');
  const response=await fetch(`${sb.url}/auth/v1/${path}`,{
    method,
    headers:baseHeaders(token,body?{'Content-Type':'application/json'}:{}),
    body:body?JSON.stringify(body):undefined,
    cache:'no-store'
  });
  return parseResponse(response);
}

function normalizeSession(payload){
  if(!payload?.access_token||!payload?.refresh_token)return null;
  const expiresAt=Number(payload.expires_at)||Math.floor(Date.now()/1000)+Number(payload.expires_in||3600);
  return {
    access_token:payload.access_token,
    refresh_token:payload.refresh_token,
    token_type:payload.token_type||'bearer',
    expires_at:expiresAt,
    user:payload.user||null
  };
}

async function refreshSession(){
  const current=state.session||readSession();
  if(!current?.refresh_token)throw new Error('Sessão indisponível');
  const payload=await authRequest('token?grant_type=refresh_token',{
    method:'POST',
    body:{refresh_token:current.refresh_token}
  });
  const session=normalizeSession(payload);
  if(!session)throw new Error('Não foi possível renovar a sessão');
  saveSession(session);
  return session;
}

async function ensureToken(){
  let session=state.session||readSession();
  if(!session)return null;
  const expiresAt=Number(session.expires_at||0);
  if(!expiresAt||expiresAt<=Math.floor(Date.now()/1000)+60){
    session=await refreshSession();
  }else{
    saveSession(session);
  }
  return session.access_token;
}

async function verifyInternalAccess(token){
  const response=await fetch(`${sb.url}/functions/v1/admin-occurrences`,{
    method:'POST',
    headers:baseHeaders(token,{'Content-Type':'application/json'}),
    body:JSON.stringify({action:'session'}),
    cache:'no-store'
  });
  let payload=null;
  try{payload=await response.json()}catch{}
  if(response.status===403){
    return {authorized:false,profile:payload?.profile||null,role:payload?.role||payload?.profile?.role||null};
  }
  if(!response.ok){
    const message=payload?.message||payload?.error||`Supabase HTTP ${response.status}`;
    const error=new Error(String(message));
    error.status=response.status;
    error.payload=payload;
    throw error;
  }
  return {authorized:payload?.authenticated===true,profile:payload?.profile||null,role:payload?.profile?.role||null};
}
async function init(){
  state.lastCheckedAt=new Date().toISOString();
  state.lastError=null;
  if(!configured()){
    state.status='error';
    state.lastError='Supabase não configurado';
    emit();
    return state;
  }
  const stored=readSession();
  if(!stored){
    state.status='anonymous';
    state.session=null;
    state.user=null;
    state.profile=null;
    emit();
    return state;
  }
  state.session=stored;
  try{
    const token=await ensureToken();
    if(!token)throw new Error('Sessão indisponível');
    const userPayload=await authRequest('user',{token});
    const user=userPayload?.user||userPayload;
    if(!user?.id)throw new Error('Usuário inválido');
    const access=await verifyInternalAccess(token);
    state.user=user;
    state.profile=access.profile;
    state.status=access.authorized&&access.profile&&ALLOWED_INTERNAL_ROLES.has(access.profile.role)?'authorized':'denied';
  }catch(error){
    saveSession(null);
    state.user=null;
    state.profile=null;
    state.status='anonymous';
    state.lastError=String(error?.message||error);
  }
  emit();
  return state;
}

async function signIn(email,password){
  state.lastError=null;
  const normalizedEmail=String(email||'').trim().toLowerCase();
  if(!normalizedEmail||!String(password||''))throw new Error('Informe e-mail e senha.');
  const payload=await authRequest('token?grant_type=password',{
    method:'POST',
    body:{email:normalizedEmail,password:String(password)}
  });
  const session=normalizeSession(payload);
  if(!session)throw new Error('Resposta de autenticação inválida.');
  saveSession(session);
  await init();
  if(state.status==='denied')throw new Error('Conta autenticada, mas sem permissão para o painel interno.');
  if(state.status!=='authorized')throw new Error('Não foi possível validar o acesso interno.');
  return state;
}

async function signOut(){
  try{
    const token=await ensureToken();
    if(token)await authRequest('logout',{method:'POST',token});
  }catch{}
  saveSession(null);
  state.user=null;
  state.profile=null;
  state.status='anonymous';
  state.lastError=null;
  emit();
}

async function invokeInternal(payload){
  const token=await ensureToken();
  if(!token)throw new Error('Sessão expirada. Entre novamente.');
  const response=await fetch(`${sb.url}/functions/v1/admin-occurrences`,{
    method:'POST',
    headers:baseHeaders(token,{'Content-Type':'application/json'}),
    body:JSON.stringify(payload||{}),
    cache:'no-store'
  });
  if(response.status===401){
    saveSession(null);
    state.status='anonymous';
    state.user=null;
    state.profile=null;
    emit();
  }
  return parseResponse(response);
}

const ready=init();

window.CidadeConectaAuth=Object.freeze({
  state,
  ready,
  init,
  signIn,
  signOut,
  invokeInternal,
  ensureToken,
  allowedRoles:Object.freeze(['triage','admin'])
});
})();