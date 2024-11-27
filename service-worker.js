const CACHE_NAME = 'simple-pwa-cache-v2'; // 修改缓存版本号以触发新的安装
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://script.google.com/macros/s/AKfycbwtnGXbdiBJcozxIKrfh6c4uRpEj7l4FU29rN2MI8mP1OSy6hELtMVz_sRmDbOzWiAkqw/exec',
];

// 安装阶段：缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 捕获请求：优先使用缓存，后台更新缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 从缓存中返回内容，同时更新缓存
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // 如果是有效的网络响应，将其添加到缓存
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.error('Network request failed, using cache as fallback.');
        });

      // 返回缓存内容或网络响应
      return response || fetchPromise;
    })
  );
});
