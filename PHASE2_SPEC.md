# Phase 2 — In-tool Hook + Copy Generation

Draft spec, 2026-07-10. Source: FRONTEND_SPEC.md phasing line ("generate hooks + copy in-tool,
fuller Notion field mapping") + planning session.

**UPDATE 2026-07-13: ALL open questions answered.** Dennis delivered `phase2-input/miguel-phase2/`
(11 MD blocks, ~1000 lines): system prompt, generation spec, tone of voice, anti-AI guardrails,
10 hook formulas, 6 copy variants, awareness levels, audience language, brand overview, Notion
field mapping. This SUPERSEDES the guesses below — key changes vs the original draft:
- **3 hooks** per story (≥2 different formulas), max 40 chars, sweet spot 27–35.
- **2 ad-copy variants** per chosen hook (Ad Copy 1 + 2), 250–350 chars, 3-block structure,
  exactly 1 emoji at the end. Meta primary text; CTA = fixed Meta button (Meer informatie /
  Nu winkelen by awareness), NOT "link in bio".
- **NEW INPUT: Awareness Level** (5 stages) must be selectable in the Ad system UI — it drives
  formula choice, copy variant, building-block filter, and button.
- **Notion target = 🪩 Hooks DB** (one row per hook, relation → 🎯 Concepts), existing properties
  incl. Name/Name 1 naming convention + Link/UTM 1 (structure fully specified in block 09).
  My hook/ad_copy-columns-on-stories idea → superseded; generation output maps to Hooks rows.
- **Post-generation validation:** run block 03 SCAN checklist (no em-dashes, no "mijn gezin"
  in ik-vorm, whey≠eiwit-doelen, vocab rules, no seasons/years, emoji rules).
- Prompt assembly: blocks 00–08 = generation context; block 09 = backend mapping layer.
- Few-shot winner ads deliberately NOT provided — tone is codified instead; calibration =
  react to drafts.
**Remaining open item:** does our tool write into Dennis's LIVE Notion workspace (needs him to
grant the integration access to 🎯 Concepts + 🪩 Hooks) or keep our own store with same field
names and switch later? Dennis also floated a future "bridge" so his Claude Code vault updates
propagate to our tool — v2 topic.

## Goal

Today the Ad system exports a minimal card to Notion (product, promo type, image, Supabase link,
original caption) and the team writes the ad copy themselves afterwards. Phase 2 moves that step
into the tool: pick a story → generate hook options + full ad copy → edit → export a
production-ready concept to Notion.

## User flow (Ad system screen)

1. Team selects stories + promo type (unchanged).
2. New **Generate** step per selected story:
   - Model returns 3–5 **hooks** (scroll-stopping opening lines) → team picks one.
   - Model generates **ad copy** (body + CTA) from the chosen hook.
   - Both shown in editable text areas; **Regenerate** button per field.
3. **Insert into Notion** (existing) now includes the final hook + copy.

Human-in-the-loop by design: the model drafts, the team finalizes. Quality bar = better than a
blank page, not perfect on first shot.

## Generation inputs (all already in the stories table)

- `overlay_text` (OCR) and/or `caption` — what the original post said
- `product` — from triage
- `category` — promo / product / recipe / testimonial / lifestyle (drives copy angle:
  testimonial → social proof, recipe → utility/curiosity, etc.)
- promo type — selected in the Ad system

## Technical design

- **API:** Next.js server action (same pattern as Notion export; key server-side only).
  Model: Haiku or Sonnet — short-form copy, cost is fractions of a cent per story.
- **Prompt:** one template, category-specific instructions, few-shot with 5–10 real
  best-performing Bakje Geluk ads (to get from stakeholder). Template stored editable
  (config file or Supabase table), not hardcoded — tuning tone = text edit, not deploy.
- **Schema:** add `hook text` + `ad_copy text` columns to `stories` (migration 005).
  Start simple per minimal-changes rule; a separate generations/variants table only if
  multi-variant history turns out to be needed.
- **Notion:** map hook + copy to properties/blocks in the Concepts DB — exact target
  properties to confirm with stakeholder (may need new properties in Notion).

## Calibration plan (before building UI)

1. Get 5–10 best existing ads from stakeholder → few-shot examples.
2. Run draft prompt manually against ~5 real stories; send outputs to stakeholder:
   "which would you ship, what's wrong with the rest?"
3. Tune prompt on that feedback, then build the UI around it.

First prototype outputs (pre-calibration, no few-shot yet): see PHASE2_PROMPT_SAMPLES.md.

## Open questions for stakeholder

1. 5–10 best-performing ads (screenshots or text) — the few-shot examples. **Must-have.**
2. Where is the copy used (Meta ads / IG captions / both)? Desired length, emoji policy,
   CTA conventions, brand voice doc if any. Language = NL assumed.
3. How many hook variants per story? Regenerate allowed freely?
4. Which Notion properties should receive hook + copy (existing or create new)?
5. (Carried over from Phase 1: team email list for accounts.)

## Estimate

2–3 focused sessions once inputs arrive: (1) generation backend + prompt + migration,
(2) Ad system UI, (3) Notion mapping + calibration round + polish.
