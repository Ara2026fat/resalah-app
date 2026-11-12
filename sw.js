// يخزّن ملفات التطبيق ليعمل دون اتصال. غيّر VERSION عند كل تحديث ليصل للمستخدمين.
const VERSION = 'resalah-20261112-1637';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-48.png'];
// cache:'reload' و'no-cache' يتجاوزان ذاكرة المتصفح المؤقتة (GitHub Pages يحتفظ بالملفات نحو 10 دقائق) فلا يُخزَّن إصدار قديم تحت رقم جديد.
self.addEventListener('install', (e) => e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin && u.pathname.endsWith('/settings.json')) return; // ملف النشر يُجلب دائمًا من الشبكة ولا يُخزَّن
  const same = u.origin === location.origin;
  const ok = same || u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com';
  if (!ok) return;
  e.respondWith(fetch(req, same ? { cache: 'no-cache' } : undefined).then((res) => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return res; })
    .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
