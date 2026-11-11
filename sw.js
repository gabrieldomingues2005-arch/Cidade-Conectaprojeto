const CACHE_PREFIX='cidade-conecta-';
const CACHE='cidade-conecta-v9-firebase-20261111-r1';
const CORE=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/piracicaba.css','./assets/piracicaba.js','./assets/piracicaba-mapas.js','./assets/piracicaba-mapas.css','./assets/privacy-geo.js','./assets/map-resilience.js','./assets/runtime-config.js','./assets/auth.js','./assets/supabase-bridge.js','./assets/site-enhancements.js','./assets/site-enhancements.css','./assets/design-v55.css','./assets/design-v56.css','./assets/brand-mark-v51.svg','./assets/piracicaba-rio.svg','./assets/demo-news/acessibilidade.svg','./assets/demo-news/agua.svg','./assets/demo-news/alagamentos.svg','./assets/demo-news/areas.svg','./assets/demo-news/iluminacao.svg','./assets/demo-news/residuos.svg','./assets/demo-news/sinalizacao.svg','./assets/demo-news/vias.svg','./data/piracicaba.json','./data/municipal-network.json','./manifest.webmanifest','./favicon.svg','./assets/design-system.css','./assets/civic-data.js','./assets/civic-store.js','./assets/civic-news-store.js','./assets/civic-account.js','./assets/civic-ui.js','./assets/civic.css','./assets/institutional-pira-v85.css','./assets/institutional-a11y-v85.js','./assets/civic-pages.js','./assets/civic-share.js','./assets/civic-demo.js','./assets/civic-city-news.js','./assets/civic-community.js','./assets/civic-admin.js','./assets/civic-pwa.js','./assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/icon-maskable-512.png','./assets/vendor/qrcode-generator-1.4.4.js'];
const SHELL_VERSIONS=['./assets/styles.css?v=5.5.0', './assets/piracicaba.css?v=5.5.0', './assets/piracicaba-mapas.css?v=5.5.0', './assets/site-enhancements.css?v=5.7.1', './assets/design-v55.css?v=5.5.0', './assets/design-v56.css?v=5.7.1-ui4', './assets/design-system.css?v=6.0.1', './assets/brand-mark-v51.svg?v=5.5.0', './assets/runtime-config.js?v=5.7.1', './assets/auth.js?v=8.4.0', './assets/supabase-bridge.js?v=5.5.0', './assets/app.js?v=9.6.4', './assets/piracicaba.js?v=9.6.3', './assets/piracicaba-mapas.js?v=9.6.2', './assets/privacy-geo.js?v=5.5.0', './assets/map-resilience.js?v=1.0.1', './assets/site-enhancements.js?v=8.5.1', './assets/civic-data.js?v=9.6.2', './assets/civic-store.js?v=9.6.2', './assets/civic-account.js?v=9.7.0', './assets/civic-news-store.js?v=8.0.0', './assets/civic-ui.js?v=9.7.0', './assets/civic.css?v=9.6.2', './assets/institutional-pira-v85.css?v=9.2.1', './assets/institutional-a11y-v85.js?v=8.5.1', './assets/civic-pages.js?v=9.6.3', './assets/civic-share.js?v=9.6.2', './assets/civic-demo.js?v=9.6.1', './assets/civic-city-news.js?v=9.6.4', './assets/civic-community.js?v=9.6.2', './assets/civic-admin.js?v=7.0.0-7', './assets/civic-pwa.js?v=7.0.0-7'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE,...SHELL_VERSIONS])).then(()=>self.skipWaiting()));
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
