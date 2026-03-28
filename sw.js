const CACHE_NAME = 'cash-manager-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-102.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/chart.js',
  './js/all.min.js'
];

// Install event – cache all static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event – serve from cache, fallback to network, then cache new responses
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
          // Cache the fetched response for future use
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
      .catch(() => {
        return new Response('Offline – please check your internet connection.', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});