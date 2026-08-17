// Each snap gets `resonance + 1` tickets, so a snap that has never landed
// still has exactly one chance, and a snap that has landed often has more.
export function weightedPick(snaps, random = Math.random) {
  const total = snaps.reduce((sum, snap) => sum + snap.resonance + 1, 0);
  let ticket = random() * total;
  for (const snap of snaps) {
    ticket -= snap.resonance + 1;
    if (ticket < 0) return snap;
  }
  return snaps[snaps.length - 1];
}
