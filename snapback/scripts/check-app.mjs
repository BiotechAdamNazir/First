// Drives the built app in a real browser against the fake Supabase, and
// checks the behaviour that matters: one sentence a night, the same sentence
// all day, the anniversary line, the fourteen-day rest, and both write paths.
//
// Talks to Chromium over the DevTools protocol directly, so there is no test
// framework to install.
//
// Run with: npm run build && node scripts/check-app.mjs

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start } from './fake-supabase.mjs';

const SITE = 'http://127.0.0.1:5599';
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
const PORT = 9333;

let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`        ${detail}`);
}

// --- devtools plumbing -----------------------------------------------------

let socket;
let nextId = 1;
const waiting = new Map();

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  let result;
  try {
    result = await send('Runtime.evaluate', {
      expression: `(async () => { ${expression} })()`,
      awaitPromise: true,
      returnByValue: true,
    });
  } catch (error) {
    throw new Error(`${error.message}\n        while evaluating: ${expression.trim().slice(0, 120)}`);
  }
  if (result.exceptionDetails) {
    throw new Error(
      `${result.exceptionDetails.exception?.description || 'page threw'}\n        while evaluating: ${expression.trim().slice(0, 120)}`
    );
  }
  return result.result.value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Poll the page until the expression returns something truthy.
async function waitFor(expression, label, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    // An element cannot be handed back across the protocol, so waiting on one
    // becomes waiting on "is it there yet".
    const value = await evaluate(
      `const found = (${expression}); return found instanceof Element ? true : found;`
    );
    if (value) return value;
    await sleep(120);
  }
  throw new Error(`timed out waiting for ${label}`);
}

async function connect(wsUrl) {
  socket = new WebSocket(wsUrl);
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    // Surface page-side problems instead of letting them hide behind a timeout.
    if (message.method === 'Runtime.exceptionThrown') {
      console.log('        page exception:', message.params.exceptionDetails.exception?.description);
    }
    if (message.id && waiting.has(message.id)) {
      const { resolve, reject } = waiting.get(message.id);
      waiting.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
}

// --- fixtures --------------------------------------------------------------

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

async function seed(rows) {
  await fetch(`${SITE}/__seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(rows),
  });
}

const storedRows = () => fetch(`${SITE}/__rows`).then((r) => r.json());

// Load a page fresh, wiping the browser-side memory of previous nights.
// The wipe happens on /snap, which is the one screen that does not choose a
// sentence — visiting / first would spend a night before the test began.
async function open(path = '/', { keepMemory = false } = {}) {
  if (!keepMemory) {
    await send('Page.navigate', { url: `${SITE}/snap` });
    await sleep(300);
    await evaluate('localStorage.clear(); return true;');
  }
  await send('Page.navigate', { url: `${SITE}${path}` });
  await sleep(400);
}

const sentence = () =>
  evaluate("return document.querySelector('.sentence')?.textContent || null;");

// --- the checks ------------------------------------------------------------

async function run() {
  console.log('\n— the nightly return —');

  await seed([
    { text: 'first', resonance: 0 },
    { text: 'second', resonance: 0 },
    { text: 'third', resonance: 0 },
  ]);
  await open('/');
  const shown = await waitFor("document.querySelector('.sentence')?.textContent", 'a sentence');
  check('one sentence is returned', ['first', 'second', 'third'].includes(shown), shown);

  const answers = await evaluate(
    "return [...document.querySelectorAll('.answer')].map(b => b.textContent);"
  );
  check('the two answers are offered', JSON.stringify(answers) === '["Landed","Not tonight"]', answers);

  check(
    'nothing else is on the screen',
    await evaluate(
      "return !document.querySelector('header, nav') && document.querySelectorAll('button').length === 3;"
    )
  );

  // Reload several times: the choice must not move.
  let stable = true;
  for (let i = 0; i < 4; i++) {
    await open('/', { keepMemory: true });
    await waitFor("document.querySelector('.sentence')?.textContent", 'a sentence');
    if ((await sentence()) !== shown) stable = false;
  }
  check('reopening returns the same sentence all day', stable, `first showed "${shown}"`);

  const afterShowing = await storedRows();
  const chosen = afterShowing.find((row) => row.text === shown);
  check('last_shown is recorded on display', Boolean(chosen.last_shown), chosen.last_shown);
  check(
    'the sentences not chosen are left alone',
    afterShowing.filter((row) => row.last_shown).length === 1
  );

  console.log('\n— answering —');

  await evaluate("[...document.querySelectorAll('.answer')].find(b => b.textContent === 'Landed').click(); return true;");
  await waitFor("document.querySelector('.rule')", 'the quiet state');
  check('Landed dismisses to a quiet state', true);
  check(
    'the sentence is gone',
    await evaluate("return !document.querySelector('.sentence');")
  );

  const afterLanding = await storedRows();
  check(
    'Landed raises resonance by one',
    afterLanding.find((row) => row.text === shown).resonance === 1,
    afterLanding.find((row) => row.text === shown).resonance
  );

  await open('/', { keepMemory: true });
  await sleep(600);
  check(
    'the night stays closed on reopening',
    await evaluate("return Boolean(document.querySelector('.rule')) && !document.querySelector('.sentence');")
  );

  // "Not tonight" must leave resonance untouched.
  await seed([{ text: 'untouched', resonance: 3 }]);
  await open('/');
  await waitFor("document.querySelector('.sentence')", 'a sentence');
  await evaluate("[...document.querySelectorAll('.answer')].find(b => b.textContent === 'Not tonight').click(); return true;");
  await waitFor("document.querySelector('.rule')", 'the quiet state');
  check(
    'Not tonight changes nothing',
    (await storedRows())[0].resonance === 3
  );

  console.log('\n— a year ago tonight —');

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  await seed([
    { text: 'the old one', created_at: oneYearAgo.toISOString(), resonance: 0 },
    { text: 'a new one', resonance: 50 },
    { text: 'another new one', resonance: 50 },
  ]);
  await open('/');
  await waitFor("document.querySelector('.sentence')", 'a sentence');
  check('the anniversary sentence wins over everything', (await sentence()) === 'the old one');
  check(
    'the small line appears',
    (await evaluate("return document.querySelector('.anniversary')?.textContent;")) ===
      'you wrote this a year ago tonight'
  );

  await seed([{ text: 'ordinary', resonance: 0 }]);
  await open('/');
  await waitFor("document.querySelector('.sentence')", 'a sentence');
  check(
    'the line stays away on an ordinary night',
    await evaluate("return !document.querySelector('.anniversary');")
  );

  console.log('\n— the fourteen day rest —');

  await seed([
    { text: 'seen yesterday', last_shown: daysAgo(1) },
    { text: 'seen thirteen days ago', last_shown: daysAgo(13) },
    { text: 'rested', last_shown: daysAgo(15) },
  ]);
  await open('/');
  await waitFor("document.querySelector('.sentence')", 'a sentence');
  check('recently seen sentences are passed over', (await sentence()) === 'rested');

  await seed([
    { text: 'only one', last_shown: daysAgo(2) },
    { text: 'also recent', last_shown: daysAgo(3) },
  ]);
  await open('/');
  const fallback = await waitFor("document.querySelector('.sentence')?.textContent", 'a sentence');
  check(
    'when everything is recent it still returns something',
    ['only one', 'also recent'].includes(fallback),
    fallback
  );

  await seed([]);
  await open('/');
  await sleep(800);
  check(
    'an empty collection says so quietly',
    (await evaluate("return document.querySelector('.murmur')?.textContent;")) === 'nothing kept yet'
  );

  console.log('\n— writing —');

  await seed([]);
  await open('/snap');
  await sleep(400);
  await evaluate(`
    const field = document.querySelector('.field');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(field, 'a sentence written by hand');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  `);
  await evaluate("document.querySelector('.keep').click(); return true;");
  await sleep(700);
  const written = await storedRows();
  check('the writing screen saves', written.length === 1 && written[0].text === 'a sentence written by hand', written);
  check('it is filed as self', written[0]?.source === 'self');
  check(
    'saving returns to the return screen',
    await evaluate("return location.pathname === '/';")
  );

  console.log('\n— the share sheet —');

  await seed([]);
  await open('/share?text=' + encodeURIComponent('something shared') + '&title=Claude&url=' + encodeURIComponent('https://claude.ai/chat/123'));
  await waitFor("document.querySelector('.murmur')", 'a confirmation');
  check(
    'shared text is kept with a brief word',
    (await evaluate("return document.querySelector('.murmur')?.textContent;")) === 'kept'
  );
  const shared = await storedRows();
  check('the shared sentence is in the collection', shared[0]?.text === 'something shared', shared);
  check('claude.ai is recognised', shared[0]?.source === 'claude', shared[0]?.source);

  await seed([]);
  await open('/share?text=' + encodeURIComponent('from the other one') + '&url=' + encodeURIComponent('https://chatgpt.com/c/abc'));
  await waitFor("document.querySelector('.murmur')", 'a confirmation');
  check('chatgpt.com is recognised', (await storedRows())[0]?.source === 'chatgpt');

  await seed([]);
  await open('/share?text=' + encodeURIComponent('a plain thought') + '&title=Notes');
  await waitFor("document.querySelector('.murmur')", 'a confirmation');
  check('anything else is filed as self', (await storedRows())[0]?.source === 'self');

  await seed([]);
  await open('/share?text=' + encodeURIComponent('the line itself https://example.com/page'));
  await waitFor("document.querySelector('.murmur')", 'a confirmation');
  check(
    'a stapled-on address is trimmed away',
    (await storedRows())[0]?.text === 'the line itself',
    (await storedRows())[0]?.text
  );

  await seed([]);
  await open('/share?url=' + encodeURIComponent('https://example.com'));
  await waitFor("document.querySelector('.murmur')", 'a word');
  check(
    'sharing nothing but a link keeps nothing',
    (await storedRows()).length === 0 &&
      (await evaluate("return document.querySelector('.murmur')?.textContent;")) === 'nothing to keep'
  );

  console.log('\n— the shape of it —');

  await seed([{ text: 'a sentence', resonance: 0 }]);
  await open('/');
  await waitFor("document.querySelector('.sentence')", 'a sentence');
  const type = await evaluate(`
    const el = document.querySelector('.sentence');
    const style = getComputedStyle(el);
    return {
      serif: style.fontFamily.toLowerCase(),
      size: parseFloat(style.fontSize),
      centred: style.textAlign,
      animated: style.animationDuration,
    };
  `);
  check('the sentence is set in a serif', type.serif.includes('garamond') || type.serif.includes('serif'), type.serif);
  check('it is large', type.size >= 28, `${type.size}px`);
  check('it is centred', type.centred === 'center');
  check('it fades in slowly', parseFloat(type.animated) >= 1, type.animated);
  check(
    'the corner mark leads to the writing screen',
    await evaluate("document.querySelector('.mark').click(); await new Promise(r => setTimeout(r, 300)); return location.pathname === '/snap';")
  );
  check(
    'the page does not scroll sideways',
    await evaluate('return document.documentElement.scrollWidth <= window.innerWidth + 1;')
  );

  console.log('\n— installability —');

  const manifest = await fetch(`${SITE}/manifest.webmanifest`).then((r) => r.json());
  check('the share target is registered', manifest.share_target?.action === '/share');
  check('it accepts text and title by GET', manifest.share_target?.method === 'GET' &&
    manifest.share_target?.params?.text === 'text' && manifest.share_target?.params?.title === 'title');
  check('there is a maskable icon', manifest.icons.some((i) => i.purpose === 'maskable'));
  check('the service worker is served', (await fetch(`${SITE}/sw.js`)).status === 200);
  check(
    'unknown paths still serve the app',
    (await fetch(`${SITE}/share?text=x`).then((r) => r.text())).includes('<div id="root">')
  );
}

// --- go --------------------------------------------------------------------

const profile = mkdtempSync(join(tmpdir(), 'snapback-'));
const server = await start();
const browser = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=412,915', // a phone
]);

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
      target = await response.json();
    } catch {
      /* not up yet */
    }
  }
  if (!target) throw new Error('chromium did not start');

  await connect(target.webSocketDebuggerUrl);
  await send('Page.enable');
  await send('Runtime.enable');
  await run();
} catch (error) {
  failures++;
  console.error('\nharness error:', error.message);
} finally {
  browser.kill();
  server.close();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

console.log(failures ? `\n${failures} failing` : '\nall good');
process.exit(failures ? 1 : 0);
