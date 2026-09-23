// Snapback service worker.
//
// Two jobs only: make the app installable (which is what puts it in Android's
// share sheet), and speak once a night.

const SHELL = 'snapback-shell-v2';
const STATE = 'snapback-state-v1';

const NOTIFY_HOUR = 21; // 21:00, Asia/Kuala_Lumpur
const TZ = 'Asia/Kuala_Lumpur';

// The page plus everything it names — its code, styles, typeface and icon —
// so the app, and above all the share screen, opens with no signal at all.
// The build gives these files new names whenever they change, so they are
// read out of the page itself rather than listed here.
async function keepShell() {
  const cache = await caches.open(SHELL);
  const page = await fetch('/', { cache: 'no-store' });
  const html = await page.clone().text();
  const files = [...html.matchAll(/(?:src|href)="(\/(?:assets|fonts|icons)\/[^"]+)"/g)].map(
    (match) => match[1]
  );
  await cache.put('/', page);
  await cache.addAll([...new Set(files)]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(keepShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL && key !== STATE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network first, so a deploy is picked up immediately; the cached shell is
// only there so a cold start without signal still draws something.
// Files whose names change with their contents never go stale, so once held
// they are served from here without asking the network.
const LASTING = /^\/(assets|fonts|icons)\//;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && LASTING.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(SHELL).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  if (request.mode !== 'navigate') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SHELL).then((cache) => cache.put('/', copy));
        return response;
      })
      .catch(() => caches.match('/').then((cached) => cached || Response.error()))
  );
});

// --- the nightly notification ---------------------------------------------

const NOTIFIED_URL = '/__snapback_notified';

// A service worker has no localStorage, so the last notified date is parked
// in the cache as an ordinary little response.
async function lastNotified() {
  const cache = await caches.open(STATE);
  const hit = await cache.match(NOTIFIED_URL);
  return hit ? hit.text() : null;
}

async function rememberNotified(date) {
  const cache = await caches.open(STATE);
  await cache.put(NOTIFIED_URL, new Response(date));
}

function kualaLumpurNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const value = (type) => parts.find((part) => part.type === type).value;
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    // Some runtimes render midnight as "24" in this format.
    hour: Number(value('hour')) % 24,
  };
}

async function speakIfItIsTime() {
  const { date, hour } = kualaLumpurNow();
  if (hour < NOTIFY_HOUR) return;
  if ((await lastNotified()) === date) return;

  await rememberNotified(date);
  // No preview text. The name is the whole message.
  await self.registration.showNotification('Snapback', {
    tag: 'snapback-nightly',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    silent: false,
  });
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'snapback-daily') {
    event.waitUntil(speakIfItIsTime());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
