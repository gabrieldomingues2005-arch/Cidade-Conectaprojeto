const CACHE='cidade-conecta-v5-1-manus-integration';
const CORE=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/piracicaba.css','./assets/piracicaba.js','./assets/piracicaba-mapas.js','./assets/piracicaba-mapas.css','./assets/privacy-geo.js','./assets/runtime-config.js','./assets/supabase-bridge.js','./assets/site-enhancements.js','./assets/site-enhancements.css','./assets/design-v51.css','./assets/brand-mark-v51.svg','./data/piracicaba.json','./manifest.webmanifest','./favicon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
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
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached)return cached;
      return fetch(event.request).then(response=>{
        if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
        return response;
      });
    })
  );
});
