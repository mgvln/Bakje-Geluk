import { createClient } from "@/lib/supabase/server";
import InspiratieBoard, { type CompetitorAd } from "./InspiratieBoard";

export const dynamic = "force-dynamic";

export default async function InspiratiePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitor_ads")
    .select(
      "id, ad_archive_id, page_name, primary_text, headline, cta_text, link_url, media_type, media_url, is_active, started_at, impressions, scraped_at",
    )
    .order("scraped_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Inspiratie</h1>
      <p className="mb-4 text-sm text-gray-500">
        Scrape de Facebook Ads Library van een merk en blader door hun ads.
      </p>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <InspiratieBoard ads={(data ?? []) as CompetitorAd[]} />
    </div>
  );
}
