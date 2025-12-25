// This Service Worker file is required by Progressier to verify integration.
// It imports the logic needed for push notifications and offline caching.

importScripts('https://progressier.app/A2JJtyHQ8pSrCd5DtvXN/sw.js');

// Optional: Custom service worker logic can go here
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});