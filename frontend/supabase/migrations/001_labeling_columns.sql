-- Adds labeling columns used by the ads.bakjegeluk.nl frontend.
-- Run in Supabase dashboard → SQL Editor.

alter table public.stories
  add column if not exists decision text
    check (decision in ('build_now', 'build_future', 'rejected')),
  add column if not exists product text,
  add column if not exists ad_built boolean not null default false,
  add column if not exists exported_to_notion timestamptz;

-- Optional helper index for the triage queue (untriaged = decision is null)
create index if not exists stories_decision_idx on public.stories (decision);
create index if not exists stories_product_idx on public.stories (product);
