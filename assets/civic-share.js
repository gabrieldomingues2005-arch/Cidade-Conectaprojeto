/* Links públicos com parâmetros permitidos; QR gerado no próprio aparelho. */
((root)=>{
'use strict';
const D=root.CidadeConectaData;
const routes=new Set(['','mapa','bairro','dashboard','agora','feed','noticias','resolvidas','comparar','dados-abertos','relatorios','transparencia','rede-municipal','piracicaba','sobre','privacidade']);
function createUrl(origin,path,hash,territory,protocol){
 const raw=String(hash||'#/').replace(/^#\/?/,''),[p='',search='']=raw.split('?'),parts=p.split('/');
 if(D.validProtocol(protocol))return origin+path+'#/ocorrencia/'+protocol;
 if(parts[0]==='ocorrencia'&&D.validProtocol(parts[1]))return origin+path+'#/ocorrencia/'+parts[1];
 const route=routes.has(p)?p:'',q=new URLSearchParams(search),out=new URLSearchParams(),names=D.allNeighborhoods(territory);
 for(const [key,value]of q){
  const ok=(['bairro','nome','hood'].includes(key)&&names.includes(value))||(['category','cat'].includes(key)&&Object.hasOwn(D.CATEGORIES,value))||(key==='status'&&D.STATUSES.includes(value))||(key==='region'&&/^[1-9]$/.test(value))||(key==='agency'&&/^[a-z-]{2,60}$/.test(value))||(['from','to'].includes(key)&&/^\d{4}-\d\d-\d\d$/.test(value))||(key==='days'&&['7','30','90'].includes(value))||(key==='layer'&&['open','resolved'].includes(value))||(['heat','open'].includes(key)&&value==='1')||(key==='cluster'&&value==='0');
  if(route==='noticias'&&(key==='materia'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)||key==='protocolo'&&D.validProtocol(value)))out.set(key,value);
  if(ok){if(key==='hood'){if(out.getAll(key).length<3)out.append(key,value)}else out.set(key,value)}
 }
 if(route==='mapa')out.set('visao','cidade');
 if(route==='noticias')out.set('edicao','cidade');
 return origin+path+'#/'+route+(out.size?'?'+out:'');
}
root.CidadeConectaShareFactory=Object.freeze({createUrl});
if(typeof document==='undefined')return;
const U=root.CidadeConectaUI,V=root.CidadeConectaCivic;let qrPromise=null;
function loadQr(){if(root.qrcode)return Promise.resolve(root.qrcode);if(qrPromise)return qrPromise;qrPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/vendor/qrcode-generator-1.4.4.js';s.onload=()=>resolve(root.qrcode);s.onerror=()=>{qrPromise=null;s.remove();reject(Error('qr_unavailable'))};document.head.append(s)});return qrPromise}
const safeUrl=p=>createUrl(location.origin,location.pathname,location.hash,V.territory(),p);
function open(protocol,hash){
 const url=hash?createUrl(location.origin,location.pathname,hash,V.territory(),protocol):safeUrl(protocol),panel=V.openDialog('Compartilhar visão pública',`<p>O link contém apenas a página e os filtros públicos permitidos. Localização atual, código privado e termos digitados na busca ficam fora dele.</p><label class="civic-share-label">Link público<textarea readonly rows="3" id="civicShareUrl">${U.esc(url)}</textarea></label><div class="actions"><button class="btn primary" id="civicCopyLink">Copiar link</button>${navigator.share?'<button class="btn secondary" id="civicNativeShare">Compartilhar</button>':''}<button class="btn secondary" id="civicShowQr">Mostrar QR Code</button></div><div id="civicQr" class="civic-qr" role="status"></div>`);
 panel.querySelector('#civicCopyLink').onclick=async()=>{try{await navigator.clipboard.writeText(url);U.toast('Link público copiado.')}catch{panel.querySelector('#civicShareUrl').select();U.toast('Selecione e copie o link público.')}};
 panel.querySelector('#civicNativeShare')?.addEventListener('click',async()=>{try{await navigator.share({title:'Cidade Conecta Piracicaba',url})}catch(err){if(err.name!=='AbortError')U.toast('O compartilhamento não foi concluído. Você pode copiar o link.')}});
 panel.querySelector('#civicShowQr').onclick=async event=>{const box=panel.querySelector('#civicQr');event.currentTarget.disabled=true;box.textContent='Gerando QR Code neste aparelho…';try{const qrcode=await loadQr(),qr=qrcode(0,'M');qr.addData(url);qr.make();if(!box.isConnected)return;box.innerHTML=qr.createSvgTag({cellSize:4,margin:16,scalable:true})+'<p class="small muted">Aponte a câmera para abrir esta visão pública.</p>';box.querySelector('svg').setAttribute('role','img');box.querySelector('svg').setAttribute('aria-label','QR Code do link público exibido acima')}catch{box.textContent='O QR Code não carregou. O link acima continua disponível.'}finally{if(event.target.isConnected){event.target.disabled=false;event.target.focus({preventScroll:true})}}};
}
document.addEventListener('click',event=>{const b=event.target.closest('[data-civic-share-ward]');if(b&&D.allNeighborhoods(V.territory()).includes(b.dataset.civicShareWard))open(null,'#/bairro?nome='+encodeURIComponent(b.dataset.civicShareWard))});
root.CidadeConectaShare=Object.freeze({safeUrl,open});
})(typeof window!=='undefined'?window:globalThis);
