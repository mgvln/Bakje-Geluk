"use server";

import { revalidatePath } from "next/cache";
import { Client as Notion } from "@notionhq/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { storyImage, type Decision } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function labelStory(
  storyId: string,
  fields: { decision?: Decision | null; product?: string | null },
) {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin
    .from("stories")
    .update(fields)
    .eq("story_id", storyId);
  if (error) throw new Error(error.message);
  revalidatePath("/triage");
  revalidatePath("/library");
}

export async function setAdBuilt(storyId: string, adBuilt: boolean) {
  await requireUser();
  const admin = createAdminClient();
  const { error } = await admin
    .from("stories")
    .update({ ad_built: adBuilt })
    .eq("story_id", storyId);
  if (error) throw new Error(error.message);
  revalidatePath("/library");
}

// Phase 1: insert selected stories into Notion (product + promo type + image + Supabase link).
export async function exportToNotion(storyIds: string[], promoType: string) {
  await requireUser();
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) {
    throw new Error("Notion is not configured yet (missing token/data source id).");
  }
  const admin = createAdminClient();
  const { data: stories, error } = await admin
    .from("stories")
    .select("story_id, product, username, media_storage_path, source_image_url")
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

    await admin
      .from("stories")
      .update({ exported_to_notion: new Date().toISOString(), ad_built: true })
      .eq("story_id", s.story_id);
  }

  revalidatePath("/library");
  revalidatePath("/ad-system");
}
