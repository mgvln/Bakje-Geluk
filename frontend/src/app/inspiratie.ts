"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Triggers the n8n "Competitor Ads Scraper" workflow (webhook → Apify FB Ads
// Library actor → competitor_ads upsert). Runs synchronously; a full scrape of
// a ~50-ad brand takes ~1-2 minutes.
const WEBHOOK_URL = "https://n8n.bakjegeluk.nl/webhook/competitor-ads-scrape-x7k2m9";
// Shared secret so the webhook can't be triggered by random internet traffic.
// Server-only module — never shipped to the client.
const WEBHOOK_SECRET = "bakje-inspiratie-2026";

export async function scrapeCompetitorAds(
  url: string,
  limit = 60,
): Promise<{ inserted: number; page_name: string | null }> {
  // Auth gate: only logged-in team members may trigger scrapes (they cost money).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: WEBHOOK_SECRET, url, limit }),
    // Apify run-sync can take a while; Vercel function limit applies (see note in page).
    signal: AbortSignal.timeout(290_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Scrape mislukt (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { inserted: number; page_name: string | null };
  revalidatePath("/inspiratie");
  return data;
}
