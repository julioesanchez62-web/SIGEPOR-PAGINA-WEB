/**
 * Service Worker para SIGEPOR PWA
 * - Almacenamiento en caché de recursos estáticos de la aplicación
 * - Estrategia Network-First con fallback a caché para vistas
 * - Omite llamadas a /api para delegarlas a IndexedDB y Axios
 */

const CACHE_NAME = 'sigepor-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.jpg',
  '/logo1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Las peticiones a la API del backend NO se interceptan con caché HTTP simple
  // para permitir que Axios e IndexedDB gestionen la cola offline
  if (url.pathname.startsWith('/api') || url.port === '3001') {
    return;
  }

  // Para peticiones de navegación o estáticos: Network first con fallback a caché
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si es una navegación HTML, retornar el index.html principal de la SPA
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        })
    );
  }
});
