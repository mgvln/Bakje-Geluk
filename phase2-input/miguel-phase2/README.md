# Bakje Geluk: Phase 2 generation package

Hi Miguel. This bundle ports our internal ad-generation system into a format you can drop straight
into your Phase 2 generation backend. It is the same logic our team uses today to go from a story
to hooks to full ad copy, in Mariska's voice.

The content blocks are Dutch on purpose (the model must produce Dutch copy in Mariska's voice).
Only this README and the short intro notes at the top of each file are English.

## How to use it (prompt assembly order)

Load the blocks as reference context, roughly in this order:

1. **`00-system-prompt.md`**: the core system instruction. Start here: it defines the role,
   input, output contract, and the guardrails summary.
2. **`01-generation-spec.md`**: the operational rules: how many hooks, character limits, which
   formula/variant per awareness level, CTA/button, naming, UTM. Also answers your scope
   questions 2, 3 and 4.
3. **`02-tone-of-voice.md`**: Mariska's voice, codified.
4. **`03-anti-ai-guardrails.md`**: the validation layer. Bake the SCAN-checklist in as a
   post-generation step.
5. **`04-hook-formules.md`** + **`05-copy-varianten.md`**: the craft engines for hooks and copy.
6. **`06-awareness-levels.md`**: the master switch that steers formula, variant, blocks, button.
7. **`07-doelgroep-taal.md`**: the real audience language (pain, dreams, objections) as copy fuel.
8. **`08-brand-overview.md`**: brand anchoring.
9. **`09-notion-field-mapping.md`**: where the output lands and how fields/naming/UTM map.

A practical split for a two-call flow: blocks 00-08 are the generation context; block 09 is the
mapping your backend applies to the output before writing to Notion.

## About your 4 questions

- **Q1 (best-performing ads / tone examples).** We are deliberately not sending raw winner ads or
  their performance data. Instead the tone is captured in codified form: block 02 (voice) is
  distilled from ~3 years of Mariska's Instagram content, and block 03 catches the AI-tells.
  Blocks 04 and 05 carry worked teaching examples. This generalizes better than a handful of raw
  examples and carries no sensitive data. If we later want to calibrate against specific outputs,
  we can react to concrete drafts rather than seed with winners.
- **Q2 (where used / shape).** Meta ads primary text, 250-350 chars. Hooks 27-35 (max 40). Emoji:
  sparing, exactly one at the end of a copy. CTA is a fixed Meta button, not "link in bio". Full
  rules in block 01.
- **Q3 (how many hooks).** Default 3 per story. Your 3-5 range fits; we standardize on 3.
- **Q4 (where in Notion).** Our production pipeline is 🎯 Concepts to 🪩 Hooks. Use the existing
  Hooks properties (Hook / Title, Ad Copy 1, Ad Copy 2, Button, Ad Type, Link, UTM 1), no new
  properties needed. Details and the access note in block 09.

## Next steps on our side

- Confirm whether your tool writes into our live Notion workspace (block 09 lists the databases and
  the access requirement) or keeps its own store with the same field names.
- Optional calibration round: once you have drafts from a real story, we react to them and tune the
  prompt.

## Notes

- The example hooks and copy in blocks 04 and 05 are generic teaching examples, not live ads.
- The quoted Instagram posts in block 02 are public brand content, kept because they teach the voice.
- Everything here is a snapshot of our internal system as of the export date; if our tone or rules
  change we can refresh the bundle.
