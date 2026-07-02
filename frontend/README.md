# ads.bakjegeluk.nl — frontend

Next.js + Supabase + Tailwind frontend for the IG stories pipeline. Backend = the n8n IG scraper
(same Supabase project `uagvazsyjjulsiinvuot`). See `../FRONTEND_SPEC.md` for the product spec.

## Screens
- **/login** — Supabase email + password auth.
- **/triage** — queue of untriaged stories; label each (Build now / Later / Skip) + product.
- **/library** — all stories (raw + filtered) with filters and status badges.
- **/ad-system** — select “Build now” stories → insert into Notion (product + promo type + image + Supabase link).

## Setup
1. `npm install`
2. Fill `.env.local` (copy from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase dashboard → Settings → API → "anon public"
   - `NOTION_TOKEN`, `NOTION_DATABASE_ID` — from the Notion integration
3. Run the SQL migration `supabase/migrations/001_labeling_columns.sql` in the Supabase SQL editor.
4. `npm run dev` → http://localhost:3000

## Outstanding before it's fully live
- Real **product list** + **promo-type list** in `src/lib/types.ts` (`PRODUCTS`, `PROMO_TYPES`).
- Confirm Notion **property names/types** in `src/app/actions.ts` `exportToNotion` (currently placeholders:
  Name, Product, Promo type, Phase, Supabase link).
- Create Supabase Auth users for the team (no open signup).

## Deploy (Vercel)
1. Push to a Git repo, import into Vercel (root = this `frontend` folder).
2. Add the env vars from `.env.local` in Vercel project settings.
3. Add domain `ads.bakjegeluk.nl`; Vercel shows the DNS record to create.
