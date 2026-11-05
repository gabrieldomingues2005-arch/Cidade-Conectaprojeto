import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://gabrieldomingues2005-arch.github.io","https://cidconecta-nztptuci.manus.space"]);
const MAX_BODY=16384;
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowedOrigin(o)?o:"https://gabrieldomingues2005-arch.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const reply=(o:string,s:number,b:Record<string,unknown>)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(v:unknown,max=120)=>typeof v==="string"?v.trim().slice(0,max):"";
const protocolOk=(v:string)=>/^CC-\d{4}-\d{5}$/.test(v);

Deno.serve(async req=>{
  const origin=req.headers.get("origin")??"";
  if(req.method==="OPTIONS") return allowedOrigin(origin)?new Response(null,{status:204,headers:cors(origin)}):reply(origin,403,{error:"origin_not_allowed"});
  if(req.method!=="POST") return reply(origin,405,{error:"method_not_allowed"});
  if(origin&&!allowedOrigin(origin)) return reply(origin,403,{error:"origin_not_allowed"});
  if(!SUPABASE_URL||!SERVICE_ROLE_KEY) return reply(origin,503,{error:"backend_not_configured"});
  const token=(req.headers.get("authorization")??"").match(/^Bearer\s+(.+)$/i)?.[1]??"";
  if(!token) return reply(origin,401,{error:"authentication_required"});
  if(!(req.headers.get("content-type")??"").toLowerCase().includes("application/json")) return reply(origin,415,{error:"unsupported_media_type"});
  const length=Number(req.headers.get("content-length")??"0");
  if(Number.isFinite(length)&&length>MAX_BODY) return reply(origin,413,{error:"request_too_large"});

  const admin=createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  if(userError||!userData.user?.id) return reply(origin,401,{error:"invalid_session"});
  const user=userData.user;

  let raw="";
  try{raw=await req.text()}catch{return reply(origin,400,{error:"invalid_body"})}
  let body:Record<string,unknown>;
  try{body=raw?JSON.parse(raw):{}}catch{return reply(origin,400,{error:"invalid_json"})}
  const action=clean(body.action,40)||"profile";

  let {data:profile,error:profileError}=await admin.from("users_profile").select("id,auth_user_id,name,email,role,created_at,updated_at").eq("auth_user_id",user.id).maybeSingle();
  if(profileError) return reply(origin,503,{error:"profile_lookup_failed"});
  if(!profile){
    const name=clean(user.user_metadata?.name,80)||clean(user.email?.split("@")[0],80)||"Cidadão";
    const {data:created,error:createError}=await admin.from("users_profile").insert({auth_user_id:user.id,name,email:user.email??null,role:"citizen"}).select("id,auth_user_id,name,email,role,created_at,updated_at").single();
    if(createError) return reply(origin,500,{error:"profile_create_failed"});
    profile=created;
  }
  if(profile.role!=="citizen") return reply(origin,403,{error:"citizen_account_required",role:profile.role});

  const ensurePreferences=async()=>{
    const {data,error}=await admin.from("citizen_preferences").upsert({auth_user_id:user.id},{onConflict:"auth_user_id",ignoreDuplicates:true}).select("auth_user_id,display_name,sync_enabled,notify_occurrences,notify_neighborhoods,digest_frequency,updated_at").single();
    if(error) throw error;
    return data;
  };

  if(action==="profile"){
    let preferences;
    try{preferences=await ensurePreferences()}catch{return reply(origin,500,{error:"preferences_lookup_failed"})}
    const [{data:follows,error:followsError},{data:neighborhoods,error:neighborhoodError},{data:notifications,error:notificationError}]=await Promise.all([
      admin.from("citizen_occurrence_follows").select("protocol,created_at").eq("auth_user_id",user.id).order("created_at",{ascending:false}),
      admin.from("citizen_favorite_neighborhoods").select("neighborhood_label,created_at").eq("auth_user_id",user.id).order("created_at",{ascending:false}),
      admin.from("citizen_notifications").select("id,type,protocol,neighborhood_label,title,body,created_at,read_at").eq("auth_user_id",user.id).order("created_at",{ascending:false}).limit(100),
    ]);
    if(followsError||neighborhoodError||notificationError) return reply(origin,500,{error:"citizen_sync_read_failed"});
    return reply(origin,200,{
      profile:{id:profile.id,name:profile.name,role:profile.role,created_at:profile.created_at},
      preferences,
      follows:follows??[],
      neighborhoods:neighborhoods??[],
      notifications:notifications??[],
      unread:(notifications??[]).filter((n:any)=>!n.read_at).length,
    });
  }

  if(action==="sync_local"){
    const protocols=Array.isArray(body.protocols)?[...new Set(body.protocols.map(x=>clean(x,32).toUpperCase()).filter(protocolOk))].slice(0,80):[];
    const neighborhoods=Array.isArray(body.neighborhoods)?[...new Set(body.neighborhoods.map(x=>clean(x,100)).filter(x=>x.length>=2))].slice(0,30):[];
    if(protocols.length){
      const {data:validRows,error:validError}=await admin.from("occurrences").select("protocol").in("protocol",protocols).eq("public_visible",true).eq("moderation_status","approved");
      if(validError) return reply(origin,500,{error:"sync_validation_failed"});
      const valid=new Set((validRows??[]).map((x:any)=>x.protocol));
      const payload=protocols.filter(x=>valid.has(x)).map(protocol=>({auth_user_id:user.id,protocol}));
      if(payload.length){
        const {error}=await admin.from("citizen_occurrence_follows").upsert(payload,{onConflict:"auth_user_id,protocol"});
        if(error) return reply(origin,500,{error:"sync_follow_failed"});
      }
    }
    if(neighborhoods.length){
      const payload=neighborhoods.map(neighborhood_label=>({auth_user_id:user.id,neighborhood_label}));
      const {error}=await admin.from("citizen_favorite_neighborhoods").upsert(payload,{onConflict:"auth_user_id,neighborhood_label"});
      if(error) return reply(origin,500,{error:"sync_neighborhood_failed"});
    }
    return reply(origin,200,{synced:true,protocols:protocols.length,neighborhoods:neighborhoods.length});
  }

  if(action==="save_preferences"){
    const displayName=clean(body.displayName,80);
    const digest=clean(body.digestFrequency,20)||"none";
    if(!["none","daily","weekly"].includes(digest)) return reply(origin,400,{error:"invalid_digest_frequency"});
    const payload={
      auth_user_id:user.id,
      display_name:displayName,
      sync_enabled:body.syncEnabled!==false,
      notify_occurrences:body.notifyOccurrences!==false,
      notify_neighborhoods:body.notifyNeighborhoods!==false,
      digest_frequency:digest,
      updated_at:new Date().toISOString(),
    };
    const {data,error}=await admin.from("citizen_preferences").upsert(payload,{onConflict:"auth_user_id"}).select("*").single();
    if(error) return reply(origin,500,{error:"preferences_save_failed"});
    if(displayName) await admin.from("users_profile").update({name:displayName,updated_at:new Date().toISOString()}).eq("id",profile.id).eq("role","citizen");
    return reply(origin,200,{saved:true,preferences:data});
  }

  if(["follow","unfollow"].includes(action)){
    const protocol=clean(body.protocol,32).toUpperCase();
    if(!protocolOk(protocol)) return reply(origin,400,{error:"invalid_protocol"});
    const {data:occurrence}=await admin.from("occurrences").select("protocol,public_visible,moderation_status").eq("protocol",protocol).maybeSingle();
    if(!occurrence||occurrence.public_visible!==true||occurrence.moderation_status!=="approved") return reply(origin,404,{error:"public_occurrence_not_found"});
    if(action==="follow"){
      const {error}=await admin.from("citizen_occurrence_follows").upsert({auth_user_id:user.id,protocol},{onConflict:"auth_user_id,protocol"});
      if(error) return reply(origin,500,{error:"follow_failed"});
      return reply(origin,200,{following:true,protocol});
    }
    const {error}=await admin.from("citizen_occurrence_follows").delete().eq("auth_user_id",user.id).eq("protocol",protocol);
    if(error) return reply(origin,500,{error:"unfollow_failed"});
    return reply(origin,200,{following:false,protocol});
  }

  if(["favorite_neighborhood","unfavorite_neighborhood"].includes(action)){
    const neighborhood=clean(body.neighborhood,100);
    if(neighborhood.length<2) return reply(origin,400,{error:"invalid_neighborhood"});
    if(action==="favorite_neighborhood"){
      const {error}=await admin.from("citizen_favorite_neighborhoods").upsert({auth_user_id:user.id,neighborhood_label:neighborhood},{onConflict:"auth_user_id,neighborhood_label"});
      if(error) return reply(origin,500,{error:"favorite_neighborhood_failed"});
      return reply(origin,200,{favorite:true,neighborhood});
    }
    const {error}=await admin.from("citizen_favorite_neighborhoods").delete().eq("auth_user_id",user.id).eq("neighborhood_label",neighborhood);
    if(error) return reply(origin,500,{error:"unfavorite_neighborhood_failed"});
    return reply(origin,200,{favorite:false,neighborhood});
  }

  if(action==="mark_notification"){
    const id=clean(body.id,64);
    if(!/^[0-9a-f-]{36}$/i.test(id)) return reply(origin,400,{error:"invalid_notification_id"});
    const {error}=await admin.from("citizen_notifications").update({read_at:new Date().toISOString()}).eq("id",id).eq("auth_user_id",user.id);
    if(error) return reply(origin,500,{error:"notification_update_failed"});
    return reply(origin,200,{read:true,id});
  }

  if(action==="mark_all_notifications"){
    const {error}=await admin.from("citizen_notifications").update({read_at:new Date().toISOString()}).eq("auth_user_id",user.id).is("read_at",null);
    if(error) return reply(origin,500,{error:"notification_update_failed"});
    return reply(origin,200,{readAll:true});
  }

  return reply(origin,400,{error:"unsupported_action"});
});