/* ===========================================================
 * docsify sw.js —— network-first 版
 * ===========================================================
 * 旧版是 stale-while-revalidate：命中最快的是缓存，所以 push 完刷新
 * 往往还是旧内容（这次侧边栏没更新就是它）。改成「先要网络，只有
 * 网络超时/断开才回落缓存」，保证改完文件刷新即生效，同时保留离线能力。
 *
 * 版本号变更会清空旧 cache，见 activate。
 * ========================================================== */

const RUNTIME = 'docsify-v6';
const TIMEOUT_MS = 3500;

// 新版本立即接管，不用等所有标签页关闭
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== RUNTIME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('sw-timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // 只接管本站请求，跨域的（统计脚本等）交给浏览器
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME);
      try {
        const fresh = await withTimeout(fetch(request, { cache: 'no-store' }), TIMEOUT_MS);
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch (error) {
        const hit = await cache.match(request, { ignoreSearch: true });
        if (hit) return hit;
        throw error;
      }
    })()
  );
});
