// Takes a picture of the return screen so it can be looked at rather than
// guessed about. Writes into shots/.
//
// Run with: npm run build && node scripts/shot.mjs

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start } from './fake-supabase.mjs';

const SITE = 'http://127.0.0.1:5599';
const SHOTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const scenes = [
  {
    name: 'return',
    device: { width: 412, height: 915 },
    rows: [{ text: 'They don’t need me at their height. They need me at their standing place.' }],
    path: '/',
  },
  {
    name: 'return-short',
    device: { width: 412, height: 915 },
    rows: [{ text: 'I have tried, I am sure.' }],
    path: '/',
  },
  {
    name: 'return-anniversary',
    device: { width: 412, height: 915 },
    rows: [{ text: 'Scars are the body’s completed work.', created_at: yearAgo() }],
    path: '/',
  },
  {
    name: 'return-tablet',
    device: { width: 1848, height: 1152 },
    rows: [{ text: 'Endings aren’t exterminations. Tomorrow is an extension. The past isn’t a damnation.' }],
    path: '/',
  },
  {
    name: 'snap',
    device: { width: 412, height: 915 },
    rows: [],
    path: '/snap',
  },
  {
    name: 'snap-written',
    device: { width: 412, height: 915 },
    rows: [],
    path: '/snap',
    after: `
      const field = document.querySelector('.field');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(field, 'Jangan gelojoh sangat. Nak race dengan siapa?');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    `,
  },
  {
    name: 'quiet',
    device: { width: 412, height: 915 },
    rows: [{ text: 'I have tried, I am sure.' }],
    path: '/',
    after: `document.querySelector('.answer').click();`,
  },
];

function yearAgo() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString();
}

const profile = mkdtempSync(join(tmpdir(), 'snapback-shot-'));
const server = await start();
const browser = spawn(process.env.CHROME_PATH || '/opt/pw-browsers/chromium', [
  '--headless=new',
  '--remote-debugging-port=9355',
  `--user-data-dir=${profile}`,
  '--no-sandbox',
  '--disable-gpu',
  '--force-color-profile=srgb',
  '--hide-scrollbars',
]);

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    target = await (
      await fetch('http://127.0.0.1:9355/json/new?about:blank', { method: 'PUT' })
    ).json();
  } catch {
    /* not up yet */
  }
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
let id = 1;
const waiting = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && waiting.has(message.id)) {
    waiting.get(message.id)(message.result);
    waiting.delete(message.id);
  }
});
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
const send = (method, params = {}) => {
  const i = id++;
  socket.send(JSON.stringify({ id: i, method, params }));
  return new Promise((resolve) => waiting.set(i, resolve));
};

await send('Page.enable');
mkdirSync(SHOTS, { recursive: true });

for (const scene of scenes) {
  await fetch(`${SITE}/__seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(scene.rows),
  });

  await send('Emulation.setDeviceMetricsOverride', {
    width: scene.device.width,
    height: scene.device.height,
    deviceScaleFactor: 2,
    mobile: scene.device.width < 900,
  });

  await send('Page.navigate', { url: `${SITE}/snap` });
  await sleep(300);
  await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
  await send('Page.navigate', { url: `${SITE}${scene.path}` });
  await sleep(1200);

  if (scene.after) {
    await send('Runtime.evaluate', { expression: scene.after });
  }
  await sleep(2400); // let the fade finish

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(SHOTS, `${scene.name}.png`), Buffer.from(shot.data, 'base64'));
  console.log('wrote shots/' + scene.name + '.png');
}

browser.kill();
server.close();
await sleep(300);
rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
process.exit(0);
