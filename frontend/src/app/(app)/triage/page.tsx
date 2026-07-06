import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/lib/types";
import TriageBoard from "./TriageBoard";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const supabase = await createClient();
  // Untriaged = decision is null. Newest first.
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .is("decision", null)
    .order("posted_at", { ascending: false })
    .limit(120);

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
        <TriageBoard stories={stories} />
      )}
    </div>
  );
}
