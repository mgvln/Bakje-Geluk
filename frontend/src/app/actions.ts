"use server";

import { revalidatePath } from "next/cache";
import { Client as Notion } from "@notionhq/client";
import { createClient } from "@/lib/supabase/server";
import { storyImage, type Decision } from "@/lib/types";
import type { AwarenessLevel } from "@/lib/generation/config";

// Returns the logged-in user's Supabase client (RLS applies as `authenticated`).
// Writes rely on the "authenticated can modify stories" policy — no service-role key,
// which avoids depending on a secret env var that can corrupt on paste.
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

// Product list is now table-backed (Dennis 07-24). Falls back to the static
// PRODUCTS constant if the table is empty/unavailable so nothing breaks.
export async function listProducts(): Promise<string[]> {
  const { PRODUCTS } = await import("@/lib/types");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("name")
    .order("sort", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data || data.length === 0) return PRODUCTS;
  return data.map((r) => r.name as string);
}

export async function addProduct(name: string): Promise<string[]> {
  const clean = name.trim();
  if (!clean) throw new Error("Productnaam is leeg.");
  const supabase = await requireUser();
  const { error } = await supabase.from("products").insert({ name: clean });
  // Ignore duplicate-key errors (product already exists); surface others.
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw new Error(error.message);
  }
  revalidatePath("/triage");
  return listProducts();
}

export async function labelStory(
  storyId: string,
  fields: { decision?: Decision | null; product?: string | null },
) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("stories")
    .update(fields)
    .eq("story_id", storyId);
  if (error) throw new Error(error.message);
  revalidatePath("/triage");
  revalidatePath("/library");
}

// Bulk version of labelStory — assign decision and/or product to many stories at once.
export async function labelStories(
  storyIds: string[],
  fields: { decision?: Decision | null; product?: string | null },
) {
  const supabase = await requireUser();
  if (storyIds.length === 0) return;
  const { error } = await supabase
    .from("stories")
    .update(fields)
    .in("story_id", storyIds);
  if (error) throw new Error(error.message);
  revalidatePath("/triage");
  revalidatePath("/library");
}

export async function setAdBuilt(storyId: string, adBuilt: boolean) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("stories")
    .update({ ad_built: adBuilt })
    .eq("story_id", storyId);
  if (error) throw new Error(error.message);
  revalidatePath("/library");
}

// Insert selected stories into the Notion ADS Concepts DB as concepts.
// AD Code uses the proper bracketed auto-numbered format ([PROMO-B{n}-{MON}{YY}])
// and sets the Awareness Level — matching Dennis's Concepts DB (fixed 07-28).
export async function exportToNotion(
  storyIds: string[],
  promoType: string,
  awarenessLevel: AwarenessLevel = "Solution Aware",
) {
  const supabase = await requireUser();
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) {
    throw new Error("Notion is not configured yet (missing token/data source id).");
  }
  const { adCode, monthToken, awarenessNotion } = await import("@/lib/generation/config");
  const { data: stories, error } = await supabase
    .from("stories")
    .select("story_id, product, username, media_storage_path, source_image_url, caption, overlay_text")
    .in("story_id", storyIds);
  if (error) throw new Error(error.message);

  const notion = new Notion({ auth: process.env.NOTION_TOKEN });
  const month = monthToken();

  // Maps to the "ADS Concepts Database" (data source 61413826-…). Each story
  // becomes a concept with its own auto-numbered AD Code.
  for (const s of stories ?? []) {
    const image = storyImage(s);
    // Next batch number for this promo+month from the shared atomic counter.
    const { data: batch, error: batchErr } = await supabase.rpc("next_ad_batch", {
      p_promo: promoType,
      p_month: month,
    });
    if (batchErr) throw new Error(batchErr.message);
    const adCodeStr = adCode(promoType, batch as number, month);

    const children: object[] = [];
    if (image) {
      children.push({
        object: "block",
        type: "image",
        image: { type: "external", external: { url: image } },
      });
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: "Supabase download", link: { url: image } },
            },
          ],
        },
      });
    }

    // Original Instagram copy (post caption or story OCR text), truncated to
    // Notion's 2000-char rich_text limit.
    const copy = s.caption ?? s.overlay_text;
    if (copy) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: copy.slice(0, 2000) } }],
        },
      });
    }

    await notion.pages.create({
      // SDK v5 (2025-09 API) creates pages under a data source, not the database.
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties: {
        // Promo type now lives only inside the AD Code ([META-ADS-B{n}-{MON}{YY}]).
        // Dennis removed the standalone "Promo Type" Notion property (07-28), so
        // we no longer write it — doing so was throwing on insert.
        "AD Code": { title: [{ text: { content: adCodeStr } }] },
        ...(s.product ? { Product: { select: { name: s.product } } } : {}),
        "Awareness Level": { select: { name: awarenessNotion(awarenessLevel) } },
        Status: { select: { name: "In Production" } },
      },
      children: children as never,
    } as never);

    await supabase
      .from("stories")
      .update({ exported_to_notion: new Date().toISOString(), ad_built: true })
      .eq("story_id", s.story_id);
  }

  revalidatePath("/library");
  revalidatePath("/ad-system");
}
