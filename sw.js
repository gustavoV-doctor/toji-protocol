const CACHE_NAME = 'toji-tracker-v8';
const BASE_PATH = self.registration.scope;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/icon_512.png',
    './assets/toji_bg.jpg',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Serif+JP:wght@400;700;900&display=swap'
];

// Install: cache all core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch:
//  - Arquivos do próprio app (HTML/CSS/JS) → network-first: sempre frescos online,
//    caem pro cache offline. Evita o app "preso" numa versão antiga após atualizar.
//  - Terceiros (Google Fonts, com URL versionada) → cache-first: rápido e estável.
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const sameOrigin = new URL(req.url).origin === self.location.origin;

    if (sameOrigin) {
        // network-first
        event.respondWith(
            fetch(req).then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(req, clone));
                }
                return res;
            }).catch(() =>
                caches.match(req).then(hit =>
                    hit || (req.destination === 'document' ? caches.match('./index.html') : undefined))
            )
        );
        return;
    }

    // cache-first (fonts e afins)
    event.respondWith(
        caches.match(req).then(hit => hit || fetch(req).then(res => {
            if (res && res.status === 200) {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, clone));
            }
            return res;
        }).catch(() => undefined))
    );
});
