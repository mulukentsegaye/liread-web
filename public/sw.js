// Liread High-Performance Offline Service Worker
const CACHE_NAME = 'liread-cache-v1';

// Core critical static assets pre-cached upon service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/pdf.worker.min.js',
  '/liread_logo.png',
  '/liread_logo.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Pre-caching partial notification:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Never intercept Supabase database or real-time calls
  if (url.hostname.includes('supabase.co')) return;

  // 1. Navigation requests (SPA page routes): Network-first with instant cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) return cachedIndex;
        return (await cache.match('/')) || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // 2. Same-origin Reader assets, PDF worker, CMaps, and JS/CSS chunks:
  // Cache-First with background revalidation for zero-latency offline loading
  const isReaderStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/cmaps/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.bcmap') ||
      url.pathname === '/pdf.worker.min.js');

  const isGoogleFont =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isReaderStaticAsset || isGoogleFont) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve immediately from cache; refresh cache in background if online
          if (navigator.onLine) {
            fetch(req)
              .then((networkRes) => {
                if (networkRes && networkRes.status === 200) {
                  caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
                }
              })
              .catch(() => {});
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network and store in cache
        return fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return networkRes;
          })
          .catch(() => {
            // Return synthetic offline response if not found in cache
            return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
          });
      })
    );
    return;
  }
});
