-- Editable product list (Dennis 07-24: "missing an option to add product").
-- Was a hardcoded array; now a table the team can add to from the UI.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int default 100,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
create policy "authenticated can read products"
  on public.products for select to authenticated using (true);
create policy "authenticated can insert products"
  on public.products for insert to authenticated with check (true);

-- Seed with the current fixed list (matches the Notion Product select).
insert into public.products (name, sort) values
  ('ALLES', 1), ('Boek 1', 2), ('Boek 2', 3), ('Boek 3', 4), ('Boek 4', 5),
  ('Boek 5', 6), ('Boek 6', 7), ('TNY - Lente Editie', 8), ('TNY - SummerFit', 9),
  ('Protein Oats', 10), ('Tosti Ebook', 11)
on conflict (name) do nothing;
