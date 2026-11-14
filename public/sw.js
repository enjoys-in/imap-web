const ICON = '/favicon.ico';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function readPayload(event) {
  if (!event.data) return null;
  try {
    return event.data.json();
  } catch {
    return { title: 'AirSend', body: event.data.text() };
  }
}

function sameOriginUrl(value) {
  try {
    const url = new URL(value || '/', self.location.origin);
    return url.origin === self.location.origin ? url.href : new URL('/', self.location.origin).href;
  } catch {
    return new URL('/', self.location.origin).href;
  }
}

self.addEventListener('push', (event) => {
  const payload = readPayload(event);
  if (!payload || !payload.title) return;

  const options = {
    body: payload.body || '',
    icon: ICON,
    badge: ICON,
    data: payload.data || {},
  };
  if (payload.tag) {
    options.tag = payload.tag;
    options.renotify = true;
  }

  event.waitUntil(self.registration.showNotification(String(payload.title), options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        open.postMessage({ type: 'airsend:open-mail', folder: data.folder, uid: data.uid });
        return;
      }
      await self.clients.openWindow(sameOriginUrl(data.url));
    })()
  );
});
