import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://gabrieldomingues2005-arch.github.io","https://cidconecta-nztptuci.manus.space"]);
const MAX_BODY=32768;
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowedOrigin(o)?o:"https://gabrieldomingues2005-arch.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const reply=(o:string,s:number,b:Record<string,unknown>)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(o),"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(v:unknown,max=160)=>typeof v==="string"?v.trim().slice(0,max):"";
const slugOk=(v:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)&&v.length>=3&&v.length<=120;
const uuidOk=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

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
  const {data:profile,error:profileError}=await admin.from("users_profile").select("id,name,role").eq("auth_user_id",userData.user.id).maybeSingle();
  if(profileError) return reply(origin,503,{error:"profile_lookup_failed"});
  if(!profile||profile.role!=="admin") return reply(origin,403,{error:"admin_required"});

  let raw="";
  try{raw=await req.text()}catch{return reply(origin,400,{error:"invalid_body"})}
  if(new TextEncoder().encode(raw).byteLength>MAX_BODY) return reply(origin,413,{error:"request_too_large"});
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw)}catch{return reply(origin,400,{error:"invalid_json"})}
  const action=clean(body.action,30)||"list";

  if(action==="list"){
    const {data,error}=await admin.from("news_posts").select("id,slug,title,summary,category,status,featured,cover_protocol,published_at,created_at,updated_at").order("updated_at",{ascending:false}).limit(200);
    if(error) return reply(origin,500,{error:"news_list_failed"});
    return reply(origin,200,{posts:data??[]});
  }

  if(action==="detail"){
    const id=clean(body.id,64);
    if(!uuidOk(id)) return reply(origin,400,{error:"invalid_id"});
    const {data,error}=await admin.from("news_posts").select("*").eq("id",id).maybeSingle();
    if(error) return reply(origin,500,{error:"news_detail_failed"});
    if(!data) return reply(origin,404,{error:"news_not_found"});
    return reply(origin,200,{post:data});
  }

  if(action==="save"){
    const id=clean(body.id,64),slug=clean(body.slug,120).toLowerCase(),title=clean(body.title,160),summary=clean(body.summary,500),content=clean(body.body,20000),category=clean(body.category,60)||"cidade-conecta",coverProtocol=clean(body.coverProtocol,32).toUpperCase(),featured=body.featured===true;
    if(id&&!uuidOk(id)) return reply(origin,400,{error:"invalid_id"});
    if(!slugOk(slug)) return reply(origin,400,{error:"invalid_slug"});
    if(title.length<3) return reply(origin,400,{error:"title_required"});
    if(coverProtocol&&!/^CC-\d{4}-\d{5}$/.test(coverProtocol)) return reply(origin,400,{error:"invalid_cover_protocol"});
    if(coverProtocol){
      const {data:cover}=await admin.from("occurrences").select("protocol,public_visible,moderation_status").eq("protocol",coverProtocol).maybeSingle();
      if(!cover||cover.public_visible!==true||cover.moderation_status!=="approved") return reply(origin,409,{error:"cover_occurrence_not_public"});
    }
    const payload={slug,title,summary,body:content,category,featured,cover_protocol:coverProtocol||null,updated_by:profile.id,updated_at:new Date().toISOString()};
    let row;
    if(id){
      const {data,error}=await admin.from("news_posts").update(payload).eq("id",id).select("id,slug,status").single();
      if(error) return reply(origin,error.code==="23505"?409:500,{error:error.code==="23505"?"slug_already_exists":"news_save_failed"});
      row=data;
    }else{
      const {data,error}=await admin.from("news_posts").insert({...payload,created_by:profile.id,status:"draft"}).select("id,slug,status").single();
      if(error) return reply(origin,error.code==="23505"?409:500,{error:error.code==="23505"?"slug_already_exists":"news_save_failed"});
      row=data;
    }
    await admin.from("audit_log").insert({actor_id:profile.id,action:"news_saved",entity_type:"news_post",entity_id:row.id,metadata:{slug:row.slug,status:row.status}});
    return reply(origin,200,{saved:true,post:row});
  }

  if(["publish","archive","delete"].includes(action)){
    const id=clean(body.id,64);
    if(!uuidOk(id)) return reply(origin,400,{error:"invalid_id"});
    const {data:post,error:lookupError}=await admin.from("news_posts").select("id,slug,status").eq("id",id).maybeSingle();
    if(lookupError||!post) return reply(origin,404,{error:"news_not_found"});
    if(action==="delete"){
      if(post.status==="published") return reply(origin,409,{error:"published_post_must_be_archived_first"});
      const {error}=await admin.from("news_posts").delete().eq("id",id);
      if(error) return reply(origin,500,{error:"news_delete_failed"});
      await admin.from("audit_log").insert({actor_id:profile.id,action:"news_deleted",entity_type:"news_post",entity_id:id,metadata:{slug:post.slug}});
      return reply(origin,200,{deleted:true,id});
    }
    const status=action==="publish"?"published":"archived",patch:Record<string,unknown>={status,updated_by:profile.id,updated_at:new Date().toISOString()};
    if(action==="publish") patch.published_at=new Date().toISOString();
    const {data,error}=await admin.from("news_posts").update(patch).eq("id",id).select("id,slug,status,published_at").single();
    if(error) return reply(origin,500,{error:"news_status_update_failed"});
    await admin.from("audit_log").insert({actor_id:profile.id,action:action==="publish"?"news_published":"news_archived",entity_type:"news_post",entity_id:id,metadata:{slug:post.slug,status}});
    return reply(origin,200,{post:data});
  }

  return reply(origin,400,{error:"unsupported_action"});
});