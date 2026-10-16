const CACHE='zhonghe-quote-mobile-v24';
const ASSETS=['./','./index.html','./styles.css','./v2.css','./v3.css','./v4.css','./v5.css','./v6.css','./app.js','./v2-bridge.js','./v3-bridge.js','./v4-bridge.js','./v5-bridge.js','./v6-bridge.js','./manifest.webmanifest','./icon.svg','./company-logo.jpg'];
ASSETS.push('./home.css','./home.js');
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).pathname.startsWith('/api/'))return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
