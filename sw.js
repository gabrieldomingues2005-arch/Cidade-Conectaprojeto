const CACHE_PREFIX='cidade-conecta-';
const CACHE='cidade-conecta-v5-6-auth-qa-20261015b';
const CORE=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/piracicaba.css','./assets/piracicaba.js','./assets/piracicaba-mapas.js','./assets/piracicaba-mapas.css','./assets/privacy-geo.js','./assets/runtime-config.js','./assets/auth.js','./assets/supabase-bridge.js','./assets/site-enhancements.js','./assets/site-enhancements.css','./assets/design-v55.css','./assets/design-v56.css','./assets/brand-mark-v51.svg','./data/piracicaba.json','./data/municipal-network.json','./manifest.webmanifest','./favicon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
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
      const network=fetch(event.request,{cache:freshAsset?'no-store':'default'}).then(response=>{
        if(response.ok)cache.put(event.request,response.clone());
        return response;
      });
      if(freshAsset)return network.catch(()=>cached);
      return cached||network;
    })
  );
});
