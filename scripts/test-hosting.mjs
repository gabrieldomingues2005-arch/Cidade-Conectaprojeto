import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
test('pacote Firebase mantém assets e backend oficial sem publicar fontes privadas',()=>{
 execFileSync(process.execPath,['scripts/build-hosting.mjs'],{env:{...process.env,HOSTING_SITE_URL:'https://cidade-conecta-piracicaba.web.app/'}});
 for(const path of ['.git','supabase','scripts','docs','schema.sql','AUTH-ADMIN.md'])assert.equal(existsSync('dist/'+path),false,path);
 for(const path of ['index.html','assets/civic-account.js','assets/city-photos/rio.webp','data/piracicaba.json','version.json'])assert.ok(existsSync('dist/'+path),path);
 const html=readFileSync('dist/index.html','utf8');assert.match(html,/rel="canonical" href="https:\/\/cidade-conecta-piracicaba.web.app\/"/);assert.doesNotMatch(html,/github.io/);
 assert.match(readFileSync('dist/noticias/index.html','utf8'),/https:\/\/cidade-conecta-piracicaba.web.app\/noticias\//);
 assert.equal(JSON.parse(readFileSync('dist/version.json','utf8')).backendProject,'qzpofoxxrjunyayczcfu');
 const config=JSON.parse(readFileSync('firebase.json','utf8'));assert.equal(config.hosting.public,'dist');assert.equal(config.hosting.rewrites,undefined);
});
