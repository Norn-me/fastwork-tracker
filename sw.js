/* Fastwork Launch Tracker — service worker
   Cache-first app shell (same pattern as Rapid Notes). GitHub API calls
   are never cached — sync data must stay fresh. Cross-origin CDN assets
   (Iconify, Google Fonts) are cached opaquely so they survive offline. */

/* Bump this version whenever index.html (or any shell asset) changes —
   it triggers a fresh install and drops the old cache on activate. */
const CACHE = 'fastwork-tracker-v3';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Sync calls: network only, never cached.
  if (url.hostname === 'api.github.com') return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          // Cross-origin CDN (Iconify, fonts): retry opaquely so the asset
          // can still be cached and served offline next time.
          if (url.origin !== location.origin) {
            return fetch(e.request.url, { mode: 'no-cors' }).then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
              return res;
            });
          }
          if (e.request.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        });
    })
  );
});
