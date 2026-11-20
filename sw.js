// LUMI 앱 서비스 워커: 앱 첫 화면(이 저장소의 파일)만 기억해 두었다가 인터넷이 안 될 때 보여 준다.
// GitHub API(LUMI agent·연구 기록)는 절대 저장하지 않는다 — 항상 네트워크로 받는다.
const CACHE = "lumi-app-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;   // 같은 사이트 파일만
  e.respondWith(fetch(e.request).then(r => {                                        // 새 버전 먼저, 안 되면 저장본
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html"))));
});
