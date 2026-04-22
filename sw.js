const CACHE_NAME = 'gestor-rvs-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto: ', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignora requisições de outras origens ou não-GET que não queremos forçar no cache (ex: API externa POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        
        // Clonar a req pois ela é uma stream e só pode ser consumida uma vez
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Checa se é uma resposta válida para fazermos cache dinâmico se quiser
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Para arquivos não críticos que podemos ir cacheando
            // const responseToCache = response.clone();
            // caches.open(CACHE_NAME).then(cache => {
            //   cache.put(event.request, responseToCache);
            // });

            return response;
          }
        ).catch(() => {
            // Retorna vazio ou cache offline genérico se a rede falhar
        });
      })
  );
});
