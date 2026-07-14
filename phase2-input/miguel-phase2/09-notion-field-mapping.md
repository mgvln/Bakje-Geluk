# 09: Notion field mapping (🎯 Concepts → 🪩 Hooks)

> **For Miguel:** where the generated hook + copy should land. This mirrors our production
> pipeline: a **Concept** (🎯 Concepts) holds the strategic frame (product, awareness, promo type),
> and each generated hook becomes a row in **🪩 Hooks** with its copy on the same row. Answers your
> scope question 4: use existing Hooks properties, no need to invent new ones.
>
> **Access note:** the data source IDs below are our live Notion databases. Writing into them
> requires that Dennis grants your tool/integration access to that Notion workspace. Confirm that
> separately before wiring the write path; until then you can map to these field names in your own
> store and switch the target later.

---

## Databases

| Database | Data source ID |
|---|---|
| 🎯 Concepts | `61413826-fd16-4ea4-be05-7a3dda2713b8` |
| 🪩 Hooks | `910afaf4-4cea-4018-9499-e0a40de529a2` |

De tool schrijft primair naar **🪩 Hooks**, met een relatie terug naar het bron-concept in
**🎯 Concepts**.

## Hooks: velden die de generator vult

| Notion-property | Type | Waarde |
|---|---|---|
| `Name` | title | hook-naam `{AD-CODE}-H{nummer}` (bijv. `RDB-ADS-B2-DEC25-H1`) |
| `Name 1` | text | Meta naming: `{Product} \| {Type} \| {AL} \| {AD-CODE}-H{n}.1 \| {DD-MM-YYYY}` |
| `Hook / Title` | text | de hook-tekst (max 40 tekens) |
| `Ad Copy 1` | text | primary text variant 1 (250-350 tekens) |
| `Ad Copy 2` | text | primary text variant 2 (andere invalshoek) |
| `Ad Type` | select | `Static` / `Video` / `carousel` |
| `Button` | select | `Meer informatie` (Unaware/PA/SA) of `Nu winkelen` (PrA/MA) |
| `Link` | url | kale product-URL zonder UTM (zie product-links) |
| `UTM 1` | url/text | alléén de UTM-params, zonder URL, zonder leading `?` |
| `Concept` | relation | link naar de bron-rij in 🎯 Concepts |
| `Bronbestand` | url | optioneel (bijv. Canva-link), leeg laten als onbekend |
| `Instagram URL` | url | alleen bij INSTA-ADS, anders weglaten |

**Niet vullen** (bestaan niet of worden elders gezet): `Name 2`, `UTM 2`, `Status`, `Assigned To`,
`Videoscript 1/2` (alleen bij video, apart), `9:16`/`1:1`-asset-velden (later).

**Awareness Level** op de hook is een rollup uit het gekoppelde Concept, dus niet zelf zetten.

## Naming detail

- **Hook-naam:** `{AD-CODE}-H{nummer}`. Tel bestaande hooks van het concept op voor het startnummer.
- **Name 1:** `{Product} | {Type} | {AL} | {AD-CODE}-H{n}.1 | {DD-MM-YYYY}`
  - {Type} = `Static` / `Video` / `carousel`
  - {AL} = volledige awareness-naam (`Problem Aware`, `Solution Aware`, ...)
  - Voorbeeld: `Boek 2 | Static | Problem Aware | RDB-ADS-B2-DEC25-H1.1 | 13-07-2026`

## UTM-structuur

- **Link:** kale product-URL.
- **UTM 1:** `utm_source=meta&utm_medium=paid_social&utm_campaign={ad-code-lowercase}&utm_content=h{nummer}.1`

Voorbeeld (`RDB-ADS-B2-DEC25-H1`):
```
Link:  https://www.bakjegeluk.nl/products/het-bakje-geluk-fit-slank-plan
UTM 1: utm_source=meta&utm_medium=paid_social&utm_campaign=rdb-ads-b2-dec25&utm_content=h1.1
```

## Product-links (per boek)

| Product | URL |
|---|---|
| Boek 1 | `https://www.bakjegeluk.nl/products/eet-jezelf-lekker-in-je-vel-boek-bundel` |
| Boek 2 | `https://www.bakjegeluk.nl/products/het-bakje-geluk-fit-slank-plan` |
| Boek 3 | `https://www.bakjegeluk.nl/products/bakje-geluk-whey-protein-vanille-bundel` |
| Boek 4 | `https://www.bakjegeluk.nl/products/boek-5-bakje-geluk-the-new-you` |
| Boek 5 | `https://www.bakjegeluk.nl/products/boek-5-bakje-geluk-the-new-you` |
| Boek 6 | `https://www.bakjegeluk.nl/products/boek-6-bakje-geluk-de-mealprep-editie` |

## Button-mapping (Meta vaste knoppen)

| Awareness Level | Button |
|---|---|
| Unaware | Meer informatie |
| Problem Aware | Meer informatie |
| Solution Aware | Meer informatie |
| Product Aware | Nu winkelen |
| Most Aware | Nu winkelen |
