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
