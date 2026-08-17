// Checks the two pieces of arithmetic the app depends on: what "today" means
// in Kuala Lumpur, and how the weighted draw shares out the tickets.
//
// Run with: node scripts/check-logic.mjs

import { klDate, klClock, klDayBounds, oneYearAgo } from '../src/lib/day.js';
import { weightedPick } from '../src/lib/draw.js';

let failures = 0;

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) console.log(`        expected ${JSON.stringify(expected)}\n        got      ${JSON.stringify(actual)}`);
}

// --- the calendar day ------------------------------------------------------

// 17:30 UTC is already the next day in Kuala Lumpur (UTC+8).
check('late UTC evening is already tomorrow in KL',
  klDate(new Date('2026-08-17T17:30:00Z')), '2026-08-18');

check('early UTC morning is the same KL day',
  klDate(new Date('2026-08-17T02:00:00Z')), '2026-08-17');

// Just before and just after midnight in Kuala Lumpur.
check('23:59 KL is still today',
  klDate(new Date('2026-08-17T15:59:00Z')), '2026-08-17');
check('00:00 KL is tomorrow',
  klDate(new Date('2026-08-17T16:00:00Z')), '2026-08-18');

check('KL clock reads 21:00 at 13:00 UTC',
  klClock(new Date('2026-08-17T13:00:00Z')), { hour: 21, minute: 0 });

check('a KL day runs 16:00 UTC to 16:00 UTC',
  klDayBounds('2026-08-17'),
  { start: '2026-08-16T16:00:00.000Z', end: '2026-08-17T16:00:00.000Z' });

check('one year back from an ordinary day', oneYearAgo('2026-08-17'), '2025-08-17');
check('one year back from 1 January', oneYearAgo('2026-01-01'), '2025-01-01');
check('29 February has no counterpart', oneYearAgo('2024-02-29'), null);
check('one year back into a leap year', oneYearAgo('2025-03-01'), '2024-03-01');

// --- the draw --------------------------------------------------------------

const snaps = [
  { id: 'a', resonance: 0 }, // 1 ticket
  { id: 'b', resonance: 2 }, // 3 tickets
  { id: 'c', resonance: 5 }, // 6 tickets
]; // 10 tickets in total

check('the first ticket draws the first snap', weightedPick(snaps, () => 0).id, 'a');
check('ticket 1.5 of 10 falls in b', weightedPick(snaps, () => 0.15).id, 'b');
check('ticket 9.9 of 10 falls in c', weightedPick(snaps, () => 0.99).id, 'c');
check('a random value of exactly 1 still returns a snap',
  weightedPick(snaps, () => 1).id, 'c');
check('a single snap is always the answer',
  weightedPick([{ id: 'only', resonance: 0 }], () => 0.99).id, 'only');

// Every snap with zero resonance should come up about equally often, and a
// snap with resonance 5 about six times as often as one with zero.
const tally = { a: 0, b: 0, c: 0 };
for (let i = 0; i < 60000; i++) tally[weightedPick(snaps).id]++;
const ratio = tally.c / tally.a;
const withinRange = ratio > 5.4 && ratio < 6.6;
if (!withinRange) failures++;
console.log(`${withinRange ? 'ok  ' : 'FAIL'}  resonance 5 is drawn ~6x as often as resonance 0 (${ratio.toFixed(2)}x)`);

// A snap that has never landed must still be reachable.
const neverLands = [{ id: 'quiet', resonance: 0 }, { id: 'loud', resonance: 999 }];
let reached = false;
for (let i = 0; i < 20000 && !reached; i++) {
  if (weightedPick(neverLands).id === 'quiet') reached = true;
}
if (!reached) failures++;
console.log(`${reached ? 'ok  ' : 'FAIL'}  a never-landed snap is still reachable`);

console.log(failures ? `\n${failures} failing` : '\nall good');
process.exit(failures ? 1 : 0);
