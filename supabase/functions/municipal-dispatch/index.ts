import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ADAPTER_URL=(Deno.env.get("MUNICIPAL_ADAPTER_URL")??"").trim();
const ADAPTER_TOKEN=(Deno.env.get("MUNICIPAL_ADAPTER_TOKEN")??"").trim();
const ADAPTER_HOSTS=(Deno.env.get("MUNICIPAL_ADAPTER_HOSTS")??"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
const MAX_BODY=4096;
const ORIGINS=new Set(["https://gabrieldomingues2005-arch.github.io","https://cidconecta-nztptuci.manus.space"]);
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowedOrigin(o)?o:"https://gabrieldomingues2005-arch.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const reply=(o:string,s:number,b:Record<string,unknown>)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
const uuidOk=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function adapterConfig(){
  if(!ADAPTER_URL||!ADAPTER_TOKEN||!ADAPTER_HOSTS.length)return null;
  try{
    const u=new URL(ADAPTER_URL);
    if(u.protocol!=="https:"||!ADAPTER_HOSTS.includes(u.hostname.toLowerCase()))return null;
    return u;
  }catch{return null}
}
const text=(v:unknown,max:number)=>String(v??"").trim().slice(0,max);

Deno.serve(async req=>{
  const origin=req.headers.get("origin")??"";
  if(req.method==="OPTIONS")return allowedOrigin(origin)?new Response(null,{status:204,headers:cors(origin)}):reply(origin,403,{error:"origin_not_allowed"});
  if(req.method!=="POST")return reply(origin,405,{error:"method_not_allowed"});
  if(origin&&!allowedOrigin(origin))return reply(origin,403,{error:"origin_not_allowed"});
  if(!SUPABASE_URL||!SERVICE_ROLE_KEY)return reply(origin,503,{error:"backend_not_configured"});
  if(!(req.headers.get("content-type")??"").toLowerCase().includes("application/json"))return reply(origin,415,{error:"unsupported_media_type"});
  const contentLength=Number(req.headers.get("content-length")??"0");
  if(Number.isFinite(contentLength)&&contentLength>MAX_BODY)return reply(origin,413,{error:"request_too_large"});

  const token=(req.headers.get("authorization")??"").match(/^Bearer\s+(.+)$/i)?.[1]??"";
  if(!token)return reply(origin,401,{error:"authentication_required"});
  const admin=createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  if(userError||!userData.user?.id)return reply(origin,401,{error:"invalid_session"});
  const {data:profile,error:profileError}=await admin.from("users_profile").select("id,role").eq("auth_user_id",userData.user.id).maybeSingle();
  if(profileError)return reply(origin,503,{error:"profile_lookup_failed"});
  if(!profile||profile.role!=="admin")return reply(origin,403,{error:"admin_required"});
  const adapter=adapterConfig();
  if(!adapter)return reply(origin,503,{configured:false,sent:false,error:"official_adapter_not_configured"});

  let body:Record<string,unknown>;
  try{body=await req.json()}catch{return reply(origin,400,{error:"invalid_json"})}
  const outboxId=text(body.outboxId,64);
  if(!uuidOk(outboxId))return reply(origin,400,{error:"invalid_outbox_id"});
  const {data:rows,error:readError}=await admin.rpc("service_get_municipal_dispatch",{p_id:outboxId});
  if(readError)return reply(origin,500,{error:"dispatch_lookup_failed"});
  const row=Array.isArray(rows)?rows[0]:rows;
  if(!row)return reply(origin,404,{error:"dispatch_not_found"});
  if(row.status==="sent")return reply(origin,409,{error:"dispatch_already_sent"});
  if(!["disabled","failed"].includes(String(row.status)))return reply(origin,409,{error:"dispatch_not_ready"});

  const source=row.payload&&typeof row.payload==="object"&&!Array.isArray(row.payload)?row.payload:{};
  const payload={
    eventId:outboxId,
    source:"cidade-conecta-piracicaba",
    action:text(row.action,80),
    protocol:text((source as Record<string,unknown>).protocol,32),
    status:text((source as Record<string,unknown>).status,40),
    neighborhood:text((source as Record<string,unknown>).neighborhood,100),
    responsibleAgency:text((source as Record<string,unknown>).responsible_agency,150),
    publicLocation:text((source as Record<string,unknown>).public_location,180),
    sentAt:new Date().toISOString(),
  };
  if(!/^CC-\d{4}-\d{5}$/.test(payload.protocol))return reply(origin,409,{error:"dispatch_payload_invalid"});

  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(adapter.toString(),{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json","Authorization":`Bearer ${ADAPTER_TOKEN}`,"User-Agent":"Cidade-Conecta-Piracicaba/1.0"},
      body:JSON.stringify(payload),
      signal:controller.signal,
      redirect:"error",
    });
    if(!response.ok){
      const detail=(await response.text().catch(()=>"" )).replace(/[\u0000-\u001f\u007f]/g," ").slice(0,240);
      await admin.rpc("service_update_municipal_dispatch",{p_id:outboxId,p_status:"failed",p_last_error:`HTTP ${response.status}${detail?": "+detail:""}`});
      await admin.from("audit_log").insert({actor_id:profile.id,action:"municipal_dispatch_failed",entity_type:"municipal_dispatch",entity_id:outboxId,metadata:{status:response.status,host:adapter.hostname}});
      return reply(origin,502,{configured:true,sent:false,error:"official_adapter_rejected",status:response.status});
    }
    const {data:updated,error:updateError}=await admin.rpc("service_update_municipal_dispatch",{p_id:outboxId,p_status:"sent",p_last_error:null});
    if(updateError)return reply(origin,500,{error:"dispatch_state_update_failed"});
    await admin.from("audit_log").insert({actor_id:profile.id,action:"municipal_dispatch_sent",entity_type:"municipal_dispatch",entity_id:outboxId,metadata:{host:adapter.hostname,protocol:payload.protocol}});
    return reply(origin,200,{configured:true,sent:true,dispatch:Array.isArray(updated)?updated[0]:updated});
  }catch(error){
    const message=error instanceof Error?error.name==="AbortError"?"timeout":error.message:"network_error";
    await admin.rpc("service_update_municipal_dispatch",{p_id:outboxId,p_status:"failed",p_last_error:text(message,240)});
    await admin.from("audit_log").insert({actor_id:profile.id,action:"municipal_dispatch_failed",entity_type:"municipal_dispatch",entity_id:outboxId,metadata:{host:adapter.hostname,reason:text(message,120)}});
    return reply(origin,502,{configured:true,sent:false,error:"official_adapter_unavailable"});
  }finally{clearTimeout(timer)}
});