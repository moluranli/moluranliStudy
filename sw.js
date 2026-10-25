/* ===========================================================
 * docsify sw.js 鈥斺€?network-first 鐗? * ===========================================================
 * 鏃х増鏄?stale-while-revalidate锛氬懡涓渶蹇殑鏄紦瀛橈紝鎵€浠?push 瀹屽埛鏂? * 寰€寰€杩樻槸鏃у唴瀹癸紙杩欐渚ц竟鏍忔病鏇存柊灏辨槸瀹冿級銆傛敼鎴愩€屽厛瑕佺綉缁滐紝鍙湁
 * 缃戠粶瓒呮椂/鏂紑鎵嶅洖钀界紦瀛樸€嶏紝淇濊瘉鏀瑰畬鏂囦欢鍒锋柊鍗崇敓鏁堬紝鍚屾椂淇濈暀绂荤嚎鑳藉姏銆? *
 * 鐗堟湰鍙峰彉鏇翠細娓呯┖鏃?cache锛岃 activate銆? * ========================================================== */

const RUNTIME = 'docsify-v5';
const TIMEOUT_MS = 3500;

// 鏂扮増鏈珛鍗虫帴绠★紝涓嶇敤绛夋墍鏈夋爣绛鹃〉鍏抽棴
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
  // 鍙帴绠℃湰绔欒姹傦紝璺ㄥ煙鐨勶紙缁熻鑴氭湰绛夛級浜ょ粰娴忚鍣?  if (url.origin !== self.location.origin) return;

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
