-- Generations can now come from a competitor ad (Inspiratie) instead of a story.
alter table public.generated_hooks alter column story_id drop not null;
alter table public.generated_hooks
  add column if not exists competitor_ad_id uuid references public.competitor_ads(id);
alter table public.generated_hooks
  add constraint generated_hooks_source_check
  check (story_id is not null or competitor_ad_id is not null);
