-- Inspiration feature: competitor ads scraped from the Facebook Ads Library.
-- Separate from `stories` on purpose — these are paid ads (copy + creative),
-- not organic posts, and are keyed by Meta's ad_archive_id.
create table if not exists public.competitor_ads (
  id uuid primary key default gen_random_uuid(),
  ad_archive_id text not null unique,   -- Meta Ad Library ID (dedupe key)
  page_id text,                         -- FB page id of the advertiser
  page_name text,                       -- e.g. "Obvi Health"
  source_query text,                    -- URL/handle the user submitted
  primary_text text,                    -- the ad's body copy
  headline text,
  cta_text text,                        -- e.g. "Learn more", "Shop now"
  link_url text,                        -- landing page
  media_type text,                      -- image / video / carousel
  media_url text,                       -- creative image/video url (Meta CDN, may expire)
  is_active boolean default true,
  started_at date,                      -- "Started running on ..."
  impressions text,                     -- EU transparency range when available, else null
  platforms jsonb default '[]',         -- facebook / instagram / messenger / ...
  raw jsonb,                            -- full actor output for later re-parsing
  scraped_at timestamptz not null default now()
);

create index if not exists competitor_ads_page_idx on public.competitor_ads(page_id);
create index if not exists competitor_ads_scraped_idx on public.competitor_ads(scraped_at desc);

alter table public.competitor_ads enable row level security;

create policy "authenticated can read competitor_ads"
  on public.competitor_ads for select to authenticated using (true);
-- Writes happen from n8n with the service role (bypasses RLS), so no
-- insert/update policies for authenticated needed.
