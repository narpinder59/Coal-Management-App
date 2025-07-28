// Service Worker for PWA functionality
const CACHE_NAME = 'coal-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/date-formatter.js',
  '/MainDashboard.js',
  '/utils.js',
  '/LRParseDate.js',
  '/MDCWL-Lifting.js',
  '/MDCWL-Loading.js',
  '/Pachhwara-Prod&Desp.js',
  '/Pachhwara-QualityAnalysis.js',
  '/Loading&Receipt.js',
  '/CoalQualityPDF.js',
  '/CoalQuality&CostAnalysis.js',
  '/Dashboard-DailyCoalPosition.js',
  '/Dashbaord-Pachhwara.js',
  '/components/navbar.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
