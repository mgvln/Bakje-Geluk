-- Ad System Upgrade (Dennis Loom): assignment + auto-numbered AD code.
alter table public.generated_hooks add column if not exists assigned_to text;
alter table public.generated_hooks add column if not exists ad_code text;
-- Batch number + month token drive the AD code: {PROMO}-B{batch}-{MONTH}{YY},
-- e.g. INSTA-ADS-B1-JUL26. Batch increments per promo type per month.
alter table public.generated_hooks add column if not exists batch int;
alter table public.generated_hooks add column if not exists ad_month text;

create index if not exists generated_hooks_batchkey_idx
  on public.generated_hooks(promo_type, ad_month);
