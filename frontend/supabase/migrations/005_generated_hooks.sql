-- Phase 2: store generated hooks + copy per story. Field names mirror the
-- Notion 🪩 Hooks DB (block 09) so the Notion write path can be switched on later.
create table if not exists public.generated_hooks (
  id uuid primary key default gen_random_uuid(),
  story_id text not null references public.stories(story_id),
  hook_title text not null,          -- Hook / Title (max 40 chars)
  formule text,                      -- which hook formula was used
  ad_copy_1 text,                    -- primary text variant 1
  ad_copy_2 text,                    -- primary text variant 2
  awareness_level text not null,     -- Unaware / Problem Aware / ... (concept-level)
  product text,
  promo_type text,
  button text,                       -- Meer informatie / Nu winkelen
  link text,                         -- bare product URL
  utm_1 text,                        -- utm params only
  scan_flags jsonb default '[]',     -- soft-rule warnings from the SCAN check
  exported_to_notion timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists generated_hooks_story_idx on public.generated_hooks(story_id);

alter table public.generated_hooks enable row level security;

create policy "authenticated can read generated_hooks"
  on public.generated_hooks for select to authenticated using (true);
create policy "authenticated can insert generated_hooks"
  on public.generated_hooks for insert to authenticated with check (true);
create policy "authenticated can update generated_hooks"
  on public.generated_hooks for update to authenticated using (true) with check (true);
