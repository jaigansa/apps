const CACHE_NAME = 'grocery-app-v23';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/lucide.min.js',
  './js/hammer.min.js',
  './js/qrcode.min.js',
  './js/jsqr.min.js',
  './js/app.js',
  './js/data.js', // Renaming list_data.js to data.js or just keeping it
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// Install Event
self.addEventListener('install', (e) => {
  // Activate a newer SW immediately instead of waiting for tabs to close.
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event (Cleanup old caches + take control of open pages)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        );
      })
    ])
  );
});

// Fetch Event (Offline-first with revalidation)
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then((networkRes) => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return networkRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
