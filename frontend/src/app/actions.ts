"use server";

import { revalidatePath } from "next/cache";
import { Client as Notion } from "@notionhq/client";
import { createClient } from "@/lib/supabase/server";
import { storyImage, type Decision } from "@/lib/types";

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

// Phase 1: insert selected stories into Notion (product + promo type + image + Supabase link).
export async function exportToNotion(storyIds: string[], promoType: string) {
  const supabase = await requireUser();
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) {
    throw new Error("Notion is not configured yet (missing token/data source id).");
  }
  const { data: stories, error } = await supabase
    .from("stories")
    .select("story_id, product, username, media_storage_path, source_image_url, caption, overlay_text")
    .in("story_id", storyIds);
  if (error) throw new Error(error.message);

  const notion = new Notion({ auth: process.env.NOTION_TOKEN });

  // Maps to the "ADS Concepts Database" (data source 61413826-…). Phase 1 = product +
  // promo type + Status "In Production" + image and Supabase link in the page body.
  for (const s of stories ?? []) {
    const image = storyImage(s);
    const adCode = `${s.product ?? "Concept"} · @${s.username ?? "unknown"}`;

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
        "AD Code": { title: [{ text: { content: adCode } }] },
        ...(s.product ? { Product: { select: { name: s.product } } } : {}),
        "Promo Type": { select: { name: promoType } },
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
