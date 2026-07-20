# Static Ads Machine — Research & Decision Doc

*For Dennis · from Miguel · July 21, 2026*

**The question:** after the tool generates hooks + copy, can it also produce the
**finished static ad image** (hook text on a branded visual, ready for Meta)?

**Short answer:** yes — and the smartest version reuses what we already have:
our scraped story/post images + the generated hooks, composed onto Bakje Geluk
brand templates. Four approaches below, then a recommendation.

---

## Approach A — Template-based image API (Placid / Bannerbear / Templated)

Design your ad layouts once in a drag-and-drop editor (like Canva), mark which
parts are dynamic (hook text, product image, background photo, CTA). Our tool
then calls their API with the generated hook + chosen image, and gets a
finished PNG back in seconds.

- **How it fits us:** in the Generaties tab, one "🖼 Maak statische ad" button →
  pick a template → the hook/copy/image slot in automatically → download or
  push to Notion.
- **Examples:** [Placid](https://placid.app) (from ~$19/mo, 500 images),
  [Bannerbear](https://www.bannerbear.com/pricing/) ($49/mo, 1,000 credits),
  [Templated](https://templated.io).
- **Cost:** ~$19–49/month flat. At Bakje volume (say 50–200 ads/mo) the entry
  tiers are plenty.
- **Pros:** pixel-perfect brand control (Dennis designs the templates himself),
  fast to integrate (~1–2 days), output is deterministic — no AI weirdness.
- **Cons:** monthly SaaS fee; layout variety limited to the templates you make
  (that's also a feature: consistency).

## Approach B — Self-built HTML-to-image (in our own Next.js app)

We already run a Next.js app. We can design ad layouts as HTML/CSS components
and render them to PNG ourselves — via **Satori** (Vercel's free library, runs
inside our existing Vercel deploy) or a headless browser (Puppeteer).

- **How it fits us:** same button as A, but the template lives in our own code;
  no external service, no per-image cost.
- **Cost:** **€0/month** (Satori runs on our current Vercel plan).
- **Pros:** free, fully ours, versioned in git, unlimited volume.
- **Cons:** templates are built in code (I build them from Dennis's designs
  instead of Dennis editing them himself); Satori has layout limitations
  (flexbox only — fine for ad cards); each new template = a dev task for me.

## Approach C — AI image generation (GPT Image 2 / Ideogram 4 / FLUX.2)

Generate the entire visual from a prompt ("smiling woman with meal-prep
containers, warm kitchen, text: 'Ik at meer en viel af'"). 2026 models render
text in images reliably now — [GPT Image 2 leads, Ideogram 4 is the typography
specialist](https://melies.co/compare/ai-image-models).

- **Cost:** pennies per image via API (~$0.02–0.10/image).
- **Pros:** infinite visual variety; no photo shoots; great for concept testing.
- **Cons:** **brand risk** — Mariska's brand is real people, real bakjes, real
  community; AI-generated "food photography" is exactly the AI-tell our SCAN
  checklist fights in copy. Dutch text rendering is better than ever but still
  not 100%. Compliance: Meta requires no misleading imagery.
- **Verdict:** not the foundation — but a good *optional layer* later
  (backgrounds, concept mockups to brief the designer).

## Approach D — All-in-one AI ad SaaS (AdCreative.ai etc.)

Platforms that do everything: generate visual + text + score + publish.
[AdCreative.ai runs $39–249/mo](https://superscale.ai/alternatives/adcreative.ai/pricing);
alternatives from $14/mo (Pencil, GetHookd, Zeely).

- **Verdict: poor fit.** We'd pay for a second copy-generation pipeline we
  already built better (Mariska's voice, SCAN, awareness levels), and their
  generic templates fight our brand system. Only worth it if we wanted to
  replace our whole tool — we don't.

---

## Recommendation

**Start with B (Satori, in-house) — free and fully integrated. Fall back to A
(Placid) only if Dennis wants to design/edit templates himself without me in
the loop.**

Concrete v1 proposal (1–2 sessions of work):
1. Dennis supplies 2–3 static-ad layouts (existing Canva/Figma designs are fine).
2. I rebuild them as code templates (brand fonts/colors baked in).
3. New button in Generaties: **pick template → hook + image slot in → PNG
   download** (1080×1080 + 1080×1350 variants).
4. Later: auto-attach the PNG to the Notion concept, and optionally an AI
   background layer (Approach C) once trust is built.

**Decision needed from Dennis:**
- [ ] Does the team want to edit templates themselves (→ A, ~$19/mo) or is
      "Dennis designs once, Miguel codes it" fine (→ B, €0)?
- [ ] Which 2–3 layouts should v1 support? (send the Canva/Figma files)
- [ ] Output formats: feed 1080×1080 + story 1080×1350 — anything else?

---

*Sources:*
[Bannerbear pricing](https://www.bannerbear.com/pricing/) ·
[Bannerbear alternatives / Placid comparison](https://dynapictures.com/blog/10-top-bannerbear-alternatives/) ·
[HTML-to-image API comparison](https://rendex.dev/compare/best-html-to-image-apis-2026) ·
[OG image approaches: templates vs screenshots](https://snap-render.com/blog/og-image-generators-compared) ·
[AI image models 2026 compared](https://melies.co/compare/ai-image-models) ·
[Best AI image models for ads](https://www.buildmvpfast.com/articles/best-llms-2026-guide/image-generation-ai) ·
[AdCreative.ai pricing](https://superscale.ai/alternatives/adcreative.ai/pricing) ·
[AdCreative alternatives](https://admanage.ai/blog/adcreative-ai-alternatives)
