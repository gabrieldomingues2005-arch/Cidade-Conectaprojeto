const CACHE_PREFIX='cidade-conecta-';
const CACHE='cidade-conecta-v5-7-2-integration-20261029';
const CORE=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/piracicaba.css','./assets/piracicaba.js','./assets/piracicaba-mapas.js','./assets/piracicaba-mapas.css','./assets/privacy-geo.js','./assets/runtime-config.js','./assets/auth.js','./assets/supabase-bridge.js','./assets/site-enhancements.js','./assets/site-enhancements.css','./assets/design-v55.css','./assets/design-v56.css','./assets/brand-mark-v51.svg','./data/piracicaba.json','./data/municipal-network.json','./manifest.webmanifest','./favicon.svg'];
const VERSIONED_CORE=['./assets/styles.css?v=5.5.0', './assets/piracicaba.css?v=5.5.0', './assets/piracicaba-mapas.css?v=5.5.0', './assets/site-enhancements.css?v=5.7.1', './assets/design-v55.css?v=5.5.0', './assets/design-v56.css?v=5.7.1-ui4', './assets/brand-mark-v51.svg?v=5.5.0', './assets/runtime-config.js?v=5.7.2-integration', './assets/auth.js?v=5.7.1', './assets/supabase-bridge.js?v=5.7.2-integration', './assets/app.js?v=5.7.2-integration', './assets/piracicaba.js?v=5.7.2-integration', './assets/piracicaba-mapas.js?v=5.7.2-integration', './assets/privacy-geo.js?v=5.5.0', './assets/site-enhancements.js?v=5.7.2-integration'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE,...VERSIONED_CORE])).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
          return response;
        })
        .catch(()=>caches.open(CACHE).then(cache=>cache.match('./index.html')))
    );
    return;
  }

  const freshAsset=/\.(?:js|css|json|webmanifest)$/i.test(url.pathname);
  event.respondWith(
    caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(event.request);
      if(freshAsset){
        return fetch(event.request,{cache:'no-store'}).then(response=>{
          if(response.ok)cache.put(event.request,response.clone());
          return response;
        }).catch(()=>cached);
      }
      if(cached)return cached;
      return fetch(event.request).then(response=>{
        if(response.ok)cache.put(event.request,response.clone());
        return response;
      });
    })
  );
});
