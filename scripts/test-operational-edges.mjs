import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const resolution=readFileSync('supabase/functions/admin-resolution-media/index.ts','utf8');
const news=readFileSync('supabase/functions/admin-news/index.ts','utf8');
const account=readFileSync('supabase/functions/citizen-account/index.ts','utf8');
const health=readFileSync('supabase/functions/system-health/index.ts','utf8');
const municipal=readFileSync('supabase/functions/municipal-dispatch/index.ts','utf8');

test('foto de resolução exige admin, resolução pública e formato limitado',()=>{
 assert.match(resolution,/profile\.role!=="admin"/);
 assert.match(resolution,/occurrence\.status!=="Resolvida"/);
 assert.match(resolution,/MAX_FILE=1572864/);
 assert.match(resolution,/image\/jpeg/);
 assert.match(resolution,/occurrence_resolution_media/);
 assert.match(resolution,/audit_log/);
 assert.doesNotMatch(resolution,/occurrence_contacts|occurrence_private_location/);
});

test('editor de notícias é admin-only e só aceita capa de ocorrência pública aprovada',()=>{
 assert.match(news,/profile\.role!=="admin"/);
 assert.match(news,/cover\.public_visible!==true\|\|cover\.moderation_status!=="approved"/);
 assert.match(news,/status:"draft"/);
 assert.match(news,/news_published/);
 assert.match(news,/Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)/);
 assert.match(news,/createClient\(SUPABASE_URL,SERVICE_ROLE_KEY/);
 assert.doesNotMatch(news,/reply\([^\n]*SERVICE_ROLE_KEY/);
});

test('conta cidadã não aceita papéis internos e sincroniza somente protocolos públicos',()=>{
 assert.match(account,/profile\.role!=="citizen"/);
 assert.match(account,/public_visible",true/);
 assert.match(account,/moderation_status","approved/);
 assert.match(account,/citizen_occurrence_follows/);
 assert.match(account,/citizen_notifications/);
 assert.doesNotMatch(account,/occurrence_contacts|occurrence_private_location/);
});

test('saúde do sistema retorna somente agregados e integração municipal depende de configuração server-side',()=>{
 assert.match(health,/municipalAdapterConfigured/);
 assert.match(health,/MUNICIPAL_ADAPTER_URL/);
 assert.match(health,/adapter:municipalAdapterConfigured\(\)\?"official-http":"unconfigured"/);
 assert.match(health,/service_get_municipal_health/);
 assert.match(health,/service_record_health_event/);
 assert.doesNotMatch(health,/occurrence_contacts|occurrence_private_location|tracking_token/);
});
test('adaptador municipal é admin-only, HTTPS allowlisted e fail-closed',()=>{
 assert.match(municipal,/profile\.role!=="admin"/);
 assert.match(municipal,/official_adapter_not_configured/);
 assert.match(municipal,/u\.protocol!=="https:"/);
 assert.match(municipal,/ADAPTER_HOSTS\.includes/);
 assert.match(municipal,/MAX_BODY=4096/);
 assert.match(municipal,/service_get_municipal_dispatch/);
 assert.match(municipal,/service_update_municipal_dispatch/);
 assert.match(municipal,/municipal_dispatch_sent/);
 assert.match(municipal,/redirect:"error"/);
 assert.doesNotMatch(municipal,/occurrence_contacts|occurrence_private_location|tracking_token|exact_point|public_latitude|public_longitude/);
});
test('payload do adaptador municipal contém somente campos operacionais públicos',()=>{
 for(const key of ['protocol','status','neighborhood','responsibleAgency','publicLocation'])assert.match(municipal,new RegExp(key));
 for(const forbidden of ['email','phone','contact','trackingToken','latitude','longitude'])assert.ok(!new RegExp('payload\\s*=\\{[\\s\\S]{0,1200}'+forbidden,'i').test(municipal),forbidden);
});
