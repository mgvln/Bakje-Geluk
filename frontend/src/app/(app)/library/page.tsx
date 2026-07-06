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

  let q = supabase.from("stories").select("*").order("posted_at", { ascending: false }).limit(120);

  if (sp.view === "raw") q = q.is("decision", null);
  if (sp.view === "filtered") q = q.not("decision", "is", null);
  if (sp.decision) q = q.eq("decision", sp.decision);
  if (sp.product) q = q.eq("product", sp.product);
  if (sp.category) q = q.eq("category", sp.category);
  if (sp.exported === "yes") q = q.not("exported_to_notion", "is", null);
  if (sp.exported === "no") q = q.is("exported_to_notion", null);

  const { data, error } = await q;
  const stories = (data ?? []) as Story[];

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Library</h1>
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
