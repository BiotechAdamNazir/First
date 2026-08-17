// Everything in Snapback is anchored to one timezone so that "today" means the
// same thing on every device and never drifts when travelling.
export const TZ = 'Asia/Kuala_Lumpur';

// Kuala Lumpur is UTC+8 all year — no daylight saving — so the offset is a
// constant. That lets us build exact timestamps by hand instead of guessing.
const OFFSET = '+08:00';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const hourFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// "2026-08-17" for the given moment, as seen in Kuala Lumpur.
export function klDate(at = new Date()) {
  return dateFormatter.format(at); // en-CA formats as YYYY-MM-DD
}

// { hour, minute } as seen in Kuala Lumpur.
export function klClock(at = new Date()) {
  const [hour, minute] = hourFormatter.format(at).split(':').map(Number);
  return { hour, minute };
}

// The exact UTC instants that a Kuala Lumpur calendar day starts and ends.
// Used to ask the database for "rows created on this particular day".
export function klDayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00${OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

// The same calendar date one year earlier. Returns null for 29 February,
// which has no counterpart in a non-leap year.
export function oneYearAgo(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const previous = `${y - 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  // Reject dates the calendar does not actually contain (e.g. 2025-02-29).
  const check = new Date(`${previous}T00:00:00${OFFSET}`);
  return klDate(check) === previous ? previous : null;
}
