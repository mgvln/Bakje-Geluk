-- Carousel flag for posts (Dennis 07-24: label carousels + link to originals).
-- Apify marks carousels as raw.type = 'Sidecar' (multiple child images).
alter table public.stories add column if not exists is_carousel boolean default false;

-- Backfill existing rows from the stored raw payload.
update public.stories
set is_carousel = true
where raw ->> 'type' = 'Sidecar' and coalesce(is_carousel, false) = false;
