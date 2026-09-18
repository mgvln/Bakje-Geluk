import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/lib/types";
import StoryCard from "@/components/StoryCard";
import LibraryFilters from "./LibraryFilters";
import DecisionSelect from "./DecisionSelect";

export const dynamic = "force-dynamic";

type SP = { [k: string]: string | undefined };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Select only the columns the UI needs. Notably excludes `raw` (the full
  // Instagram JSON blob), which made the payload ~12x larger and the page slow.
  const COLS =
    "story_id,username,user_full_name,media_type,content_type,short_code,is_carousel," +
    "source_image_url,media_storage_path,media_storage_url,overlay_text,caption,category," +
    "posted_at,scraped_at,decision,product,ad_built,exported_to_notion";
  let q = supabase.from("stories").select(COLS).order("posted_at", { ascending: false }).limit(300);

  if (sp.view === "raw") q = q.is("decision", null);
  if (sp.view === "filtered") q = q.not("decision", "is", null);
  if (sp.content === "story") q = q.or("content_type.eq.story,content_type.is.null");
  if (sp.content === "post") q = q.eq("content_type", "post");
  if (sp.decision) q = q.eq("decision", sp.decision);
  if (sp.product) q = q.eq("product", sp.product);
  if (sp.category) q = q.eq("category", sp.category);
  if (sp.exported === "yes") q = q.not("exported_to_notion", "is", null);
  if (sp.exported === "no") q = q.is("exported_to_notion", null);
  if (sp.from) q = q.gte("posted_at", sp.from);
  if (sp.to) q = q.lte("posted_at", `${sp.to}T23:59:59`);

  const { data, error } = await q;
  const stories = (data ?? []) as unknown as Story[];

  // Actual date span of what's on screen, so you know what you're looking at.
  const dates = stories
    .map((s) => s.posted_at)
    .filter((d): d is string => !!d)
    .sort();
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  const rangeLabel =
    dates.length > 0
      ? dates[0].slice(0, 10) === dates[dates.length - 1].slice(0, 10)
        ? fmt(dates[0])
        : `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`
      : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-lg font-semibold text-gray-900">Library</h1>
        <span className="text-sm text-gray-500">
          {stories.length} item{stories.length === 1 ? "" : "s"}
          {rangeLabel ? ` · ${rangeLabel}` : ""}
        </span>
      </div>
      <LibraryFilters />

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stories.map((s) => (
          <StoryCard key={s.story_id} story={s}>
            <DecisionSelect story={s} />
          </StoryCard>
        ))}
      </div>
      {stories.length === 0 && !error && (
        <p className="mt-6 text-sm text-gray-500">No stories match these filters.</p>
      )}
    </div>
  );
}
