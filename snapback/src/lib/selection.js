import { supabase } from './supabase';
import { klDate, klDayBounds, oneYearAgo } from './day';
import { weightedPick } from './draw';

const RESPONDED_KEY = 'snapback.responded';

const QUIET_DAYS = 14;

// localStorage throws in some privacy modes; nothing here is important enough
// to break the screen over.
function readStore(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

// --- the day's answer ------------------------------------------------------
// "Landed" / "Not tonight" close the night. Recorded per calendar day so that
// reopening the app does not reopen the question.

export function hasResponded() {
  return readStore(RESPONDED_KEY) === klDate();
}

export function markResponded() {
  writeStore(RESPONDED_KEY, klDate());
}

// --- selection -------------------------------------------------------------

async function findAnniversary(today) {
  const lastYear = oneYearAgo(today);
  if (!lastYear) return null;

  const { start, end } = klDayBounds(lastYear);
  const { data, error } = await supabase
    .from('snaps')
    .select('*')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw error;
  return data && data.length ? data[0] : null;
}

async function drawFromPool() {
  const cutoff = new Date(Date.now() - QUIET_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: rested, error } = await supabase
    .from('snaps')
    .select('*')
    .or(`last_shown.is.null,last_shown.lt.${cutoff}`);

  if (error) throw error;
  if (rested && rested.length) return weightedPick(rested);

  // Everything has been seen inside the quiet window. Rather than show
  // nothing, fall back to the whole collection on the same weighting.
  const { data: all, error: allError } = await supabase.from('snaps').select('*');
  if (allError) throw allError;
  if (!all || !all.length) return null;
  return weightedPick(all);
}

async function touchLastShown(snap) {
  const now = new Date().toISOString();
  const { error } = await supabase.from('snaps').update({ last_shown: now }).eq('id', snap.id);
  // A failed timestamp write must not swallow the sentence itself.
  if (error) console.warn('could not record last_shown', error);
  return { ...snap, last_shown: now };
}

// Two overlapping asks — a screen mounting twice, say — must not spend two
// nights. The second waits on the first rather than drawing again.
let inFlight = null;

// Returns { snap, anniversary } for tonight, or { snap: null } if the
// collection is empty. The result is fixed for the whole Kuala Lumpur calendar
// day, on every device: the database is the only record of the choice, so a
// phone and a tablet opened on the same night show the same sentence.
export function tonight() {
  if (!inFlight) {
    inFlight = choose().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

// Tonight's sentence is whichever was first shown today. If two devices ever
// choose at the same moment, both settle on the earlier of the two.
async function shownToday(today) {
  const { start, end } = klDayBounds(today);
  const { data, error } = await supabase
    .from('snaps')
    .select('*')
    .gte('last_shown', start)
    .lt('last_shown', end)
    .order('last_shown', { ascending: true })
    .limit(1);
  if (error) throw error;
  return data && data.length ? data[0] : null;
}

// Whether a snap was written exactly one year before the given day.
function writtenAYearBefore(snap, today) {
  const lastYear = oneYearAgo(today);
  if (!lastYear || !snap.created_at) return false;
  return klDate(new Date(snap.created_at)) === lastYear;
}

async function choose() {
  const today = klDate();

  const already = await shownToday(today);
  if (already) {
    return { snap: already, anniversary: writtenAYearBefore(already, today) };
  }

  const anniversarySnap = await findAnniversary(today);
  const chosen = anniversarySnap || (await drawFromPool());
  if (!chosen) return { snap: null, anniversary: false };

  await touchLastShown(chosen);

  // Read back rather than trust our own pick, in case another device chose
  // in the same instant. Whoever wrote first wins, and the loser's mark is
  // undone so that sentence is not rested for a night it was never read.
  const settled = (await shownToday(today)) || chosen;
  if (settled.id !== chosen.id) {
    await supabase
      .from('snaps')
      .update({ last_shown: chosen.last_shown })
      .eq('id', chosen.id);
  }
  return { snap: settled, anniversary: writtenAYearBefore(settled, today) };
}

// --- writes ----------------------------------------------------------------

export async function landed(snap) {
  const { error } = await supabase
    .from('snaps')
    .update({ resonance: snap.resonance + 1 })
    .eq('id', snap.id);
  if (error) throw error;
}

export async function save(text, source = 'self') {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const { data, error } = await supabase
    .from('snaps')
    .insert({ text: trimmed, source })
    .select()
    .limit(1);
  if (error) throw error;
  return data && data.length ? data[0] : null;
}
