import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const BUCKET="occurrence-public-media";
const MAX_FILE=1572864;
const MIMES=new Set(["image/jpeg","image/png","image/webp"]);
const ORIGINS=new Set(["https://gabrieldomingues2005-arch.github.io","https://cidade-conecta-piracicaba.web.app","https://cidade-conecta-piracicaba.firebaseapp.com","https://cidconecta-nztptuci.manus.space"]);
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowedOrigin(o)?o:"https://gabrieldomingues2005-arch.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const reply=(o:string,s:number,b:Record<string,unknown>)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const protocolOk=(v:string)=>/^CC-\d{4}-\d{5}$/.test(v);
const ext=(m:string)=>m==="image/jpeg"?"jpg":m==="image/png"?"png":m==="image/webp"?"webp":"";

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
  if(!profile||profile.role!=="admin") return reply(origin,403,{error:"admin_required"});

  let form:FormData;
  try{form=await req.formData()}catch{return reply(origin,400,{error:"invalid_form_data"})}
  const action=String(form.get("action")??"publish").trim();
  const protocol=String(form.get("protocol")??"").trim().toUpperCase();
  if(!protocolOk(protocol)) return reply(origin,400,{error:"invalid_protocol"});
  const {data:occurrence,error:occurrenceError}=await admin.from("occurrences").select("id,protocol,status,public_visible,moderation_status").eq("protocol",protocol).maybeSingle();
  if(occurrenceError||!occurrence) return reply(origin,404,{error:"occurrence_not_found"});

  const {data:previous}=await admin.from("occurrence_resolution_media").select("storage_key").eq("protocol",protocol).maybeSingle();

  if(action==="delete"){
    if(previous?.storage_key) await admin.storage.from(BUCKET).remove([String(previous.storage_key)]);
    const {error:deleteError}=await admin.from("occurrence_resolution_media").delete().eq("protocol",protocol);
    if(deleteError) return reply(origin,500,{error:"resolution_media_delete_failed"});
    await admin.from("audit_log").insert({actor_id:profile.id,action:"resolution_media_unpublished",entity_type:"occurrence",entity_id:occurrence.id,metadata:{protocol}});
    return reply(origin,200,{published:false,protocol});
  }

  if(occurrence.status!=="Resolvida"||occurrence.public_visible!==true||occurrence.moderation_status!=="approved") return reply(origin,409,{error:"occurrence_not_publicly_resolved"});
  const file=form.get("file");
  if(!(file instanceof File)) return reply(origin,400,{error:"file_required"});
  if(!MIMES.has(file.type)||!ext(file.type)) return reply(origin,400,{error:"unsupported_file_type"});
  if(file.size<1||file.size>MAX_FILE) return reply(origin,413,{error:"invalid_file_size"});
  const altText=String(form.get("altText")??"").trim().slice(0,180);
  if(altText.length<5) return reply(origin,400,{error:"alt_text_required"});

  const key=`${protocol}/resolution/${crypto.randomUUID()}.${ext(file.type)}`;
  const {error:uploadError}=await admin.storage.from(BUCKET).upload(key,file,{contentType:file.type,cacheControl:"3600",upsert:false});
  if(uploadError) return reply(origin,500,{error:"resolution_media_upload_failed"});
  const now=new Date().toISOString();
  const {error:metadataError}=await admin.from("occurrence_resolution_media").upsert({protocol,storage_key:key,mime_type:file.type,alt_text:altText,published_at:now,updated_at:now},{onConflict:"protocol"});
  if(metadataError){await admin.storage.from(BUCKET).remove([key]);return reply(origin,500,{error:"resolution_media_metadata_failed"})}
  if(previous?.storage_key&&previous.storage_key!==key) await admin.storage.from(BUCKET).remove([String(previous.storage_key)]);
  await admin.from("audit_log").insert({actor_id:profile.id,action:"resolution_media_published",entity_type:"occurrence",entity_id:occurrence.id,metadata:{protocol,storage_key:key}});
  const publicUrl=admin.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  return reply(origin,200,{published:true,protocol,publicUrl});
});