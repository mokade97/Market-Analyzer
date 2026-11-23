const CACHE = 'fcalc-v125-0a8cc181';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // APIs, TradingView, exchanges: always network
  // app shell: network-first (so a redeploy shows up), fallback to cache when offline
  const netWithTimeout = Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('sw-timeout')), 4000))]); // audit #16: slow/filtered network must not block startup
  e.respondWith(netWithTimeout.then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => { if (cs.length) return cs[0].focus(); return self.clients.openWindow('./'); })); });
