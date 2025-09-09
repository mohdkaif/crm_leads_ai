// Basic service worker for CRM Leads AI
const CACHE_NAME = 'crm-leads-ai-v1';
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/leads',
  '/analytics',
  '/ai-insights',
  '/activities',
  '/users',
  '/settings'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
