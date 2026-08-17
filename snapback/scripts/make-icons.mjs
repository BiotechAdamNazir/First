// Draws the app icons: a single warm dot on a dark ground — a full stop,
// for an app that returns one sentence. Written with Node's built-in zlib so
// there is no image library to install.
//
// Run with: node scripts/make-icons.mjs

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const GROUND = [0x0a, 0x0a, 0x0b];
const INK = [0xe9, 0xe3, 0xd9];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// `radius` is a fraction of the canvas width. Coverage is sampled so the edge
// of the dot is smooth rather than stepped.
function draw(size, radius) {
  const centre = size / 2;
  const r = size * radius;
  const rows = Buffer.alloc(size * (size * 3 + 1));
  let at = 0;

  for (let y = 0; y < size; y++) {
    rows[at++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let inside = 0;
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          const dx = x + (sx + 0.5) / 4 - centre;
          const dy = y + (sy + 0.5) / 4 - centre;
          if (dx * dx + dy * dy <= r * r) inside++;
        }
      }
      const a = inside / 16;
      for (let c = 0; c < 3; c++) {
        rows[at++] = Math.round(GROUND[c] * (1 - a) + INK[c] * a);
      }
    }
  }
  return rows;
}

mkdirSync(OUT, { recursive: true });

const icons = [
  ['icon-192.png', 192, 0.13],
  ['icon-512.png', 512, 0.13],
  // Maskable icons get cropped to a circle by Android, so the dot sits well
  // inside the safe zone.
  ['icon-maskable-512.png', 512, 0.095],
];

for (const [name, size, radius] of icons) {
  writeFileSync(join(OUT, name), png(size, draw(size, radius)));
  console.log('wrote', name, `${size}x${size}`);
}
