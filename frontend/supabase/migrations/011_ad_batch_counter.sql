-- Shared, atomic AD-code batch counter so the generate flow (saveGeneration)
-- and the Notion export (exportToNotion) draw from the same sequence per
-- promo-type-per-month and never collide. Fixes the ugly Notion AD Code naming.
create table if not exists public.ad_batch_counters (
  promo_type text not null,
  ad_month text not null,
  last_batch int not null default 0,
  primary key (promo_type, ad_month)
);

alter table public.ad_batch_counters enable row level security;
create policy "authenticated can read ad_batch_counters"
  on public.ad_batch_counters for select to authenticated using (true);

-- Atomic increment: bumps and returns the next batch number for a promo+month.
create or replace function public.next_ad_batch(p_promo text, p_month text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  insert into public.ad_batch_counters (promo_type, ad_month, last_batch)
  values (p_promo, p_month, 1)
  on conflict (promo_type, ad_month)
  do update set last_batch = ad_batch_counters.last_batch + 1
  returning last_batch into n;
  return n;
end $$;

grant execute on function public.next_ad_batch(text, text) to authenticated;

-- Seed from existing generated_hooks so numbering continues where it left off
-- (rather than restarting at B1 and duplicating codes already saved).
insert into public.ad_batch_counters (promo_type, ad_month, last_batch)
select promo_type, ad_month, max(batch)
from public.generated_hooks
where promo_type is not null and ad_month is not null and batch is not null
group by promo_type, ad_month
on conflict (promo_type, ad_month)
do update set last_batch = greatest(ad_batch_counters.last_batch, excluded.last_batch);
