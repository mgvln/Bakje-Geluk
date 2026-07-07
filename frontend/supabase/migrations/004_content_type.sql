-- Distinguishes stories from feed posts in the shared table.
-- Existing rows are all stories (default 'story'); the posts scraper inserts 'post'.
alter table public.stories
  add column if not exists content_type text not null default 'story';

create index if not exists stories_content_type_idx on public.stories (content_type);
