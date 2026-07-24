import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { storyImage } from "@/lib/types";

export const runtime = "nodejs";

// Static-ads PROTOTYPE (free Satori tier). Renders a saved generation into a
// 1080x1080 feed ad. Placeholder Bakje Geluk styling — proof of concept, not
// final brand design (awaiting logo/fonts/colors). GET /api/static-ad/{generation-id}
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Not authenticated", { status: 401 });

  const { data: g, error } = await supabase
    .from("generated_hooks")
    .select(
      "hook_title, ad_copy_1, button, product, ad_code, awareness_level, story_id, competitor_ad_id, stories(media_storage_path, source_image_url)",
    )
    .eq("id", id)
    .single();
  if (error || !g) return new Response("Not found", { status: 404 });

  const story = Array.isArray(g.stories) ? g.stories[0] : g.stories;
  const bg = story
    ? storyImage(story as { media_storage_path: string | null; source_image_url: string | null })
    : null;

  // Palette: warm cream + raspberry accent (placeholder brand styling).
  const CREAM = "#FBF7F1";
  const INK = "#241A1E";
  const BERRY = "#C2255C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CREAM,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* top image band (source photo if any) */}
        <div style={{ display: "flex", width: "1080px", height: "560px", backgroundColor: "#E7DFD6" }}>
          {bg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bg} width={1080} height={560} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ display: "flex", width: "1080px", height: "560px", alignItems: "center", justifyContent: "center", color: "#9A9088", fontSize: 28 }}>
              Bakje Geluk
            </div>
          )}
        </div>

        {/* text block */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 64px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, color: BERRY, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Bakje Geluk{g.product ? ` · ${g.product}` : ""}
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 64, lineHeight: 1.1, color: INK, fontWeight: 800 }}>
              {g.hook_title}
            </div>
            {g.ad_copy_1 ? (
              <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.4, color: "#5A4A50" }}>
                {g.ad_copy_1.length > 150 ? g.ad_copy_1.slice(0, 150) + "…" : g.ad_copy_1}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", backgroundColor: BERRY, color: "#fff", fontSize: 30, fontWeight: 700, padding: "18px 40px", borderRadius: 999 }}>
              {g.button ?? "Meer informatie"}
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "#9A9088" }}>{g.ad_code ?? ""}</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
