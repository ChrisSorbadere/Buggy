/* Atelier Méca — service worker (version 11) */
const CACHE = 'atelier-meca-v11';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const page = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (url.pathname.endsWith('version.json')) return;
  // la page est toujours redemandée au serveur (jamais le cache du navigateur) ; le cache ne sert que hors ligne
  const net = fetch(page ? new Request(url.origin + url.pathname, { cache: 'no-store' }) : new Request(req, { cache: 'no-cache' }));
  e.respondWith(net.then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(page ? './index.html' : req, copy)); } return r; })
    .catch(() => caches.match(page ? './index.html' : req).then(r => r || caches.match('./index.html'))));
});
