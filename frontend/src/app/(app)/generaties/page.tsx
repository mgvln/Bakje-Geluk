import { createClient } from "@/lib/supabase/server";
import { storyImage } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  story_id: string | null;
  competitor_ad_id: string | null;
  hook_title: string;
  formule: string | null;
  ad_copy_1: string | null;
  ad_copy_2: string | null;
  awareness_level: string;
  product: string | null;
  promo_type: string | null;
  button: string | null;
  link: string | null;
  ad_code: string | null;
  assigned_to: string | null;
  scan_flags: string[] | null;
  exported_to_notion: string | null;
  created_at: string;
  stories: {
    username: string | null;
    media_storage_path: string | null;
    source_image_url: string | null;
  } | null;
  competitor_ads: { page_name: string | null; media_url: string | null } | null;
};

export default async function GeneratiesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generated_hooks")
    .select(
      "*, stories(username, media_storage_path, source_image_url), competitor_ads(page_name, media_url)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Generaties</h1>
        <span className="text-sm text-gray-500">
          {rows.length} generatie{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {rows.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          Nog geen generaties. Genereer hooks &amp; copy via het Ad system of de
          Inspiratie tab.
        </p>
      )}

      <div className="space-y-4">
        {rows.map((r) => {
          const sourceImage = r.stories
            ? storyImage(r.stories)
            : r.competitor_ads?.media_url ?? null;
          const sourceLabel = r.stories
            ? `@${r.stories.username ?? "story"}`
            : r.competitor_ads?.page_name ?? "competitor ad";
          const flags = r.scan_flags ?? [];
          return (
            <div key={r.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
              {/* source thumbnail */}
              <div className="hidden h-40 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                {sourceImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sourceImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                    geen media
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {r.ad_code && (
                    <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono text-xs font-medium text-white">{r.ad_code}</span>
                  )}
                  <span className="text-sm font-semibold text-gray-900">{r.hook_title}</span>
                  {r.formule && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r.formule}</span>
                  )}
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{r.awareness_level}</span>
                  {r.product && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r.product}</span>
                  )}
                  {r.promo_type && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{r.promo_type}</span>
                  )}
                  {r.exported_to_notion ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">in Notion</span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleString()} · bron: {sourceLabel}
                  {r.button ? ` · knop: ${r.button}` : ""}
                  {r.assigned_to ? ` · toegewezen: ${r.assigned_to}` : ""}
                </p>

                <a
                  href={`/api/static-ad/${r.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-fit items-center rounded-lg border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-900 hover:border-gray-900"
                  title="Render een static ad (1080×1080) — prototype"
                >
                  🖼️ Genereer static ad
                </a>

                {/* SCAN flags for the reviewer */}
                {flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {flags.map((f, i) => (
                      <span key={i} className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        ⚠ {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {r.ad_copy_1 && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        Copy 1 · {r.ad_copy_1.length} tekens
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-gray-700">{r.ad_copy_1}</p>
                    </div>
                  )}
                  {r.ad_copy_2 && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        Copy 2 · {r.ad_copy_2.length} tekens
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-gray-700">{r.ad_copy_2}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
