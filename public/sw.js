// Simple service worker with basic caching strategies
const VERSION = 'v1';
const RUNTIME_CACHE = `runtime-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isImageRequest(request) {
  return /\.(?:png|jpg|jpeg|gif|webp|avif|svg)(\?.*)?$/.test(new URL(request.url).pathname);
}

function isApiProperty(request) {
  const u = new URL(request.url);
  return /\/properties\/(\d+|[a-z0-9-]+)\/?$/.test(u.pathname) && u.pathname.includes('/properties/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Images: CacheFirst
  if (isImageRequest(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  // API property detail: Stale-While-Revalidate
  if (isApiProperty(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkPromise = fetch(request).then((res) => {
        cache.put(request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkPromise;
    })());
    return;
  }

  // Static assets: Stale-While-Revalidate
  if (url.origin === self.location.origin && /\/assets\//.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkPromise = fetch(request).then((res) => {
        cache.put(request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkPromise;
    })());
  }
});
