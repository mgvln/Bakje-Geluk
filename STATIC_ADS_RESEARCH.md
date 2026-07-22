# Static Ads Machine — Research & Decision Document

Prepared for Dennis, 2026-07-16. Answers the Loom request: "research building some sort of static
ads machine… a list of things we can do with examples, so I can make decisions."

**Bottom line up front:** For Bakje Geluk specifically, the winning pattern is a **hybrid** —
AI generates the *imagery* (lifestyle/product backgrounds) and a *template* lays the Dutch hook +
copy text on top. Letting AI render the Dutch text directly is the one thing to avoid; text overlay
from a template is always pixel-perfect and on-brand. We already generate the hooks + copy in the
tool, so a static-ads step is a natural extension, not a new product.

Research method: automated multi-source research pass (22 sources, pricing/integration claims
adversarially fact-checked). Pricing verified against primary sources where cited; treat any figure
as "check before buying" since vendors change plans often.

---

## The 5 approaches, compared

| # | Approach | What it is | Cost (entry) | Fits our stack? | Dutch text |
|---|----------|-----------|-------------|-----------------|-----------|
| 1 | **Template API** (Placid, Templated, Bannerbear, Creatomate) | Design a template once in a visual editor; API fills text/image slots and renders PNG/JPG | $19–49/mo | ✅ REST API + native n8n node | Perfect (it's real text) |
| 2 | **Self-hosted HTML→image** (Satori / @vercel/og) | Render an HTML/CSS "ad card" to PNG on our own server | **$0 extra** (already in Next.js/Vercel) | ✅ Native — it *is* our stack | Perfect (real text) |
| 3 | **AI image generation** (Nano Banana Pro / Gemini 3 Pro Image, GPT-image, Ideogram) | Prompt → full image, text and all | ~$0.03–0.15/image (API) | ✅ via API | ⚠️ Risky — see below |
| 4 | **Hybrid** (AI imagery + template text overlay) | AI makes the background/product shot; template overlays the copy | AI cost + template cost | ✅ Best fit | Perfect (overlay is real text) |
| 5 | **No-code ad platforms** (AdCreative.ai, Creatify, Pencil, Meta Advantage+) | All-in-one SaaS that spits out finished ads | $39–599/mo | ❌ Doesn't plug into our tool | Varies, generic output |

---

## 1. Template-based image APIs

You build a template in a drag-and-drop editor (like a locked Canva design with "slots"), then send
text + an image URL via API and get back a finished ad. **This is the most proven, lowest-risk way
to guarantee on-brand output.** The text is real text, so Dutch, é/ë/ï, and Mariska's exact wording
render perfectly every time.

| Tool | Entry price | Notes |
|------|------------|-------|
| **Placid** | **$19/mo** (500 renders), Pro $39/mo (2,500) | ✅ **Verified native n8n node.** REST API, images/PDF/video. Best fit for us. |
| **Templated** | **$29/mo** (1,000 renders) | n8n + Make + Zapier integrations, Canva import, AI template generator. Cheapest per-render. |
| **Bannerbear** | $49/mo (1,000), Scale $149/mo (10,000) | Market leader, most mature API, but priciest at entry. |
| **Creatomate** | $54/mo (2,000 credits) | Video-first; overkill if we only want static. |

- **Cost model:** monthly credits, 1 image ≈ 1 credit. At Bakje Geluk volume (dozens of ads/week),
  the $19–29 tier is plenty.
- **Integration:** one API call from our Next.js server action, or a node in n8n. Trivial.
- **Learning curve:** low. The work is *designing the templates* (a few good Bakje Geluk layouts),
  not coding.
- **Best for:** a real "machine" where the team picks a template + a generated hook/copy and gets a
  finished ad in one click.

## 2. Self-hosted HTML→image (Satori / @vercel/og)

We render an HTML/CSS "ad card" and screenshot it to PNG **on our own Vercel deployment** — the same
Satori engine Vercel uses for social-share images (confirmed: Satori converts HTML/CSS → SVG → PNG,
runs natively in our Node/Vercel environment).

- **Cost:** **$0 extra** — it's already part of the stack we're paying for.
- **Integration:** the deepest possible; it lives inside the app we already own.
- **Dutch text:** perfect (real HTML text).
- **Trade-off:** Satori supports a *subset* of CSS (no CSS grid, limited effects), so fancy layouts
  take more fiddling than a visual template editor. Design changes are code changes, not drag-and-drop
  — meaning **the team can't tweak templates themselves**; that goes through me.
- **Best for:** a fast, free first version with 2–3 fixed layouts, fully under our control.

## 3. AI image generation (the tempting one — with a catch)

Prompt an AI model and it paints the whole ad. The catch is **legible text, especially in Dutch.**

- **Best-in-class for text today: Google's Nano Banana Pro (Gemini 3 Pro Image).** Verified: lowest
  single-line text-error rates of any model (mostly under 10%), and it can localize/translate text
  inside images for different markets — the strongest option for Dutch. Ideogram and GPT-image are
  also strong on English text but less reliable on longer Dutch phrases.
- **The honest problem:** "under 10% error" still means roughly **1 in 10 ads has a typo or mangled
  word** — and it's worse for long copy, special characters, and non-English. For a brand whose
  entire voice is precise Dutch, shipping AI-rendered text is a brand risk. AI is *excellent* for the
  *imagery* (a warm kitchen scene, a styled product shot), just not for the words.
- **Cost:** roughly $0.03–0.15 per image via API — cheap.
- **Verdict:** use AI for pictures, not for text. Which leads to →

## 4. Hybrid — the recommendation ⭐

**AI generates the background/product imagery → a template lays our exact Dutch hook + copy on top.**
This is the pattern the serious builds use, and there's a real, working n8n template for exactly it
("Place products on AI-generated backgrounds with Imagen/Ideogram + Placid"). It gives us:

- On-brand, varied, never-stock-looking imagery (AI's strength)
- Pixel-perfect Dutch text, every time (template overlay's strength)
- A clean fit with what we already have: the tool already produces the hook + copy; we add "generate
  imagery" + "compose" steps.

## 5. No-code ad platforms — not for us

AdCreative.ai ($39–599/mo, and note: repeated auto-renewal billing complaints and a ~3.2/5
Trustpilot), Creatify, Pencil, Meta Advantage+. These are fine standalone SaaS tools, but they
**don't integrate into our tool**, their output is template-generic, and they'd fragment the workflow
we've built. Meta's own Advantage+ creative is worth knowing about (free, inside Ads Manager) but
it's Meta editing your ad at delivery time, not a creative machine we control. **Skip for our
integrated approach** — though Dennis could use Advantage+ directly in Meta regardless of what we build.

---

## YouTube "static ads machine" builds: hype vs reality

Lots of tutorials promise "AI builds your whole ad automatically." What actually works vs what's hype:

- ✅ **Real:** n8n + AI-for-imagery + template-for-text (approach 4). The n8n template gallery has a
  working version. This is the honest version of the promise.
- ⚠️ **Hype:** "one prompt → finished, ready-to-run ad including perfect text." Fails on Dutch text
  legibility and brand consistency. The demos cherry-pick English one-liners.
- ⚠️ **Hype:** all-in-one SaaS ($X/mo → infinite winning ads). Generic output, no fit with our
  existing hook/copy engine, subscription lock-in.

---

## Recommendation for Bakje Geluk

Three tiers, pick based on appetite:

**🥇 Quick win (a few days, ~€0/mo): Satori template in the tool.**
Add a "Genereer static ad" button next to the copy we already generate. 2–3 fixed Bakje Geluk layouts
rendered as PNG, Dutch text perfect, fully free and inside our app. Ship this to prove the flow, get
Dennis reacting to real output fast.

**🥈 Flexible (1–2 weeks, ~€19–29/mo): add Placid or Templated.**
Move templates into a visual editor so the *team* can design and tweak layouts without me. Placid has
the verified n8n node and fits our automation; Templated is the cheapest. This is the sweet spot for a
real, team-usable machine.

**🥉 Robust long-term (2–4 weeks, + ~cents/image): hybrid with Nano Banana Pro.**
AI-generated on-brand imagery + template text overlay. Highest-quality, most varied output; the "wow"
version. Worth doing once the template flow is proven and Dennis knows which layouts convert.

**My suggested path:** start with the quick win (free, fast, proves it), then jump to Placid for team
flexibility, and layer in AI imagery once we know it's earning its keep. Each tier builds on the last —
no wasted work.

### Three checkboxes for Dennis
- [ ] Which tier do you want to start with? (I recommend the quick win → Placid path)
- [ ] Do you want the *team* to be able to design/edit ad templates themselves? (→ yes = Placid/Templated; no = Satori is fine and free)
- [ ] Any brand assets I should build the first templates around? (logo, fonts, colour codes, 2–3 example ads you love)

---

## Sources
- Bannerbear pricing — https://www.bannerbear.com/pricing/
- Placid n8n integration — https://placid.app/solutions/n8n
- Templated vs Bannerbear — https://templated.io/blog/best-bannerbear-alternatives/
- Bannerbear alternatives roundup — https://dynapictures.com/blog/10-top-bannerbear-alternatives/
- Vercel OG / Satori — https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images
- Gemini 3 Pro Image (Nano Banana Pro) — https://deepmind.google/models/gemini-image/pro/
- n8n hybrid template (AI bg + Placid overlay) — https://n8n.io/workflows/5017-place-products-on-ai-generated-backgrounds-with-google-imagen-ideogram-and-placid/
- AI ad-tool comparisons — bestever.ai, admakeai.com, blog.wask.co

*Pricing current as of research date; verify vendor pages before purchase. AI text-rendering figures
are vendor/benchmark claims — validate with a Dutch test batch before trusting AI-rendered text.*
