import { SUPABASE_URL } from "./supabase/config";

export type Decision = "build_now" | "build_future" | "rejected";

// Mirrors the public.stories table (subset used by the UI + labeling columns).
export type Story = {
  story_id: string;
  username: string | null;
  user_full_name: string | null;
  media_type: string | null;
  content_type: string | null; // 'story' | 'post'
  short_code: string | null; // IG shortcode → permalink
  is_carousel: boolean | null; // post with multiple images (Sidecar)
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

// Instagram permalink for a post/reel/story from its shortcode, so the team
// can open the original and check carousel images (Dennis 07-24).
export function instagramUrl(shortCode: string | null): string | null {
  return shortCode ? `https://www.instagram.com/p/${shortCode}/` : null;
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

// Promo Type select — must match the Notion "Promo Type" select exactly.
// Dennis simplified this to a single "META-ADS" type (07-28); the old per-type
// list (INSTA-ADS, STATIC-ADS, …) was dropped because it got messy.
export const PROMO_TYPES: string[] = ["META-ADS"];
export const DEFAULT_PROMO_TYPE = "META-ADS";
