import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/lib/types";
import TriageControls from "./TriageControls";
import StoryCard from "@/components/StoryCard";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const supabase = await createClient();
  // Untriaged = decision is null. Newest first.
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .is("decision", null)
    .order("posted_at", { ascending: false })
    .limit(60);

  const stories = (data ?? []) as Story[];

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stories.map((s) => (
            <StoryCard key={s.story_id} story={s}>
              <TriageControls story={s} />
            </StoryCard>
          ))}
        </div>
      )}
    </div>
  );
}
