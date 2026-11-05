// Static client secret check. Reports classifications, never matching credential values.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(p,x.name)):[path.join(p,x.name)]);
const files=['index.html',...walk('assets').filter(p=>p.endsWith('.js'))],failures=[],roles=new Set();
for(const file of files){const s=fs.readFileSync(file,'utf8');if(/sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(s))failures.push({file,kind:'private_secret'});for(const match of s.matchAll(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)){try{const p=JSON.parse(Buffer.from(match[0].split('.')[1],'base64url').toString());if(p.role)roles.add(p.role);if(p.role==='service_role')failures.push({file,kind:'service_role_jwt'})}catch{}}}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/runtime-config.js','utf8'),ctx);
const config=ctx.window.CIDADE_CONECTA_CONFIG.supabase;
if(config.projectRef!=='qzpofoxxrjunyayczcfu'||config.url!=='https://qzpofoxxrjunyayczcfu.supabase.co')failures.push({file:'assets/runtime-config.js',kind:'unexpected_project'});
const result={status:failures.length?'FAIL':'PASS',files:files.length,project:config.projectRef,staticJwtRoles:[...roles],failures};
fs.mkdirSync('artifacts/ui-smoke',{recursive:true});fs.writeFileSync('artifacts/ui-smoke/frontend-privacy.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
