// Publica somente o frontend. Código backend, documentação e evidências ficam fora do Hosting.
import {cp,mkdir,rm,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const target='dist';
const entries=['index.html','404.html','favicon.svg','manifest.webmanifest','robots.txt','sitemap.xml','sw.js','assets','data','participar','mapa','noticias','problemas-resolvidos','bairros','dados-abertos','transparencia'];
const site=process.env.HOSTING_SITE_URL;
if(site){const u=new URL(site);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw Error('HOSTING_SITE_URL deve ser uma origem HTTPS com / final');}
await rm(target,{recursive:true,force:true});await mkdir(target);
for(const entry of entries)await cp(entry,target+'/'+entry,{recursive:true});
// Atualiza canonical, Open Graph, dados estruturados e sitemap apenas na publicação Google.
if(site){
 for(const entry of ['index.html','404.html','robots.txt','sitemap.xml',...entries.filter(x=>!x.includes('.')&&!['assets','data'].includes(x)).map(x=>x+'/index.html')]){
  const file=target+'/'+entry,source=await readFile(file,'utf8');
  await writeFile(file,source.replaceAll('https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/',site));
 }
}
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile(target+'/version.json',JSON.stringify({commit,sourceBranch:'main',backendProject:'qzpofoxxrjunyayczcfu'},null,2)+'\n');
console.log(`Frontend preparado em ${target}/ · commit ${commit}`);
