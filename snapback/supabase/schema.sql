-- Snapback — the whole database.
-- Paste this into the Supabase SQL editor and press Run. It is safe to run
-- twice; the seed sentences will not be duplicated.

create table if not exists public.snaps (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  created_at  timestamptz default now(),
  source      text default 'self',
  resonance   integer default 0,
  last_shown  timestamptz
);

-- Row Level Security is Supabase's gate on the table. It is on, and it lets
-- the app's public key read, add and update rows. There is no login in
-- Snapback, so anyone who has both the site address and the public key could
-- do the same — see the note in README.md.
alter table public.snaps enable row level security;

drop policy if exists "snapback can read"   on public.snaps;
drop policy if exists "snapback can write"  on public.snaps;
drop policy if exists "snapback can update" on public.snaps;

create policy "snapback can read"   on public.snaps for select to anon using (true);
create policy "snapback can write"  on public.snaps for insert to anon with check (true);
create policy "snapback can update" on public.snaps for update to anon using (true) with check (true);

-- The six starting sentences.
insert into public.snaps (text, source)
select v.text, 'self'
from (values
  ('I have tried, I am sure.'),
  ('Increasingly. Not perfectly. Not arrived.'),
  ('Jangan gelojoh sangat. Nak race dengan siapa?'),
  ('They don''t need me at their height. They need me at their standing place.'),
  ('Scars are the body''s completed work.'),
  ('Endings aren''t exterminations. Tomorrow is an extension. The past isn''t a damnation.')
) as v(text)
where not exists (select 1 from public.snaps s where s.text = v.text);
