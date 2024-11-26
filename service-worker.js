// 缓存的名称和要缓存的文件列表
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/', // 缓存根路径（index.html）
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon.png' // 替换为你的实际图标路径
];

// 安装阶段：缓存必要的文件
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求，优先返回缓存内容
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // 如果找到缓存内容，直接返回；否则发起网络请求
      return response || fetch(event.request);
    })
  );
});
