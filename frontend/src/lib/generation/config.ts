// Generation constants from Dennis's blocks 01 (spec) and 09 (Notion mapping).

export const AWARENESS_LEVELS = [
  "Unaware",
  "Problem Aware",
  "Solution Aware",
  "Product Aware",
  "Most Aware",
] as const;
export type AwarenessLevel = (typeof AWARENESS_LEVELS)[number];

// Meta's fixed button texts, mapped per awareness level (block 01).
export function buttonFor(level: AwarenessLevel): "Meer informatie" | "Nu winkelen" {
  return level === "Product Aware" || level === "Most Aware"
    ? "Nu winkelen"
    : "Meer informatie";
}

// Product URLs for the Link field (block 09). Products without a known URL
// (TNY editions, Protein Oats, Tosti Ebook, ALLES) fall back to the shop root.
export const PRODUCT_URLS: Record<string, string> = {
  "Boek 1": "https://www.bakjegeluk.nl/products/eet-jezelf-lekker-in-je-vel-boek-bundel",
  "Boek 2": "https://www.bakjegeluk.nl/products/het-bakje-geluk-fit-slank-plan",
  "Boek 3": "https://www.bakjegeluk.nl/products/bakje-geluk-whey-protein-vanille-bundel",
  "Boek 4": "https://www.bakjegeluk.nl/products/boek-5-bakje-geluk-the-new-you",
  "Boek 5": "https://www.bakjegeluk.nl/products/boek-5-bakje-geluk-the-new-you",
  "Boek 6": "https://www.bakjegeluk.nl/products/boek-6-bakje-geluk-de-mealprep-editie",
};

export function productUrl(product: string | null): string {
  return (product && PRODUCT_URLS[product]) || "https://www.bakjegeluk.nl";
}

// UTM 1: params only, no URL, no leading "?" (block 09).
export function utmFor(adCode: string, hookNumber: number): string {
  return `utm_source=meta&utm_medium=paid_social&utm_campaign=${adCode.toLowerCase()}&utm_content=h${hookNumber}.1`;
}

// Team members who can be assigned to an ad — matches the Assign column in
// Dennis's Notion Concepts DB (Dennis, Roos, Jun + a Designer role).
export const TEAM_MEMBERS = ["Dennis", "Roos", "Jun", "Designer"] as const;

// Month token for the AD code, e.g. "JUL26" (uppercase 3-letter month + 2-digit year).
// English abbreviations (Dennis's example: "July" -> JUL). Confirm MAR/MAY/OCT vs Dutch if it matters.
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function monthToken(d = new Date()): string {
  return `${MONTHS[d.getMonth()]}${String(d.getFullYear()).slice(2)}`;
}

// AD code: [{PROMO}-B{batch}-{MONTH}{YY}], e.g. [INSTA-ADS-B1-JUL26].
// Square brackets match the format in Dennis's Notion Concepts DB.
export function adCode(promoType: string, batch: number, month = monthToken()): string {
  return `[${promoType}-B${batch}-${month}]`;
}
