# Snapback

An app that holds your own sincere sentences and returns exactly one to you each night.

Three screens, one table, no accounts. Written to be opened at night, read once,
and closed.

---

## Getting it running

Three things happen: you make a database, you put the site online, and you
install it on your phone. All of it can be done from a phone browser.

### 1. The database (Supabase)

Supabase is a hosted Postgres database with a web address in front of it, so
the app can read and write from a phone without you running a server.

1. Go to **supabase.com/dashboard** and sign in.
2. **New project.** Give it any name — `snapback` is fine. Choose a region near
   you (Singapore is the closest to Kuala Lumpur). Set a database password;
   the app never uses it, but Supabase requires one, so save it somewhere.
3. Wait for the project to finish setting up — a minute or two.
4. In the left sidebar, open **SQL Editor**, then **New query**.
5. Open [`supabase/schema.sql`](supabase/schema.sql) from this folder, copy the
   whole thing, paste it in, and press **Run**. That creates the one table,
   sets the access rules, and puts your six starting sentences in. It is safe
   to run twice — the sentences will not be duplicated.
6. Now find the two values the app needs. In the left sidebar, open
   **Project Settings → API** (on some versions it is **API Keys**). You want:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - the **public** key — labelled `anon` `public`, or `publishable` on newer
     projects. It is a long string. Take the public one, *not* the one marked
     `service_role` or `secret`.

Keep that tab open; you need to paste both into Vercel next.

### 2. The site (Vercel)

Vercel takes the code from GitHub, builds it, and gives it a web address.

This code lives in the **`snapback` folder** of the `BiotechAdamNazir/First`
repository, alongside an unrelated app. Two details below matter because of that.

1. This work is on the branch `claude/snapback-pwa-v1-98cj1c`. Vercel builds
   your main branch by default, so either merge that branch into `main` first,
   or after importing go to **Settings → Git** and set the **Production
   Branch** to `claude/snapback-pwa-v1-98cj1c`.
2. Go to **vercel.com/new** and import the `First` repository.
3. **Set Root Directory to `snapback`.** This is the important one — without
   it Vercel builds the wrong app. It is a field on the import screen, behind
   an **Edit** button next to the repository name.
4. Framework should detect as **Vite**. Leave the build settings alone.
5. Open **Environment Variables** and add the two values from Supabase:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your public key |

   The `VITE_` prefix is not decoration — it is how the build tool knows a
   value is allowed into the browser. Without it the app sees nothing.
6. **Deploy.** A minute later you have a URL.

If you change those variables later, Vercel needs to build again for the change
to take: **Deployments → ⋯ → Redeploy**. They are baked into the page at build
time, not read live.

### 3. On the phone

1. Open the Vercel URL in **Chrome** on your phone.
2. Menu **⋮ → Add to Home screen** (it may say **Install app**). Accept.
3. Open it from the home screen icon at least once.

Installing is what registers Snapback in Android's share sheet. Until you do,
sharing to it will not be offered.

To check it worked: select some text anywhere, tap **Share**, and look for
**Snapback** in the list. Tapping it saves the text and shows the word *kept*
for a moment. There is no editing step and no confirmation — that is the point.

---

## How the nightly sentence is chosen

1. If anything was written **exactly a year ago today**, that one is returned,
   with a small line beneath it: *you wrote this a year ago tonight*.
2. Otherwise, anything shown in the **last fourteen days** is set aside.
3. From what is left, one is drawn at random, where each sentence holds
   `resonance + 1` tickets. A sentence you have never marked still has one
   ticket; one you have marked five times has six.
4. **The choice is fixed for the whole day.** Closing and reopening returns the
   same sentence. It is decided once, written down on the device, and re-read
   after that.

A day here means a calendar day in **Asia/Kuala_Lumpur**, whatever timezone the
device thinks it is in. So it turns over at midnight in KL, not at midnight
wherever you happen to be.

Two things the specification did not say, decided this way:

- **If every sentence has been shown within fourteen days**, the rest is
  ignored rather than returning an empty screen. With six sentences this
  happens on the seventh night, so it is not an edge case.
- **Once you answer, the night is closed.** *Landed* and *Not tonight* both
  leave a quiet screen, and reopening the app that same day leaves it quiet.
  Re-showing the sentence after you had already answered seemed worse than the
  small cost of a mis-tap.

---

## The notification

One notification a night at **21:00 Kuala Lumpur time**, saying only
*Snapback*, with no preview of the sentence. The hour is set in
[`src/lib/notify.js`](src/lib/notify.js) and in
[`public/sw.js`](public/sw.js) — change `NOTIFY_HOUR` in both.

**Be aware of what this can and cannot do.** A web app cannot set an alarm the
way an installed Android app can. What it has is Periodic Background Sync:
Chrome wakes the installed app in the background every so often, and it checks
whether the hour has passed and it has not spoken yet today. Chrome decides
when to run that, based on how often you open the app and whether the phone is
charging or on wifi. In practice it usually arrives, sometimes late, and
occasionally not at all. It also stops if you use the app rarely enough that
Chrome deprioritises it.

If you want a notification that is exactly on time every night, that needs
either a push server or an ordinary Android alarm. Neither is built here.

Permission is asked for the first time you tap a button, not on first open.

---

## What is deliberately absent

No accounts, no tags, no categories, no search, no editing, no deleting, no
list of everything, no export, no streaks, no counters, no analytics, no AI.

The return screen is the product. Everything else is a way of feeding it.

---

## One thing to know about privacy

There is no login, by design. The site address and the public key together are
enough for anyone holding them to read and add sentences. The key ships inside
the page, so it is readable by anyone who has the URL.

In practice this means: **the URL is the secret.** Do not post it. Vercel gives
you a long unguessable address, which is fine for one person's private app; if
you would rather it not be a matter of obscurity at all, that means adding
auth, which is out of scope here.

Nothing else is collected. No analytics, no third-party requests at all — even
the typeface is served from your own site rather than from Google.

---

## Working on it

```bash
cd snapback
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # a local copy at http://localhost:5173
```

| Command | What it does |
|---------|--------------|
| `npm run dev` | Local development copy |
| `npm run build` | Build for deployment |
| `npm run check` | Run everything below |
| `npm run shots` | Redraw the pictures in `shots/` |
| `npm run icons` | Redraw the app icons |

`npm run check` runs 17 checks on the date and drawing arithmetic, then builds
the app, serves it against a stand-in for Supabase, and drives a real browser
through 38 more: that one sentence comes back, that it does not move all day,
that the anniversary line appears, that the fourteen-day rest holds, that both
write paths save, and that the share target is registered. It needs Chromium;
set `CHROME_PATH` if it is not at `/opt/pw-browsers/chromium`.

There is no test framework and no test dependency — the browser is driven over
the DevTools protocol directly.

### The files

| File | What it holds |
|------|---------------|
| `src/screens/Return.jsx` | The nightly screen |
| `src/screens/Snap.jsx` | The writing screen |
| `src/screens/Share.jsx` | Where shared text lands |
| `src/lib/selection.js` | Which sentence comes back, and when |
| `src/lib/day.js` | What "today" means in Kuala Lumpur |
| `src/lib/draw.js` | The weighted draw |
| `src/lib/notify.js` | Asking for, and scheduling, the notification |
| `src/styles.css` | All of the design |
| `public/sw.js` | Installability, and the nightly notification |
| `public/manifest.webmanifest` | Icons, and the share target registration |
| `supabase/schema.sql` | The one table and its access rules |

The typeface is EB Garamond, under the SIL Open Font License, served from this
site so the screen never waits on anyone else's server — see
`public/fonts/NOTICE.txt`.
