# 01: Generation spec (rules the model must follow)

> **For Miguel:** the operational rules distilled from our two production skills
> (`ad-hooks-genereren` + `ad-copy-genereren`). This is the "how many, how long, which
> formula, which button, how named" layer. The deeper craft (the 10 hook formulas, the 6
> copy variants, the audience language) lives in blocks 04–07; this block is the spec that
> ties them to counts, limits and field values. Also answers your scope questions 2, 3, 4.

---

## Antwoorden op de scope-vragen

- **Q2 (waar/vorm):** Meta ads **primary text** (body). Hooks 27–35 tekens (max 40), copy
  250–350 tekens. Emoji: spaarzaam, exact 1 aan het eind van een ad copy. CTA = een vaste
  Meta-button (zie CTA/button hieronder), geen "link in bio".
- **Q3 (aantal hooks):** standaard **3** per bron.
- **Q4 (Notion):** de velden en naamgeving staan in `09-notion-field-mapping.md` (onze
  🎯 Concepts → 🪩 Hooks pipeline).

## Hooks

- **Aantal:** standaard 3.
- **Lengte:** max 40 tekens (hard), sweet spot 27–35.
- **Variatie:** gebruik minstens 2 verschillende hook-formules per set van 3.
- **Sell the beach:** elke hook raakt het resultaat/gevoel of de pijn, nooit het product/proces.
- **Formule-keuze per awareness level** (volledige formules + voorbeelden in `04-hook-formules.md`):

| Awareness Level | Beste hook-formules |
|---|---|
| 1. Unaware | Herkenning, Curiosity Gap, Belofte, Shortcut, Het Geheim |
| 2. Problem Aware | Vraag, Herkenning, Uitdaging, Curiosity Gap |
| 3. Solution Aware | Vraag, Belofte, Uitdaging, Curiosity Gap, Contrarian, Shortcut, Het Geheim |
| 4. Product Aware | Social Proof, Belofte, Urgentie/CTA |
| 5. Most Aware | Urgentie/CTA |

## Ad copy (primary text)

- **Lengte:** 250–350 tekens (niet onder 200; te kort voelt dun).
- **Twee varianten** per hook (Ad Copy 1 + Ad Copy 2), elk een andere invalshoek.
- **3-blokken-structuur:**
  1. **Opening** (1–2 zinnen): verlengt de hook, herhaalt 'm niet. Eerste 125 tekens zijn
     zichtbaar zonder "meer" te klikken, dus impactvol.
  2. **Bewijs & methode** (2–3 zinnen): social proof, methode of verhaal. Concrete cijfers.
  3. **CTA** (1 zin + 1 emoji): passend bij het awareness level.
- **Variant-keuze per awareness level** (volledige varianten in `05-copy-varianten.md`):

| Variant | Unaware | Problem Aware | Solution Aware | Product Aware | Most Aware |
|---|---|---|---|---|---|
| 📌 Bestaande Tekst | ~ | ~ | ~ | ~ | ~ |
| 📦 Direct | | | | x | x |
| 💖 Persoonlijk | | x | x | | |
| ⭐ Sociaal Bewijs | | | x | x | |
| 🔍 Probleem → Oplossing | x | x | | | |
| 💡 Educatief | x | | x | | |

- **Building-block filter (belangrijk):** bij Unaware en Problem Aware nog GEEN productfeatures
  ("200+ recepten") en GEEN social-proof cijfers ("50.000 vrouwen"). Alleen methode en brand.
  Vanaf Solution Aware mag social proof; productfeatures pas volledig bij Product/Most Aware.
  Volledige tabel in `05-copy-varianten.md`.

## CTA / button (Meta vaste knoppen)

Meta heeft vaste knopteksten, niet vrij invulbaar. Mapping op awareness level:

| Awareness Level | Button |
|---|---|
| 1. Unaware | Meer informatie |
| 2. Problem Aware | Meer informatie |
| 3. Solution Aware | Meer informatie |
| 4. Product Aware | Nu winkelen |
| 5. Most Aware | Nu winkelen |

> "Nu winkelen" geeft Meta ook een conversiesignaal, dus bewust inzetten bij warme doelgroepen.

## Naamgeving (per hook)

Afgeleid van de AD Code van het concept:

- **Hook-naam:** `{AD-CODE}-H{nummer}` (bijv. `RDB-ADS-B2-DEC25-H1`).
- **Name 1** (Meta Ads naming): `{Product} | {Type} | {AL} | {AD-CODE}-H{nummer}.1 | {DD-MM-YYYY}`
  - {Type} = creatief formaat (Static / Video / carousel)
  - {AL} = volledige awareness-naam (bijv. `Problem Aware`)

## UTM-structuur

- **Link:** kale product-URL zonder UTM-parameters.
- **UTM 1:** alléén de parameters, zonder URL en zonder leading `?`:
  `utm_source=meta&utm_medium=paid_social&utm_campaign={ad-code-lowercase}&utm_content=h{nummer}.1`

Voorbeeld voor `RDB-ADS-B2-DEC25-H1`:
```
Link:  https://www.bakjegeluk.nl/products/het-bakje-geluk-fit-slank-plan
UTM 1: utm_source=meta&utm_medium=paid_social&utm_campaign=rdb-ads-b2-dec25&utm_content=h1.1
```

De product-URL-mapping per boek staat in `09-notion-field-mapping.md`.
