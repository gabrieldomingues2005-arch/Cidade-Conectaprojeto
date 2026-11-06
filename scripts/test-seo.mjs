import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const pages=['participar','mapa','noticias','problemas-resolvidos','bairros','dados-abertos','transparencia'];
const sitemap=readFileSync('sitemap.xml','utf8'),robots=readFileSync('robots.txt','utf8');
test('páginas SEO indexáveis existem com canonical, descrição e aviso independente',()=>{
 for(const page of pages){
  const path=page+'/index.html';assert.ok(existsSync(path),path);
  const html=readFileSync(path,'utf8');
  assert.match(html,/meta name="description"/);
  assert.match(html,new RegExp('rel="canonical" href="https://gabrieldomingues2005-arch\\.github\\.io/Cidade-Conectaprojeto/'+page+'/'));
  assert.match(html,/Projeto acadêmico independente/);
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/\.\.\/#\//);
 }
});
test('sitemap e robots expõem as páginas estáticas',()=>{
 for(const page of pages)assert.match(sitemap,new RegExp('/Cidade-Conectaprojeto/'+page+'/'));
 assert.match(robots,/Sitemap: https:\/\/gabrieldomingues2005-arch\.github\.io\/Cidade-Conectaprojeto\/sitemap\.xml/);
});
test('SEO não indexa nem replica dados privados',()=>{
 for(const page of pages){
  const html=readFileSync(page+'/index.html','utf8');
  assert.doesNotMatch(html,/tracking_token|occurrence_contacts|exact_point|auth_user_id|service_role/i);
 }
});
