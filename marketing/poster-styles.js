// Poster styles, shared by the live preview and the PNG exporter.
// This is plain CSS kept inside a JS string so the exporter can read it even when
// index.html is opened straight from disk (browsers block reading .css files there).
// Edit it like any stylesheet; just don't use backticks.
window.POSTER_CSS = String.raw`
/* ==========================================================================
   Poster system: shared by every template.
   The canvas is always 1080px wide; sizes only change the height and spacing.
   All text inside .p-main is sized in em, so the studio can shrink/grow the
   whole block to fit whatever you type (see fit() in editor.js).
   ========================================================================== */

.poster {
  --paper: #faf7f0;
  --ink: #1b1f27;
  position: relative;
  width: 1080px;
  height: var(--h);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: var(--pad-y) var(--pad-x);
  background: var(--bg);
  color: var(--fg);
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  line-height: 1.25;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}
.poster *,
.poster *::before,
.poster *::after {
  box-sizing: border-box;
}

/* ---- sizes ---- */
.size-square   { --h: 1080px; --pad-y: 52px;  --pad-x: 68px; --base: 30px; --chrome: 1; }
.size-portrait { --h: 1350px; --pad-y: 60px;  --pad-x: 72px; --base: 33px; --chrome: 1.05; }
/* Story keeps ~190px clear top & bottom for the app's own UI overlays. */
.size-story    { --h: 1920px; --pad-y: 190px; --pad-x: 76px; --base: 40px; --chrome: 1.2; }

/* ---- themes ---- */
.theme-dark {
  --bg: var(--primary);
  --fg: var(--on-primary);
  --head: var(--on-primary);
  --hi: var(--accent);
  --on-hi: var(--on-accent);
  --em: var(--accent);
  --soft: color-mix(in srgb, var(--on-primary) 10%, transparent);
  --line: color-mix(in srgb, var(--on-primary) 22%, transparent);
  --muted: color-mix(in srgb, var(--on-primary) 74%, transparent);
}
.theme-light {
  --bg: var(--paper);
  --fg: var(--ink);
  --head: var(--primary);
  --hi: var(--accent);
  --on-hi: var(--on-accent);
  --em: var(--primary);
  --soft: color-mix(in srgb, var(--primary) 7%, #fff);
  --line: color-mix(in srgb, var(--primary) 16%, transparent);
  --muted: color-mix(in srgb, var(--ink) 68%, transparent);
}
.theme-accent {
  --bg: var(--accent);
  --fg: var(--on-accent);
  --head: var(--primary);
  --hi: var(--primary);
  --on-hi: var(--on-primary);
  --em: var(--primary);
  --soft: color-mix(in srgb, var(--primary) 10%, transparent);
  --line: color-mix(in srgb, var(--primary) 22%, transparent);
  --muted: color-mix(in srgb, var(--on-accent) 76%, transparent);
}

/* *highlight* markup */
.theme-dark .hl { color: var(--accent); }
.theme-light .hl {
  color: var(--primary);
  background: linear-gradient(transparent 60%, color-mix(in srgb, var(--accent) 85%, transparent) 60%, color-mix(in srgb, var(--accent) 85%, transparent) 94%, transparent 94%);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  padding: 0 0.06em;
}
.theme-accent .hl {
  color: var(--on-primary);
  background: var(--primary);
  padding: 0 0.16em;
  border-radius: 0.12em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* ---- layers ---- */
.p-deco { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.p-deco > * { position: absolute; }
.p-head, .p-main, .p-foot { position: relative; z-index: 1; }

.ic { width: 1em; height: 1em; flex: none; display: block; }

/* ---- header (brand) ---- */
.p-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.7em;
  font-size: calc(24px * var(--chrome));
  margin-bottom: calc(18px * var(--chrome));
}
.logo {
  width: 3.2em;
  height: 3.2em;
  border-radius: 50%;
  flex: none;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--hi);
  color: var(--on-hi);
  font-family: Poppins, sans-serif;
  font-weight: 800;
  font-size: 1.05em;
  letter-spacing: 0.02em;
}
.logo.has-img { background: none; border-radius: 0; width: auto; max-width: 9em; }
.logo.has-img img { height: 100%; width: auto; max-width: 100%; object-fit: contain; display: block; }
.brand b {
  display: block;
  font-family: Poppins, sans-serif;
  font-weight: 700;
  font-size: 1.12em;
  line-height: 1.15;
  color: var(--head);
}
.brand small { display: block; font-size: 0.8em; font-weight: 600; color: var(--muted); margin-top: 0.15em; }

/* ---- footer (contacts) ---- */
.p-foot {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45em 1.3em;
  margin-top: calc(20px * var(--chrome));
  padding: 0.7em 1.1em;
  border-radius: 0.9em;
  background: var(--soft);
  font-size: calc(22px * var(--chrome));
  font-weight: 700;
  color: var(--fg);
}
.p-foot span { display: inline-flex; align-items: center; gap: 0.4em; white-space: nowrap; }
.p-foot .ic { width: 1.25em; height: 1.25em; color: var(--em); }
.theme-light .p-foot { background: var(--primary); color: var(--on-primary); }
.theme-light .p-foot .ic { color: var(--accent); }

/* ---- main content ---- */
.p-main {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  font-size: var(--base);
}
.p-content { flex: none; display: flex; flex-direction: column; align-items: flex-start; overflow-wrap: break-word; }

.eyebrow {
  display: inline-block;
  font-weight: 800;
  font-size: 0.7em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--on-hi);
  background: var(--hi);
  padding: 0.5em 1.05em;
  border-radius: 99px;
  margin-bottom: 0.9em;
}
.eyebrow .hl { color: inherit; background: none; padding: 0; }
.h1 {
  font-family: Poppins, sans-serif;
  font-weight: 800;
  font-size: 2.3em;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--head);
}
.h1.xl { font-size: 2.85em; }
.h-en { font-size: 0.88em; font-weight: 600; color: var(--muted); margin-top: 0.45em; line-height: 1.35; }

/* ============================ ENROLMENT ============================ */
.tpl-intake .deco-circle {
  right: -300px; top: -300px; width: 680px; height: 680px; border-radius: 50%;
  border: 80px solid var(--accent); opacity: 0.9;
}
.deco-dots {
  right: 24px; bottom: 15%; width: 240px; height: 200px; opacity: 0.45;
  background-image: radial-gradient(var(--accent) 3.2px, transparent 3.8px);
  background-size: 26px 26px;
}
.levels { display: flex; flex-direction: column; gap: 0.3em; margin-top: 1.05em; }
.levels span {
  font-family: Poppins, sans-serif; font-weight: 700; font-size: 1.02em;
  padding-left: 0.7em; border-left: 0.2em solid var(--accent);
}
.chips { display: flex; flex-wrap: wrap; gap: 0.38em; margin-top: 1em; }
.chips span {
  font-size: 0.72em; font-weight: 700; padding: 0.42em 0.95em; border-radius: 99px;
  border: 2px solid var(--line); background: var(--soft);
}
.cta {
  display: flex; align-items: center; gap: 0.6em; margin-top: 1.15em;
  background: var(--hi); color: var(--on-hi);
  padding: 0.55em 1.2em 0.55em 0.8em; border-radius: 0.6em;
  box-shadow: 0 0.22em 0 color-mix(in srgb, var(--hi) 55%, #000);
}
.cta .ic { width: 1.65em; height: 1.65em; }
.cta b { display: block; font-size: 0.92em; font-weight: 800; }
.cta small { display: block; font-size: 0.64em; font-weight: 700; opacity: 0.78; margin-top: 0.1em; }

.tpl-timetable .deco-band {
  left: 0; right: 0; top: 0; height: 16px;
  background: linear-gradient(90deg, var(--primary) 0 70%, var(--accent) 70% 100%);
}
.tt {
  width: 100%; margin-top: 1em; border-collapse: separate; border-spacing: 0;
  font-size: 0.7em; background: #fff; border-radius: 0.8em; overflow: hidden;
  box-shadow: 0 0.3em 1.2em rgba(0, 0, 0, 0.07);
}
.tt th {
  background: var(--primary); color: var(--on-primary); text-align: left;
  font-weight: 800; font-size: 0.82em; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0.85em 0.9em;
}
.tt td { padding: 0.72em 0.9em; overflow-wrap: normal; border-top: 1px solid var(--line); font-weight: 600; vertical-align: middle; }
.tt tbody tr:nth-child(even) td { background: var(--soft); }
.tt td:first-child { font-weight: 800; color: var(--primary); }
.tt td:nth-child(3) { font-weight: 800; }
.tt td:not(:nth-child(3)) { white-space: nowrap; }
.note { display: flex; align-items: center; gap: 0.5em; margin-top: 1em; font-size: 0.7em; font-weight: 700; color: var(--muted); }
.note .ic { width: 1.4em; height: 1.4em; color: var(--primary); }

.packs { display: grid; grid-template-columns: repeat(var(--n, 3), 1fr); gap: 0.6em; margin-top: 1.3em; width: 100%; }
.packs.n1 { --n: 1; } .packs.n2 { --n: 2; } .packs.n4 { --n: 2; }
.size-story .packs { grid-template-columns: 1fr; gap: 0.9em; }
.pack {
  position: relative; display: flex; flex-direction: column;
  background: #fff; border: 2px solid var(--line); border-radius: 0.7em; padding: 1em 0.9em;
}
.pack.featured {
  background: var(--primary); color: var(--on-primary); border-color: var(--primary);
  box-shadow: 0 0.5em 1.4em color-mix(in srgb, var(--primary) 35%, transparent);
}
.badge {
  position: absolute; top: 0; left: 50%; transform: translate(-50%, -55%);
  background: var(--accent); color: var(--on-accent); white-space: nowrap;
  font-size: 0.48em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.4em 1em; border-radius: 99px;
}
.pk-name { font-size: 0.7em; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8; }
.pk-price { font-family: Poppins, sans-serif; font-weight: 800; font-size: 1.65em; line-height: 1.1; margin: 0.2em 0 0.35em; color: var(--primary); }
.featured .pk-price { color: var(--accent); }
.pk-price small { display: block; font-family: "Plus Jakarta Sans", sans-serif; font-size: 0.36em; font-weight: 700; letter-spacing: 0; margin-top: 0.15em; opacity: 0.75; }
.pack ul { list-style: none; margin: 0; padding: 0.6em 0 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 0.45em; }
.featured ul { border-color: color-mix(in srgb, var(--on-primary) 25%, transparent); }
.pack li { display: flex; gap: 0.45em; font-size: 0.62em; font-weight: 600; line-height: 1.3; }
.pack li .ic { width: 1.25em; height: 1.25em; color: var(--primary); }
.size-story .pack { display: grid; grid-template-columns: 40% 1fr; align-items: center; column-gap: 0.8em; padding: 1em 1.1em; }
.size-story .pack ul { border-top: 0; border-left: 1px solid var(--line); padding: 0 0 0 0.8em; }
.size-story .featured ul { border-color: color-mix(in srgb, var(--on-primary) 25%, transparent); }
.featured li .ic { color: var(--accent); }
.tpl-fees .note { font-size: 0.62em; }

/* ======================= RESULTS & TESTIMONIALS ======================= */
.confetti { inset: 0; }
.confetti i { position: absolute; width: 16px; height: 32px; border-radius: 3px; }
.confetti .c-a { background: var(--accent); }
.confetti .c-f { background: var(--on-primary); }
.confetti .c-round { width: 16px; height: 16px; border-radius: 50%; }

.stat { display: flex; align-items: center; gap: 0.55em; margin-top: 1em; }
.stat-n { font-family: Poppins, sans-serif; font-weight: 800; font-size: 3em; line-height: 1; color: var(--accent); letter-spacing: -0.03em; }
.stat-l { font-size: 0.74em; font-weight: 700; line-height: 1.3; max-width: 13em; }
.roll { display: grid; grid-template-columns: 1fr 1fr; gap: 0.42em 0.55em; margin-top: 1.05em; width: 100%; }
.size-story .roll { grid-template-columns: 1fr; }
.roll-i {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5em;
  background: var(--soft); border: 1px solid var(--line); border-radius: 0.5em;
  padding: 0.45em 0.45em 0.45em 0.8em; font-size: 0.76em; font-weight: 700;
}
.roll-i b { background: var(--accent); color: var(--on-accent); font-family: Poppins, sans-serif; font-weight: 800; padding: 0.18em 0.6em; border-radius: 0.35em; white-space: nowrap; }

.tpl-spotlight .deco-arc { right: -320px; bottom: -320px; width: 860px; height: 860px; border-radius: 50%; background: var(--primary); opacity: 0.07; }
.sp-row { display: flex; align-items: center; gap: 1em; margin-top: 0.3em; }
.photo {
  width: 6em; height: 6em; border-radius: 50%; overflow: hidden; flex: none;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--accent)));
  color: var(--on-primary); font-family: Poppins, sans-serif; font-weight: 800;
  box-shadow: 0 0 0 0.2em var(--paper), 0 0 0 0.4em var(--accent);
}
.photo span { font-size: 2.1em; }
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sp-grade { font-family: Poppins, sans-serif; font-weight: 800; font-size: 3.3em; line-height: 0.95; color: var(--primary); letter-spacing: -0.03em; }
.sp-exam {
  display: inline-block; margin-top: 0.35em; background: var(--accent); color: var(--on-accent);
  font-weight: 800; font-size: 0.7em; letter-spacing: 0.08em; padding: 0.3em 0.85em; border-radius: 99px;
}
.tpl-spotlight .h1 { margin-top: 0.65em; font-size: 2em; }
.sp-quote {
  margin: 1em 0 0; padding: 0.85em 1.05em; display: flex; gap: 0.6em;
  background: #fff; border-radius: 0.7em; border-left: 0.22em solid var(--accent);
  box-shadow: 0 0.3em 1.2em rgba(0, 0, 0, 0.06);
}
.sp-quote .ic { width: 1.5em; height: 1.5em; color: var(--accent); }
.sp-quote p { margin: 0; font-size: 0.92em; font-weight: 600; line-height: 1.4; }

.tpl-testimonial .deco-quote { right: 30px; top: 120px; color: var(--primary); opacity: 0.12; }
.tpl-testimonial .deco-quote .ic { width: 440px; height: 440px; }
.t-card {
  width: 100%; margin-top: 0.3em; padding: 1.1em 1.2em;
  background: #fff; color: #1b1f27; border-radius: 1em;
  box-shadow: 0.35em 0.35em 0 var(--primary);
}
.stars { display: flex; gap: 0.12em; color: #f2a900; }
.stars .ic { width: 1.05em; height: 1.05em; }
.t-quote { font-family: Poppins, sans-serif; font-weight: 600; font-size: 1.22em; line-height: 1.36; margin: 0.45em 0 0; color: var(--primary); }
.t-en { margin: 0.75em 0 0; font-size: 0.68em; font-weight: 500; color: #555b66; line-height: 1.45; }
.t-author { display: flex; align-items: center; gap: 0.6em; margin-top: 1.3em; }
.t-av {
  width: 2.5em; height: 2.5em; border-radius: 50%; display: grid; place-items: center;
  background: var(--primary); color: var(--on-primary); font-family: Poppins, sans-serif; font-weight: 800; font-size: 0.8em;
}
.t-author b { display: block; font-size: 0.92em; font-weight: 800; }
.t-author small { display: block; font-size: 0.68em; font-weight: 600; color: var(--muted); }

/* ========================= PROMOS & EVENTS ========================= */
.tpl-promo .p-content { align-items: center; text-align: center; }
.tpl-promo .deco-rays {
  inset: -40%;
  background: repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in srgb, var(--on-primary) 6%, transparent) 0deg 7deg, transparent 7deg 20deg);
}
.burst { position: relative; width: 7em; height: 7em; margin: 0.1em 0 0.7em; }
.burst svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-8deg); color: var(--accent); }
.burst-t { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--on-accent); transform: rotate(-8deg); }
.burst-t b { font-family: Poppins, sans-serif; font-weight: 800; font-size: 2.35em; line-height: 1; letter-spacing: -0.03em; }
.burst-t span { font-weight: 800; font-size: 0.66em; letter-spacing: 0.22em; margin-top: 0.1em; }
.tpl-promo .h1 { font-size: 1.85em; }
.deadline {
  display: inline-flex; align-items: center; gap: 0.5em; margin-top: 1em;
  border: 3px dashed var(--accent); color: var(--accent);
  padding: 0.5em 1.1em; border-radius: 99px; font-weight: 800; font-size: 0.78em;
}
.deadline .ic { width: 1.3em; height: 1.3em; }
.fine { margin-top: 0.8em; font-size: 0.52em; color: var(--muted); font-weight: 600; }

.tpl-freetrial .deco-grid {
  inset: 0; opacity: 0.7;
  background-image: linear-gradient(var(--line) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--line) 1.5px, transparent 1.5px);
  background-size: 54px 54px;
}
.ticket {
  position: relative; width: 100%; padding: 1.2em 1.4em;
  background: #fff; border-radius: 1em;
  border: 3px dashed color-mix(in srgb, var(--primary) 40%, transparent);
  box-shadow: 0 0.4em 1.6em rgba(0, 0, 0, 0.08);
  overflow: hidden; /* notches become half-circle "bites" */
}
.ticket::before, .ticket::after {
  content: ""; position: absolute; top: 50%; width: 1.5em; height: 1.5em; border-radius: 50%;
  background: var(--paper); transform: translateY(-50%);
}
.ticket::before { left: -0.8em; }
.ticket::after { right: -0.8em; }
.checks { list-style: none; margin: 1em 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.5em; }
.checks li { display: flex; align-items: center; gap: 0.6em; font-size: 0.82em; font-weight: 700; }
.checks i { width: 1.5em; height: 1.5em; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--primary); color: var(--accent); }
.checks .ic { width: 0.9em; height: 0.9em; }
.btn {
  display: inline-flex; align-items: center; gap: 0.5em; margin-top: 1.15em;
  background: var(--primary); color: var(--on-primary); font-weight: 800; font-size: 0.84em;
  padding: 0.7em 1.35em; border-radius: 99px;
}
.btn .ic { width: 1.1em; height: 1.1em; color: var(--accent); }
.limit { margin-top: 0.75em; font-size: 0.6em; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }

.tpl-event .deco-stripes {
  right: -140px; top: -140px; width: 560px; height: 560px; border-radius: 50%;
  background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--accent) 45%, transparent) 0 14px, transparent 14px 38px);
}
.facts { display: flex; flex-direction: column; gap: 0.38em; margin-top: 1em; width: 100%; }
.facts div { display: flex; align-items: center; gap: 0.6em; font-size: 0.78em; font-weight: 700; background: var(--soft); border-radius: 0.5em; padding: 0.55em 0.8em; }
.facts .ic { width: 1.4em; height: 1.4em; color: var(--accent); }
.topics { list-style: none; margin: 1em 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.55em 0.9em; width: 100%; }
.size-story .topics { grid-template-columns: 1fr; }
.topics li { display: flex; gap: 0.5em; align-items: flex-start; font-size: 0.74em; font-weight: 600; line-height: 1.3; }
.topics li i { white-space: nowrap; font-style: normal; font-family: Poppins, sans-serif; font-weight: 800; font-size: 1.3em; line-height: 1; color: var(--accent); }
.price-tag {
  margin-top: 1.1em; background: var(--accent); color: var(--on-accent);
  font-weight: 800; font-size: 0.82em; padding: 0.5em 1.1em; border-radius: 0.4em; transform: rotate(-1.5deg);
}

/* ======================== TIPS & EDUCATIONAL ======================== */
.tpl-tips .deco-corner { right: 0; top: 0; width: 300px; height: 300px; background: var(--accent); clip-path: polygon(0 0, 100% 0, 100% 100%); }
.steps { list-style: none; margin: 1em 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.5em; width: 100%; }
.steps li { display: flex; gap: 0.7em; align-items: center; background: #fff; border-radius: 0.6em; padding: 0.55em 0.8em; box-shadow: 0 0.15em 0.7em rgba(0, 0, 0, 0.06); }
.steps li > i {
  font-style: normal; flex: none; width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center;
  background: var(--primary); color: var(--accent); font-family: Poppins, sans-serif; font-weight: 800; font-size: 0.9em;
}
.steps b { display: block; font-size: 0.9em; font-weight: 800; color: var(--primary); }
.steps span { display: block; font-size: 0.72em; font-weight: 600; color: var(--muted); margin-top: 0.15em; line-height: 1.35; }
.save { margin-top: 0.9em; font-size: 0.62em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary); }

.tpl-countdown .p-content { align-items: center; text-align: center; }
.tpl-countdown .deco-dots { right: 24px; bottom: auto; top: 22%; }
.ring { position: relative; width: 8.2em; height: 8.2em; margin: 0.8em 0 0.7em; }
.ring svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.ring-bg { color: var(--on-primary); }
.ring-fg { color: var(--accent); }
.ring-t { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-t b { font-family: Poppins, sans-serif; font-weight: 800; font-size: 3.5em; line-height: 1; letter-spacing: -0.03em; }
.ring-t span { font-weight: 800; font-size: 0.66em; letter-spacing: 0.22em; color: var(--accent); margin-top: 0.25em; }
.ring-t small { font-size: 0.56em; font-weight: 600; color: var(--muted); margin-top: 0.15em; }
.msg { margin: 0.2em 0 0; font-size: 0.92em; font-weight: 600; line-height: 1.42; max-width: 22em; }

.tpl-quicknote .deco-paper {
  inset: 0;
  background-image: linear-gradient(color-mix(in srgb, var(--primary) 9%, transparent) 1.5px, transparent 1.5px);
  background-size: 100% 46px;
}
.tpl-quicknote .deco-paper::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: 40px; width: 3px;
  background: color-mix(in srgb, var(--accent) 80%, transparent);
}
.qn-top { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5em; }
.qn-top .eyebrow { margin-bottom: 0; }
.tag { font-size: 0.62em; font-weight: 800; border: 2px solid var(--primary); color: var(--primary); padding: 0.4em 0.95em; border-radius: 99px; background: var(--paper); }
.tpl-quicknote .h1 { margin-top: 0.6em; }
.formula {
  align-self: stretch; margin-top: 0.8em; padding: 0.3em 0.5em; text-align: center;
  font-family: Poppins, sans-serif; font-weight: 800; font-size: 2.5em; letter-spacing: 0.02em;
  background: var(--primary); color: var(--on-primary); border-radius: 0.3em;
  box-shadow: 0.12em 0.12em 0 var(--accent);
}
.legend { margin: 0.9em 0 0; display: flex; flex-direction: column; gap: 0.35em; width: 100%; }
.legend div { display: flex; align-items: center; gap: 0.7em; font-size: 0.82em; }
.legend dt {
  flex: none; min-width: 1.9em; height: 1.9em; padding: 0 0.4em; border-radius: 0.4em;
  display: grid; place-items: center; background: var(--accent); color: var(--on-accent);
  font-family: Poppins, sans-serif; font-weight: 800;
}
.legend dd { margin: 0; font-weight: 700; }
.example { margin-top: 0.9em; width: 100%; background: #fff; border: 2px dashed var(--line); border-radius: 0.6em; padding: 0.7em 0.9em; }
.example b { font-size: 0.58em; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
.example p { margin: 0.3em 0 0; font-size: 0.78em; font-weight: 600; line-height: 1.45; }

/* ============================== NOTICES ============================== */
.tpl-notice .deco-bell { right: -70px; bottom: 16%; color: var(--primary); opacity: 0.1; transform: rotate(-14deg); }
.tpl-notice .deco-bell .ic { width: 560px; height: 560px; }
.when {
  display: inline-flex; align-items: center; gap: 0.5em; margin-top: 1em;
  background: var(--primary); color: var(--on-primary); font-weight: 800; font-size: 0.84em;
  padding: 0.55em 1em; border-radius: 0.5em;
}
.when .ic { width: 1.3em; height: 1.3em; color: var(--accent); }
.n-body { margin: 1em 0 0; font-size: 0.98em; font-weight: 600; line-height: 1.45; max-width: 24em; }
.n-en { margin: 0.6em 0 0; font-size: 0.7em; font-weight: 500; line-height: 1.45; color: var(--muted); max-width: 30em; }
.sign { margin-top: 1.1em; font-weight: 800; font-size: 0.78em; color: var(--primary); }
`;
(function () {
  var s = document.createElement("style");
  s.id = "poster-css";
  s.textContent = window.POSTER_CSS;
  document.head.appendChild(s);
})();
