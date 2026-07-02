import { createClient } from "@/lib/supabase/server";
import type { Story } from "@/lib/types";
import AdSystem from "./AdSystem";

export const dynamic = "force-dynamic";

export default async function AdSystemPage() {
  const supabase = await createClient();
  // Candidates = marked build_now and not yet exported.
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("decision", "build_now")
    .is("exported_to_notion", null)
    .order("posted_at", { ascending: false })
    .limit(120);

  const stories = (data ?? []) as Story[];

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Ad system</h1>
      <p className="mb-4 text-sm text-gray-500">
        Select stories marked “Build now” and insert them into Notion.
      </p>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <AdSystem stories={stories} />
    </div>
  );
}
