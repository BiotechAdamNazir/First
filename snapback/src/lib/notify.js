// One local notification a day, at the hour set below, with no preview text.
//
// A browser page cannot wake itself up while closed. Without a push server the
// closest thing available on Android Chrome is Periodic Background Sync: the
// browser wakes the installed app's service worker every so often, and the
// worker decides whether it is time to speak. The browser chooses when to run
// it, so this is dependable-ish rather than exact — see README.
export const NOTIFY_HOUR = 21; // 21:00, Asia/Kuala_Lumpur
export const NOTIFY_TAG = 'snapback-daily';

// Ask for permission only from a real tap, and only once.
export async function ensurePermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export async function registerDaily() {
  if (!('serviceWorker' in navigator)) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  if (!('periodicSync' in registration)) return;

  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return;
    await registration.periodicSync.register(NOTIFY_TAG, {
      minInterval: 6 * 60 * 60 * 1000, // ask to be woken roughly four times a day
    });
  } catch {
    /* not supported here; the app still works */
  }
}

// Convenience: called after any deliberate tap.
export async function offerNotifications() {
  const granted = await ensurePermission();
  if (granted) await registerDaily();
}
