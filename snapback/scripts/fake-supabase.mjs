// A small stand-in for Supabase, just complete enough to run the app against
// during testing. It serves the built site and answers the handful of
// PostgREST queries Snapback makes, from rows held in memory.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

// Tests build into their own folder so the real dist is never left pointing
// at this stand-in.
const DIST = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  process.env.SNAPBACK_DIST || 'dist-test'
);

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

let rows = [];

// --- filters ---------------------------------------------------------------

function matches(row, column, expression) {
  const [op, ...rest] = expression.split('.');
  const value = rest.join('.');
  const cell = row[column];

  switch (op) {
    case 'eq':
      return String(cell) === value;
    case 'is':
      return value === 'null' ? cell === null || cell === undefined : String(cell) === value;
    case 'gte':
      return cell !== null && cell !== undefined && cell >= value;
    case 'lt':
      return cell !== null && cell !== undefined && cell < value;
    default:
      throw new Error(`fake-supabase does not know the filter "${op}"`);
  }
}

// or=(last_shown.is.null,last_shown.lt.2026-08-03T...)
function matchesOr(row, group) {
  const inner = group.replace(/^\(/, '').replace(/\)$/, '');
  // Split on commas that separate clauses, not commas inside a timestamp.
  const clauses = inner.split(',');
  return clauses.some((clause) => {
    const [column, ...expression] = clause.split('.');
    return matches(row, column, expression.join('.'));
  });
}

function select(params) {
  let found = rows.filter((row) => {
    for (const [key, value] of params.entries()) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue;
      if (key === 'or') {
        if (!matchesOr(row, value)) return false;
        continue;
      }
      if (!matches(row, key, value)) return false;
    }
    return true;
  });

  const order = params.get('order');
  if (order) {
    const [column, direction] = order.split('.');
    found = [...found].sort((a, b) =>
      direction === 'desc'
        ? String(b[column]).localeCompare(String(a[column]))
        : String(a[column]).localeCompare(String(b[column]))
    );
  }

  const limit = params.get('limit');
  return limit ? found.slice(0, Number(limit)) : found;
}

function readBody(request) {
  return new Promise((resolve) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => resolve(body ? JSON.parse(body) : null));
  });
}

function json(response, payload, status = 200) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'content-type': 'application/json',
    'content-range': `0-${Math.max(payload.length - 1, 0)}/*`,
  });
  response.end(body);
}

// --- server ----------------------------------------------------------------

export function start(port = 5599) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    // Test hooks.
    if (url.pathname === '/__seed' && request.method === 'POST') {
      const incoming = await readBody(request);
      rows = incoming.map((row) => ({
        id: row.id || randomUUID(),
        text: row.text,
        created_at: row.created_at || new Date().toISOString(),
        source: row.source || 'self',
        resonance: row.resonance ?? 0,
        last_shown: row.last_shown ?? null,
      }));
      return json(response, { seeded: rows.length });
    }
    if (url.pathname === '/__rows') return json(response, rows);

    if (url.pathname === '/rest/v1/snaps') {
      if (request.method === 'GET') {
        return json(response, select(url.searchParams));
      }
      if (request.method === 'POST') {
        const body = await readBody(request);
        const created = {
          id: randomUUID(),
          text: body.text,
          created_at: new Date().toISOString(),
          source: body.source || 'self',
          resonance: 0,
          last_shown: null,
        };
        rows.push(created);
        return json(response, [created], 201);
      }
      if (request.method === 'PATCH') {
        const body = await readBody(request);
        const hit = select(url.searchParams);
        hit.forEach((row) => Object.assign(row, body));
        return json(response, hit);
      }
      if (request.method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
      }
    }

    // Everything else: the built site, with unknown paths falling back to the
    // single page, exactly as Vercel is configured to do.
    const target = url.pathname === '/' ? '/index.html' : url.pathname;
    try {
      const file = await readFile(join(DIST, target));
      response.writeHead(200, { 'content-type': TYPES[extname(target)] || 'text/plain' });
      return response.end(file);
    } catch {
      const page = await readFile(join(DIST, 'index.html'));
      response.writeHead(200, { 'content-type': 'text/html' });
      return response.end(page);
    }
  });

  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().then(() => console.log('fake supabase + site on http://127.0.0.1:5599'));
}
