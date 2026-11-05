/* Cidade Conecta: projeção pública e cálculos, sem acesso a contatos ou tokens. */
((root)=>{
'use strict';
const DAY=86400000;
const STATUSES=['Recebida','Em análise','Encaminhada','Em andamento','Resolvida'];
const CATEGORIES={vias:'Vias públicas',iluminacao:'Iluminação',residuos:'Resíduos',agua:'Água e saneamento',alagamentos:'Alagamentos',sinalizacao:'Sinalização',acessibilidade:'Acessibilidade',areas:'Áreas públicas',outros:'Outros'};
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const validProtocol=v=>/^CC-\d{4}-\d{5}$/.test(String(v??''));
const time=v=>{const n=Date.parse(v);return Number.isFinite(n)?n:null};
const clean=(v,max=160)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const publicText=(v,max=160)=>clean(v,max).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[contato protegido]').replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'[dado protegido]').replace(/(?:\+55\s*)?\(?\d{2}\)?[ .-]*9?\d{4}[ .-]*\d{4}\b/g,'[contato protegido]').replace(/\b(?:sb_secret_[\w-]+|Bearer\s+[\w.-]+)\b/gi,'[credencial protegida]');
const coord=(v,max)=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))&&Math.abs(Number(v))<=max?Number(Number(v).toFixed(3)):null;
const PUBLIC_MEDIA_ORIGIN='https://qzpofoxxrjunyayczcfu.supabase.co/storage/v1/object/public/occurrence-public-media/';
function mediaFrom(value){
 const raw=Array.isArray(value)?value[0]:value;if(!raw||typeof raw!=='object')return null;
 const key=clean(raw.storage_key,220),mime=clean(raw.mime_type,40),alt=publicText(raw.alt_text,180);
 if(!/^CC-\d{4}-\d{5}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(key))return null;
 if(!['image/jpeg','image/png','image/webp'].includes(mime))return null;
 return{storageKey:key,mime,alt,url:PUBLIC_MEDIA_ORIGIN+key.split('/').map(encodeURIComponent).join('/')};
}
function project(o){
 if(!o||!validProtocol(o.protocol))return null;
 const history=(Array.isArray(o.history)?o.history:[]).filter(h=>h&&h.public_note!==false).map(h=>({status:clean(Array.isArray(h)?h[0]:h.status,30),date:clean(Array.isArray(h)?h[1]:h.created_at||h.date,40),note:publicText(Array.isArray(h)?h[2]:h.note,500)})).filter(h=>STATUSES.includes(h.status)&&time(h.date)!==null);
 const category=o.category||o.category_slug||o.categories?.slug||'outros';
 return {protocol:String(o.protocol),title:publicText(o.title,100),description:publicText(o.description,700),category:Object.hasOwn(CATEGORIES,category)?category:'outros',bairro:publicText(o.bairro??o.neighborhood_label,90),status:STATUSES.includes(o.status)?o.status:'Recebida',agency:publicText(o.agency??o.responsible_agency,150),created:clean(o.created??o.created_at,40),updated:clean(o.updated??o.updated_at,40),resolved:clean(o.resolved??o.resolved_at,40),lat:coord(o.public_latitude??o.lat,90),lng:coord(o.public_longitude??o.lng,180),history,media:mediaFrom(o.media??o.occurrence_public_media),public:o.public!==false&&o.public_visible!==false,cloudOrigin:o.cloudOrigin===true,moderationStatus:clean(o.moderationStatus??o.moderation_status,20)};
}
function publicRows(rows){return(rows||[]).map(project).filter(o=>o&&o.public&&(!o.cloudOrigin||o.moderationStatus==='approved'))}
const realRows=rows=>publicRows(rows).filter(o=>o.cloudOrigin&&o.moderationStatus==='approved');
function remote(o){return project({...o,cloudOrigin:true,history:o.occurrence_history||o.history||[]})}
function lastUpdate(o){return Math.max(...[o.created,o.updated,...(o.history||[]).map(h=>h.date??h[1])].map(time).filter(x=>x!==null),0)}
function regionsFor(name,territory){const key=norm(name);return(territory?.administrativeRegions||[]).filter(r=>(r.neighborhoods||[]).some(n=>norm(n.replace(/^Parte do /i,''))===key)).map(r=>Number(r.id))}
function allNeighborhoods(t){return[...new Set([...(t?.administrativeRegions||[]).flatMap(r=>(r.neighborhoods||[]).map(n=>n.replace(/^Parte do /i,''))),...(t?.ruralAndIsolatedUrbanNuclei||[])])].sort((a,b)=>a.localeCompare(b,'pt-BR'))}
function filter(rows,f={},territory){
 const q=norm(f.q),from=f.from?time(f.from+'T00:00:00-03:00'):null,to=f.to?time(f.to+'T23:59:59.999-03:00'):null;
 return publicRows(rows).filter(o=>(!q||norm([o.protocol,o.title,o.bairro,o.agency,CATEGORIES[o.category]].join(' ')).includes(q))&&(!f.category||o.category===f.category)&&(!f.status||o.status===f.status)&&(!f.bairro||norm(o.bairro)===norm(f.bairro))&&(!f.region||regionsFor(o.bairro,territory).includes(Number(f.region)))&&(!f.agency||o.agency===f.agency)&&(!f.open||o.status!=='Resolvida')&&(!f.resolved||o.status==='Resolvida')&&(from===null||(time(o.created)!==null&&time(o.created)>=from))&&(to===null||(time(o.created)!==null&&time(o.created)<=to)));
}
function rank(rows,key){const map=new Map();for(const o of rows){const k=o[key];if(k)map.set(k,(map.get(k)||0)+1)}return[...map].map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'))}
function metrics(rows,now=Date.now()){
 const a=publicRows(rows),resolved=a.filter(o=>o.status==='Resolvida').length;
 const todayParts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
 const p=Object.fromEntries(todayParts.map(x=>[x.type,x.value])),today=time(`${p.year}-${p.month}-${p.day}T00:00:00-03:00`);
 const recent=days=>a.filter(o=>time(o.created)!==null&&time(o.created)>=now-days*DAY&&time(o.created)<=now).length;
 return{total:a.length,open:a.length-resolved,resolved,rate:a.length?Math.round(resolved/a.length*100):null,today:a.filter(o=>time(o.created)!==null&&time(o.created)>=today&&time(o.created)<=now).length,days7:recent(7),days30:recent(30),statuses:Object.fromEntries(STATUSES.map(s=>[s,a.filter(o=>o.status===s).length])),categories:rank(a,'category'),bairros:rank(a,'bairro')};
}
function compare(rows,days=30,now=Date.now(),complete=true){
 days=[7,30,90].includes(Number(days))?Number(days):30;
 const a=publicRows(rows),start=now-days*DAY,previousStart=start-days*DAY;
 const current=a.filter(o=>time(o.created)!==null&&time(o.created)>=start&&time(o.created)<=now),previous=a.filter(o=>time(o.created)!==null&&time(o.created)>=previousStart&&time(o.created)<start);
 const eligible=complete&&current.length>=10&&previous.length>=10&&current.length+previous.length>=30;
 return {days,current:current.length,previous:previous.length,currentStart:new Date(start).toISOString(),currentEnd:new Date(now).toISOString(),previousStart:new Date(previousStart).toISOString(),previousEnd:new Date(start).toISOString(),eligible,change:eligible?Math.round((current.length-previous.length)/previous.length*100):null,reason:!complete?'A leitura pública está incompleta.':!eligible?'São necessários ao menos 10 registros em cada período e 30 no total.':''};
}
const median=values=>{const a=values.filter(Number.isFinite).sort((a,b)=>a-b),n=a.length;return n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):null};
function observedTimes(rows,now=Date.now()){
 const values={first:[],forwarded:[],started:[],resolved:[]};
 for(const o of publicRows(rows)){
  const start=time(o.created);if(start===null||start>now)continue;
  const h=(o.history||[]).map(x=>({status:x.status,date:time(x.date)})).filter(x=>x.date!==null&&x.date>start&&x.date<=now).sort((a,b)=>a.date-b.date);
  if(h[0])values.first.push((h[0].date-start)/3600000);
  for(const [key,status] of [['forwarded','Encaminhada'],['started','Em andamento'],['resolved','Resolvida']]){
   let end=h.find(x=>x.status===status)?.date;
   if(key==='resolved'&&o.status==='Resolvida'&&time(o.resolved)!==null)end=time(o.resolved);
   if(end!==undefined&&end>=start&&end<=now)values[key].push((end-start)/3600000);
  }
 }
 return Object.fromEntries(Object.entries(values).map(([key,v])=>[key,{hours:median(v),n:v.length}]));
}
function feed(rows,limit=60,now=Date.now()){
 const items=[];
 for(const o of realRows(rows)){
  if(time(o.created)!==null)items.push({id:o.protocol+':created:'+o.created,protocol:o.protocol,title:o.title,bairro:o.bairro,category:o.category,status:'Recebida',date:o.created,type:'created',media:o.media});
  for(const h of o.history){if(h.status==='Recebida'&&time(h.date)===time(o.created))continue;items.push({id:o.protocol+':'+h.status+':'+h.date,protocol:o.protocol,title:o.title,bairro:o.bairro,category:o.category,status:h.status,date:h.date,type:h.status==='Resolvida'?'resolved':'updated',media:o.media})}
 }
 return[...new Map(items.map(x=>[x.id,x])).values()].filter(x=>time(x.date)<=now).sort((a,b)=>time(b.date)-time(a.date)).slice(0,limit);
}
function distance(aLat,aLng,bLat,bLng){
 if(![aLat,aLng,bLat,bLng].every(Number.isFinite))return null;
 const rad=x=>x*Math.PI/180,dLat=rad(bLat-aLat),dLng=rad(bLng-aLng),v=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,v)));
}
function similar(rows,input={},now=Date.now()){
 const words=norm(input.title).split(' ').filter(x=>x.length>3),base=publicRows(rows).filter(o=>o.protocol!==input.protocol&&o.category===input.category&&time(o.created)!==null&&time(o.created)>=now-90*DAY);
 return base.map(o=>{const km=distance(coord(input.lat,90),coord(input.lng,180),o.lat,o.lng),same=Boolean(input.bairro)&&norm(o.bairro)===norm(input.bairro),text=words.filter(w=>norm(o.title).includes(w)).length;return{...o,distance:km,score:(same?3:0)+(km!==null&&km<=1.2?4:0)+text+(o.status!=='Resolvida'?1:0),same}}).filter(o=>o.same||(o.distance!==null&&o.distance<=1.2)).sort((a,b)=>b.score-a.score||(a.distance??Infinity)-(b.distance??Infinity)).slice(0,4);
}
function heatCells(rows){const cells=new Map();for(const o of publicRows(rows)){if(o.lat===null||o.lng===null)continue;const lat=Number((Math.round(o.lat/.003)*.003).toFixed(3)),lng=Number((Math.round(o.lng/.003)*.003).toFixed(3)),key=lat+':'+lng,c=cells.get(key)||{lat,lng,count:0};c.count++;cells.set(key,c)}return[...cells.values()]}
function exportRows(rows,territory){return publicRows(rows).map(o=>({protocolo:o.protocol,titulo:o.title,categoria:CATEGORIES[o.category],bairro:o.bairro,regioes:regionsFor(o.bairro,territory).join(' | '),status:o.status,setor:o.agency,criado_em:o.created,atualizado_em:lastUpdate(o)?new Date(lastUpdate(o)).toISOString():'',resolvido_em:o.resolved,latitude_publica:o.lat,longitude_publica:o.lng}))}
function csv(rows){
 const fields=['protocolo','titulo','categoria','bairro','regioes','status','setor','criado_em','atualizado_em','resolvido_em','latitude_publica','longitude_publica'];
 const cell=v=>{if(typeof v==='number'&&Number.isFinite(v))return String(v);let s=String(v??'');if(/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 return '\ufeff'+[fields,...rows.map(o=>fields.map(f=>o[f]))].map(r=>r.map(cell).join(';')).join('\r\n');
}
function quality(rows,now=Date.now()){
 const a=publicRows(rows);return a.map(o=>{const issues=[];if(!o.bairro)issues.push('Bairro ausente');if(o.category==='outros')issues.push('Revisar categoria');if(o.lat===null||o.lng===null)issues.push('Sem ponto público');if(!o.title||!o.description)issues.push('Informação incompleta');if(time(o.created)===null||time(o.created)>now)issues.push('Data inconsistente');if(o.status!=='Resolvida'&&lastUpdate(o)&&now-lastUpdate(o)>30*DAY)issues.push('Sem atualização há mais de 30 dias');const duplicates=a.filter(x=>x.protocol!==o.protocol&&x.category===o.category&&norm(x.bairro)===norm(o.bairro)&&norm(x.title)===norm(o.title)).map(x=>x.protocol);if(duplicates.length)issues.push('Possível duplicidade');return{protocol:o.protocol,issues,duplicates,attention:issues.length}});
}
root.CidadeConectaData=Object.freeze({DAY,STATUSES,CATEGORIES,norm,time,validProtocol,publicText,project,remote,publicRows,realRows,lastUpdate,regionsFor,allNeighborhoods,filter,rank,metrics,compare,median,observedTimes,feed,distance,similar,heatCells,exportRows,csv,quality});
})(typeof window!=='undefined'?window:globalThis);
