-- The frontend reads `stories` with the anon key under a logged-in user's session
-- (Postgres role = `authenticated`). RLS is enabled on the table, so without a policy
-- logged-in users see zero rows. This grants read access to authenticated users only.
-- Writes still go through the server (service role), which bypasses RLS.

alter table public.stories enable row level security; -- no-op if already enabled

drop policy if exists "authenticated can read stories" on public.stories;
create policy "authenticated can read stories"
  on public.stories
  for select
  to authenticated
  using (true);
