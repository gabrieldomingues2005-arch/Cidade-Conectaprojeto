import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://gabrieldomingues2005-arch.github.io","https://cidconecta-nztptuci.manus.space"]);
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowedOrigin(o)?o:"https://gabrieldomingues2005-arch.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const reply=(o:string,s:number,b:Record<string,unknown>)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});

Deno.serve(async req=>{
  const origin=req.headers.get("origin")??"";
  if(req.method==="OPTIONS") return allowedOrigin(origin)?new Response(null,{status:204,headers:cors(origin)}):reply(origin,403,{error:"origin_not_allowed"});
  if(req.method!=="POST") return reply(origin,405,{error:"method_not_allowed"});
  if(origin&&!allowedOrigin(origin)) return reply(origin,403,{error:"origin_not_allowed"});
  if(!SUPABASE_URL||!SERVICE_ROLE_KEY) return reply(origin,503,{error:"backend_not_configured"});
  const token=(req.headers.get("authorization")??"").match(/^Bearer\s+(.+)$/i)?.[1]??"";
  if(!token) return reply(origin,401,{error:"authentication_required"});
  const admin=createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  if(userError||!userData.user?.id) return reply(origin,401,{error:"invalid_session"});
  const {data:profile,error:profileError}=await admin.from("users_profile").select("id,name,role").eq("auth_user_id",userData.user.id).maybeSingle();
  if(profileError) return reply(origin,503,{error:"profile_lookup_failed"});
  if(!profile||!["triage","admin"].includes(String(profile.role))) return reply(origin,403,{error:"internal_access_denied"});

  const started=performance.now();
  const [occurrences,news,notifications,outbox,buckets]=await Promise.all([
    admin.from("occurrences").select("id,status,moderation_status,updated_at",{count:"exact",head:false}).limit(500),
    admin.from("news_posts").select("id,status,updated_at",{count:"exact",head:false}).limit(300),
    admin.from("citizen_notifications").select("id,read_at,created_at",{count:"exact",head:false}).limit(500),
    admin.schema("private").from("municipal_integration_outbox").select("id,status,adapter_key,updated_at").limit(200),
    admin.storage.listBuckets(),
  ]);
  const latency=Math.round(performance.now()-started);
  const errors=[occurrences.error,news.error,notifications.error,outbox.error,buckets.error].filter(Boolean);
  const status=errors.length?"degraded":"ok";
  const occurrenceRows=occurrences.data??[],newsRows=news.data??[],notificationRows=notifications.data??[],outboxRows=outbox.data??[];
  const snapshot={
    checkedAt:new Date().toISOString(),
    status,
    latencyMs:latency,
    database:{reachable:!occurrences.error,total:occurrences.count??occurrenceRows.length,pendingModeration:occurrenceRows.filter((x:any)=>x.moderation_status==="pending").length,resolved:occurrenceRows.filter((x:any)=>x.status==="Resolvida").length},
    news:{reachable:!news.error,drafts:newsRows.filter((x:any)=>x.status==="draft").length,published:newsRows.filter((x:any)=>x.status==="published").length},
    notifications:{reachable:!notifications.error,total:notifications.count??notificationRows.length,unreadInSample:notificationRows.filter((x:any)=>!x.read_at).length},
    municipalIntegration:{configured:false,adapter:"unconfigured",queued:outboxRows.filter((x:any)=>x.status==="pending").length,failed:outboxRows.filter((x:any)=>x.status==="failed").length,disabled:outboxRows.filter((x:any)=>x.status==="disabled").length},
    storage:{reachable:!buckets.error,requiredBuckets:["occurrence-attachments","occurrence-public-media"],present:(buckets.data??[]).filter((b:any)=>["occurrence-attachments","occurrence-public-media"].includes(b.id)).map((b:any)=>b.id)},
    edge:{reachable:true,function:"system-health"},
  };
  await admin.schema("private").from("ops_health_events").insert({component:"system-health",status,latency_ms:latency,metadata:{database:!occurrences.error,news:!news.error,notifications:!notifications.error,storage:!buckets.error,municipal_adapter:"unconfigured"}});
  return reply(origin,status==="ok"?200:207,snapshot);
});