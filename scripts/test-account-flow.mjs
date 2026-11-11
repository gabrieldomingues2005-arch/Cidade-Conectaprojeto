import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('assets/civic-account.js','utf8');
function harness({url='https://cidade-conecta-piracicaba.web.app/#/conta',respond,stored={},demo=null}={}){
 const calls=[],storage=new Map(Object.entries(stored)),events=[];
 const location=new URL(url);
 const session={access_token:'qa-access',refresh_token:'qa-refresh',expires_in:3600,user:{id:'qa-citizen',email:'qa@example.test'}};
 const context={URL,URLSearchParams,AbortController,setTimeout,clearTimeout,console,location,history:{replaceState(_s,_t,path){const next=new URL(path,location);location.href=next.href}},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},fetch:async(url,options={})=>{
  const req={url,method:options.method||'GET',body:options.body?JSON.parse(options.body):null,headers:options.headers};calls.push(req);
  const result=respond?.(req)||{status:200,body:url.includes('grant_type=password')?session:url.endsWith('/user')?{...session.user,email_confirmed_at:'2026-11-11T12:00:00Z'}:url.includes('/citizen-account')?{profile:{name:'QA',role:'citizen'},preferences:{},follows:[],neighborhoods:[],notifications:[]}:{id:'qa-citizen'}};
  return{ok:result.status<400,status:result.status,json:async()=>result.body};
 }};
 context.window={CIDADE_CONECTA_CONFIG:{supabase:{enabled:true,projectRef:'qzpofoxxrjunyayczcfu',url:'https://qzpofoxxrjunyayczcfu.supabase.co',publishableKey:'qa-public'}},CidadeConectaDemo:demo?{account:demo}:null,dispatchEvent:e=>events.push(e)};
 vm.runInNewContext(source,context);
 return{account:context.window.CidadeConectaAccount,calls,storage,events,location};
}
test('cadastro envia retorno exato da hospedagem atual sem query, hash ou privilégios',async()=>{
 const h=harness({url:'https://cidade-conecta-piracicaba.web.app/?utm_source=qr#/conta'});await h.account.ready;
 const out=await h.account.signUp(' QA@example.test ','UmaSenhaQA123!','QA');
 const req=h.calls[0];assert.equal(new URL(req.url).searchParams.get('redirect_to'),'https://cidade-conecta-piracicaba.web.app/');
 assert.deepEqual(req.body,{email:'qa@example.test',password:'UmaSenhaQA123!',data:{name:'QA'}});
 assert.equal(out.status,'pending');assert.equal(h.storage.size,0);
});
test('cadastro preserva compatibilidade do retorno no GitHub Pages',async()=>{
 const h=harness({url:'https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/#/conta'});await h.account.ready;await h.account.signUp('qa@example.test','UmaSenhaQA123!','QA');
 assert.equal(new URL(h.calls[0].url).searchParams.get('redirect_to'),'https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/');
});
test('confirmação limpa tokens da URL e valida usuário antes de abrir sessão cidadã',async()=>{
 const h=harness({url:'https://cidade-conecta-piracicaba.web.app/#access_token=qa-access&refresh_token=qa-refresh&expires_in=3600&type=signup',stored:{cidadeConectaDemoCitizenSessionV1:'1'}});await h.account.ready;
 assert.equal(h.location.hash,'#/conta');assert.equal(h.calls[0].url,'https://qzpofoxxrjunyayczcfu.supabase.co/auth/v1/user');
 assert.equal(h.calls[0].headers.Authorization,'Bearer qa-access');
 assert.equal(h.account.state().status,'authenticated');assert.equal(h.account.state().demo,false);
 assert.equal(h.storage.has('cidadeConectaDemoCitizenSessionV1'),false);
 assert.equal(h.storage.has('cidadeConectaAuthSessionV1'),false);
 assert.match(h.account.state().confirmationMessage,/confirmado/);
});
test('link expirado mostra orientação sem criar sessão ou chamar backend',async()=>{
 const h=harness({url:'https://cidade-conecta-piracicaba.web.app/#error=access_denied&error_code=otp_expired&error_description=raw'});await h.account.ready;
 assert.equal(h.location.hash,'#/conta');assert.equal(h.account.state().status,'anonymous');assert.match(h.account.state().error,/expirou/);assert.equal(h.calls.length,0);assert.equal(h.storage.size,0);
});
test('token inválido é recusado e nunca chega à Edge da conta',async()=>{
 const h=harness({url:'https://cidade-conecta-piracicaba.web.app/#access_token=bad&refresh_token=bad&type=signup',respond:()=>({status:401,body:{message:'invalid token'}})});await h.account.ready;
 assert.equal(h.account.state().status,'anonymous');assert.equal(h.calls.length,1);assert.equal(h.storage.size,0);
});
test('link incompleto ou de recuperação não inicia sessão de cadastro',async()=>{
 for(const hash of ['access_token=bad','access_token=bad&refresh_token=bad&type=recovery']){
  const h=harness({url:'https://cidade-conecta-piracicaba.web.app/#'+hash});await h.account.ready;
  assert.equal(h.account.state().status,'anonymous');assert.equal(h.calls.length,0);
 }
});
test('login carrega perfil e logout revoga só a sessão atual e limpa dados locais',async()=>{
 const h=harness();await h.account.ready;await h.account.signIn('qa@example.test','UmaSenhaQA123!');assert.equal(h.account.state().status,'authenticated');
 await h.account.signOut();assert.equal(h.account.state().status,'anonymous');assert.equal(h.storage.size,0);assert.ok(h.calls.some(x=>x.url.endsWith('/logout?scope=local')));
});
test('falha ao carregar perfil nunca é anunciada como login concluído',async()=>{
 const h=harness({respond:r=>r.url.includes('citizen-account')?{status:403,body:{error:'citizen_account_required'}}:null});await h.account.ready;
 await assert.rejects(h.account.signIn('qa@example.test','UmaSenhaQA123!'),/citizen_account_required/);assert.notEqual(h.account.state().status,'authenticated');
});
test('reenviar confirmação usa mesmo retorno e não persiste senha',async()=>{
 const h=harness();await h.account.ready;await h.account.resendConfirmation('qa@example.test');const req=h.calls[0];assert.equal(new URL(req.url).searchParams.get('redirect_to'),'https://cidade-conecta-piracicaba.web.app/');assert.deepEqual(req.body,{type:'signup',email:'qa@example.test'});assert.equal(h.storage.size,0);
});
test('senha DEMO incorreta e tentativa de cadastro DEMO ficam locais',async()=>{
 const h=harness({demo:{credentials:{email:'demo@example.test',password:'demo123!'}}});await h.account.ready;
 await assert.rejects(h.account.signIn('demo@example.test','errada'),/DEMO/);await assert.rejects(h.account.signUp('demo@example.test','UmaSenhaQA123!','QA'),/reservado/);assert.equal(h.calls.length,0);
});
