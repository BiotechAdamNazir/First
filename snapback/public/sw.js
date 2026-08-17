// Snapback service worker.
//
// Two jobs only: make the app installable (which is what puts it in Android's
// share sheet), and speak once a night.

const SHELL = 'snapback-shell-v1';
const STATE = 'snapback-state-v1';

const NOTIFY_HOUR = 21; // 21:00, Asia/Kuala_Lumpur
const TZ = 'Asia/Kuala_Lumpur';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(['/']))
      .then(() => self.skipWaiting())
  );
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
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;

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
