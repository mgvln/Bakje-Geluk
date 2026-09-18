import { createClient } from "@/lib/supabase/server";
import { listProducts } from "@/app/actions";
import type { Story } from "@/lib/types";
import TriageBoard from "./TriageBoard";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const supabase = await createClient();
  // Untriaged = decision is null. Newest first.
  // Only the columns the board needs — excludes the large `raw` JSON blob.
  const COLS =
    "story_id,username,user_full_name,media_type,content_type,short_code,is_carousel," +
    "source_image_url,media_storage_path,media_storage_url,overlay_text,caption,category," +
    "posted_at,scraped_at,decision,product,ad_built,exported_to_notion";
  const { data, error } = await supabase
    .from("stories")
    .select(COLS)
    .is("decision", null)
    .order("posted_at", { ascending: false })
    .limit(120);

  const stories = (data ?? []) as unknown as Story[];
  const products = await listProducts();

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Triage</h1>
        <span className="text-sm text-gray-500">{stories.length} new to review</span>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {stories.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing to triage. 🎉</p>
      ) : (
        <TriageBoard stories={stories} products={products} />
      )}
    </div>
  );
}
