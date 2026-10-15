import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const source=readFileSync(new URL('../assets/auth.js',import.meta.url),'utf8');
const key='cidadeConectaAuthSessionV1';
const session=()=>({access_token:'test-access',refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600});
const response=(status,payload)=>new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}});
async function harness({stored=session(),role='triage',authenticated=true,userStatus=200,accessStatus=200,refreshStatus=200,invalidUser=false,network=false,timeout=false}={}){
 const storage=new Map(stored?[[key,JSON.stringify(stored)]]:[]),calls=[];
 let mode={status:200,network:false,timeout:false};
 const fetch=async(url,options)=>{
  calls.push({url,options});
  if(network||mode.network)throw new TypeError('offline');
  if(timeout||mode.timeout)return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(new Error('timeout'),{name:'AbortError'}))));
  if(url.includes('grant_type=refresh_token'))return response(refreshStatus,{...session(),user:{id:'test-user'}});
  if(url.includes('grant_type=password'))return response(200,{...session(),user:{id:'test-user'}});
  if(url.endsWith('/user'))return response(userStatus,invalidUser?{}:{id:'test-user'});
  const body=JSON.parse(options.body||'{}');
  if(body.action==='session')return response(accessStatus,{authenticated,profile:{id:'test-profile',role}});
  return response(mode.status,{occurrences:[]});
 };
 const context={window:{CIDADE_CONECTA_CONFIG:{supabase:{enabled:true,url:'https://backend.invalid',publishableKey:'public-test'}},dispatchEvent(){}},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},fetch,AbortController,CustomEvent:class{},setTimeout:fn=>setTimeout(fn,5),clearTimeout,console};
 vm.runInNewContext(source,context);
 const auth=context.window.CidadeConectaAuth;await auth.ready;
 return {auth,storage,calls,setMode:next=>{mode={...mode,...next}}};
}
test('anonymous does not request backend',async()=>{const h=await harness({stored:null});assert.equal(h.auth.state.status,'anonymous');assert.equal(h.calls.length,0)});
for(const role of ['citizen','agency','unknown'])test(`${role} denied even if backend authenticated`,async()=>{const h=await harness({role});assert.equal(h.auth.state.status,'denied')});
for(const role of ['triage','admin'])test(`${role} requires backend authorization`,async()=>{const yes=await harness({role});assert.equal(yes.auth.state.status,'authorized');const no=await harness({role,authenticated:false});assert.equal(no.auth.state.status,'denied')});
for(const status of [401,403])test(`initial user ${status} fails closed`,async()=>{const h=await harness({userStatus:status});assert.equal(h.auth.state.status,'anonymous');assert.equal(h.storage.has(key),false)});
test('backend session 403 denies access',async()=>{const h=await harness({accessStatus:403});assert.equal(h.auth.state.status,'denied')});
for(const options of [{userStatus:503},{accessStatus:503},{network:true},{timeout:true}])test(`initial transient ${JSON.stringify(options)} preserves session`,async()=>{const h=await harness(options);assert.equal(h.auth.state.status,'error');assert.equal(h.storage.has(key),true)});
test('expired session refreshes before validating backend',async()=>{const h=await harness({stored:{...session(),expires_at:1}});assert.equal(h.auth.state.status,'authorized');assert.ok(h.calls[0].url.includes('refresh_token'))});
test('expired invalid refresh clears session',async()=>{const h=await harness({stored:{...session(),expires_at:1},refreshStatus:400});assert.equal(h.auth.state.status,'anonymous');assert.equal(h.storage.has(key),false)});
for(const mode of [{status:401},{status:403},{status:503},{network:true},{timeout:true}])test(`internal request ${JSON.stringify(mode)} closes panel`,async()=>{const h=await harness();h.setMode(mode);await assert.rejects(h.auth.invokeInternal({action:'list'}));assert.notEqual(h.auth.state.status,'authorized');assert.equal(h.auth.state.profile,null);assert.equal(h.storage.has(key),mode.status!==401);assert.equal(h.auth.state.status,mode.status===401?'anonymous':mode.status===403?'denied':'error')});
test('invalid renewal during internal operation clears session',async()=>{const h=await harness({refreshStatus:400});h.auth.state.session.expires_at=1;await assert.rejects(h.auth.invokeInternal({action:'list'}));assert.equal(h.auth.state.status,'anonymous');assert.equal(h.storage.has(key),false)});
test('password excluded from storage and requests bypass cache',async()=>{const h=await harness({stored:null});await h.auth.signIn('TEST@example.invalid','temporary-password');assert.equal(JSON.stringify([...h.storage]).includes('temporary-password'),false);assert.ok(h.calls.every(c=>c.options.cache==='no-store'));assert.equal(h.auth.state.status,'authorized')});
test('logout clears session even offline',async()=>{const h=await harness();h.setMode({network:true});await h.auth.signOut();assert.equal(h.auth.state.status,'anonymous');assert.equal(h.storage.has(key),false)});

test('malformed user response fails closed and clears invalid session',async()=>{const h=await harness({invalidUser:true});assert.equal(h.auth.state.status,'anonymous');assert.equal(h.storage.has(key),false)});
