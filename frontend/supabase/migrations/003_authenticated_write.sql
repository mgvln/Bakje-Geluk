-- Lets logged-in team members label stories (decision/product/ad_built/exported_to_notion)
-- directly with their own session, so the app no longer needs the service-role key.
-- Anonymous users still cannot read or write (no anon policies).

drop policy if exists "authenticated can update stories" on public.stories;
create policy "authenticated can update stories"
  on public.stories
  for update
  to authenticated
  using (true)
  with check (true);
