# Frontend — ads.bakjegeluk.nl

The frontend/landing for the IG scraper project. The n8n IG scraper (this repo) is the **backend**;
this is the **frontend** on the same Supabase. Same project, not separate.

Source: stakeholder loom (2026-06-30). Principle: **clean and simple, add functions later.**

## Decisions made (2026-06-30)
- **Hosting:** Vercel, with a DNS record pointing `ads.bakjegeluk.nl` → Vercel.
- **Auth:** Supabase Auth, email + password. Accounts created per team member (no open signup).
- **Notion:** insert step wired once integration token + DB are provided (walkthrough given).

## Proposed stack
- Next.js (App Router) + TypeScript
- Supabase JS client (auth + data; reuses existing project `uagvazsyjjulsiinvuot`)
- Tailwind for UI (inputs: text-gray-900 + placeholder:text-gray-400 per house rule)
- Notion API for the export step
- Deploy: Vercel

## Three screens (v1)

### 1. Filter / Triage
New scraped stories land here as a queue. For each story a team member labels:
- **Decision:** build ad now / build in future / reject
- **Product:** which product it's about
Example flow: 30 new stories → select 4 to build, reject/park 26. Labeled ones flow to the Library.

### 2. Library
Browse everything — raw (unfiltered) AND filtered/labeled. Per story show:
- image, username, date, category, OCR text
- **ad built?** badge
- **which product**
- **exported to Notion?** badge
Filterable (by decision, product, category, exported status).

### 3. Ad system
Select N stories (e.g. 4–5) → insert into Notion DB to create ad concepts.
**Phase-1 Notion insert (minimal):** product + specific promo type + image + Supabase download link,
placed in the "production" phase. Team then runs their own cloud skills to write copy.

## Phasing
- **Phase 1 (build now):** login, triage/filter, library, select → insert to Notion (product + promo type + image + Supabase link). Team uses it immediately.
- **Phase 2 (later):** generate hooks + copy in-tool, fuller Notion field mapping.

## Supabase schema additions (stories table)
New columns needed for labeling:
- `decision` text — `build_now` / `build_future` / `rejected` (nullable = untriaged)
- `product` text
- `ad_built` boolean default false
- `exported_to_notion` timestamptz nullable

(Existing columns already cover image/url/overlay_text/category/posted_at/etc.)

## Still needed from stakeholder
1. **Product list** — the set of products for the labeling dropdown.
2. **Promo types** — the list of "specific promo type" values used in Notion.
3. **Allowed team emails** — to create Supabase Auth accounts.
4. **Notion integration token + target database ID + exact property names** (see walkthrough).
5. Confirm we may add the 4 columns above to the `stories` table.

## Notion integration walkthrough (to send back)
1. Go to notion.so/my-integrations → New integration → name it "ads-bakjegeluk", internal.
2. Copy the **Internal Integration Secret** (starts `ntn_` / `secret_`).
3. Open the target ad database in Notion → ••• menu → Connections → add the integration.
4. Get the **database ID**: from the DB URL, the 32-char hex string before `?v=`.
5. Send me: token, database ID, and the property names + types for product, promo type, image/file, phase/status.
