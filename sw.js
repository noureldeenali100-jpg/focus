// This is a simple service worker to satisfy PWA installability requirements
// Progressier handles the actual caching and push logic via the script.js integration

const CACHE_NAME = 'focusguardian-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard fetch handler to satisfy PWA criteria
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});