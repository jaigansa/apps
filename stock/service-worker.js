const CACHE_NAME = 'matlist-v1';
const urlsToCache = [
  '.',
  'index.html',
  'style.css',
  'script.js',
  'material-data.js',
  'logo.png',
  'phone-qr.svg',
  'icons/angle.svg',
  'icons/flat.svg',
  'icons/rod_round.svg',
  'icons/rod_square.svg',
  'icons/tube.svg',
  'icons/pipe.svg',
  'icons/channel.svg',
  'icons/beam.svg',
  'icons/sheet.svg',
  'icons/plate.svg',
  'icons/custom.svg',
  'icons/consumables.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
