import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.117.3";
import {validate} from "./validation.mjs";

const URL=Deno.env.get('SUPABASE_URL')||'',KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const origins=new Set(['https://gabrieldomingues2005-arch.github.io','https://cidade-conecta-piracicaba.web.app','https://cidade-conecta-piracicaba.firebaseapp.com','https://cidconecta-nztptuci.manus.space']);
const allowed=(o:string)=>origins.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
function response(origin:string,status:number,body:Record<string,unknown>){return new Response(status===204?null:JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':allowed(origin)?origin:'https://gabrieldomingues2005-arch.github.io','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Max-Age':'86400','Vary':'Origin',...(status===429?{'Retry-After':'60'}:{})}})}
async function hash(value:string){const enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode(KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);const b=await crypto.subtle.sign('HMAC',key,enc.encode(value));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin')||'';
 if(origin&&!allowed(origin))return response(origin,403,{error:'origin_not_allowed'});
 if(req.method==='OPTIONS')return response(origin,204,{});
 if(req.method!=='POST')return response(origin,405,{error:'method_not_allowed'});
 if(URL!=='https://qzpofoxxrjunyayczcfu.supabase.co'||!KEY)return response(origin,503,{error:'backend_not_configured'});
 if(Number(req.headers.get('content-length'))>2048)return response(origin,413,{error:'payload_too_large'});
 let body;
 try{const reader=req.body?.getReader();if(!reader)throw Error();const chunks:Uint8Array[]=[];let n=0;for(;;){const part=await reader.read();if(part.done)break;n+=part.value.byteLength;if(n>2048){await reader.cancel();return response(origin,413,{error:'payload_too_large'})}chunks.push(part.value)}const bytes=new Uint8Array(n);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}body=JSON.parse(new TextDecoder().decode(bytes))}catch{return response(origin,400,{error:'invalid_json'})}
 const input=validate(body);if(input.error)return response(origin,400,{error:input.error});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const client=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:controller.signal})}});
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',').at(-1)?.trim()||'unknown';
  const {data,error}=await client.rpc('community_participation_internal',{p_action:input.action,p_protocol:input.protocol,p_device_hash:await hash('device:'+input.deviceKey),p_fingerprint_hash:await hash('community-ip:'+ip),p_resolution:input.resolution,p_rating:input.rating,p_tracking_key:input.trackingKey});
  if(error||!data)return response(origin,503,{error:'community_unavailable'});
  if(data.error){const status=({not_found:404,rate_limited:429,tracking_required:403,not_resolved:409} as Record<string,number>)[data.error]||400;return response(origin,status,{error:data.error,...(status===429?{retryAfterSeconds:60}:{})})}
  return response(origin,200,data);
 }catch{return response(origin,503,{error:'community_unavailable'})}finally{clearTimeout(timer)}
});
