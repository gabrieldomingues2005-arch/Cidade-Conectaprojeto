/* Map resilience: keeps vector layers usable when external map tiles fail. */
(()=>{
'use strict';
function install(){
  const L=window.L;if(!L?.tileLayer||L.tileLayer.__cidadeConectaWrapped)return false;
  const original=L.tileLayer.bind(L);
  function wrapped(url,options={}){
    const layer=original(url,options),originalAdd=layer.addTo.bind(layer);
    let map=null,failures=0,notice=null,degraded=false;
    const ensureNotice=()=>{
      if(!map||notice)return;
      const container=map.getContainer?.();if(!container)return;
      container.classList.add('cc-map-tiles-degraded');
      notice=document.createElement('div');
      notice.className='ccMapTileFallbackV83';
      notice.setAttribute('role','status');
      notice.innerHTML='<strong>Mapa-base indisponível</strong><span>Os pontos, filtros e camadas do Cidade Conecta continuam disponíveis.</span>';
      container.appendChild(notice);
    };
    layer.addTo=m=>{map=m;return originalAdd(m)};
    layer.on('tileerror',()=>{
      failures++;
      if(failures>=8&&!degraded&&map){
        degraded=true;ensureNotice();
        try{map.removeLayer(layer)}catch{}
        window.dispatchEvent(new CustomEvent('cidadeconecta:map-tiles-degraded',{detail:{url:String(url||''),failures}}));
      }
    });
    layer.on('load',()=>{
      if(!degraded){failures=0;notice?.remove();notice=null;map?.getContainer?.().classList.remove('cc-map-tiles-degraded')}
    });
    return layer;
  }
  wrapped.__cidadeConectaWrapped=true;
  wrapped.__original=original;
  L.tileLayer=wrapped;
  window.CidadeConectaMapResilience=Object.freeze({installed:true});
  return true;
}
if(!install())window.addEventListener('load',install,{once:true});
})();