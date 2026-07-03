import { SUPABASE_URL } from "./supabase/config";

export type Decision = "build_now" | "build_future" | "rejected";

// Mirrors the public.stories table (subset used by the UI + labeling columns).
export type Story = {
  story_id: string;
  username: string | null;
  user_full_name: string | null;
  media_type: string | null;
  source_image_url: string | null;
  source_video_url: string | null;
  media_storage_path: string | null;
  media_storage_url: string | null;
  overlay_text: string | null;
  caption: string | null;
  category: string | null;
  posted_at: string | null;
  scraped_at: string | null;
  // Labeling columns (migration 001)
  decision: Decision | null;
  product: string | null;
  ad_built: boolean;
  exported_to_notion: string | null;
};

// Builds the public storage URL from media_storage_path (bucket is public).
// media_storage_path already includes the bucket name, e.g. "story-media/bakjegeluk/x.jpg".
// Falls back to the Instagram source URL (which can expire) if there's no stored path.
export function storyImage(s: {
  media_storage_path: string | null;
  source_image_url: string | null;
}): string | null {
  if (s.media_storage_path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${s.media_storage_path}`;
  }
  return s.source_image_url ?? null;
}

// Returns the media URL plus whether it's a video, so the UI renders <video> for
// .mp4 stories instead of a broken <img>.
export function storyMedia(s: {
  media_type: string | null;
  media_storage_path: string | null;
  source_image_url: string | null;
}): { url: string | null; isVideo: boolean } {
  const url = storyImage(s);
  const isVideo =
    s.media_type === "video" || (s.media_storage_path?.endsWith(".mp4") ?? false);
  return { url, isVideo };
}

export const DECISION_LABELS: Record<Decision, string> = {
  build_now: "Build now",
  build_future: "Build later",
  rejected: "Rejected",
};

// Product select options — must match the Notion "Product" select exactly.
export const PRODUCTS: string[] = [
  "ALLES",
  "Boek 1",
  "Boek 2",
  "Boek 3",
  "Boek 4",
  "Boek 5",
  "Boek 6",
  "TNY - Lente Editie",
  "TNY - SummerFit",
  "Protein Oats",
  "Tosti Ebook",
];

// Promo Type select options — must match the Notion "Promo Type" select exactly.
export const PROMO_TYPES: string[] = [
  "INSTA-ADS",
  "STATIC-ADS",
  "PRO-ADS",
  "RDB-ADS",
  "VDB-ADS",
  "AL-ADS",
  "NVV-ADS",
  "COM-ADS",
  "TESTA-ADS",
  "POD-ADS",
  "MARISKA-ADS",
];
