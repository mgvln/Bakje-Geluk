"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { scrapeCompetitorAds } from "@/app/inspiratie";
import GeneratePanel from "../ad-system/GeneratePanel";
import { PRODUCTS, PROMO_TYPES } from "@/lib/types";
import { AWARENESS_LEVELS, type AwarenessLevel } from "@/lib/generation/config";

export type CompetitorAd = {
  id: string;
  ad_archive_id: string;
  page_name: string | null;
  primary_text: string | null;
  headline: string | null;
  cta_text: string | null;
  link_url: string | null;
  media_type: string | null;
  media_url: string | null;
  is_active: boolean;
  started_at: string | null;
  impressions: string | null;
  scraped_at: string;
};

export default function InspiratieBoard({ ads }: { ads: CompetitorAd[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [inspiring, setInspiring] = useState<CompetitorAd | null>(null);
  const [genProduct, setGenProduct] = useState("ALLES");
  const [genPromo, setGenPromo] = useState("META-ADS");
  const [genAwareness, setGenAwareness] = useState<AwarenessLevel>("Solution Aware");

  const brands = useMemo(
    () => [...new Set(ads.map((a) => a.page_name).filter(Boolean))] as string[],
    [ads],
  );
  const shown = brand ? ads.filter((a) => a.page_name === brand) : ads;

  function scrape() {
    setMsg("Scrapen… dit kan 1–2 minuten duren.");
    start(async () => {
      try {
        const r = await scrapeCompetitorAds(url.trim());
        setMsg(`✅ ${r.inserted} ads opgehaald${r.page_name ? ` van ${r.page_name}` : ""}.`);
        setUrl("");
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Scrape mislukt.");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ads Library URL, facebook.com/pagina of handle…"
          className="min-w-72 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400"
        />
        <button
          onClick={scrape}
          disabled={pending || !url.trim()}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Scrapen…" : "Scrape ads"}
        </button>
        {brands.length > 0 && (
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
          >
            <option value="">Alle merken</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {inspiring && (
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm">
            <span className="text-xs font-medium text-gray-700">Vertaal naar Bakje Geluk:</span>
            <select value={genProduct} onChange={(e) => setGenProduct(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900">
              {PRODUCTS.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
            </select>
            <select value={genPromo} onChange={(e) => setGenPromo(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900">
              {PROMO_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
            </select>
            <select value={genAwareness} onChange={(e) => setGenAwareness(e.target.value as AwarenessLevel)} className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900">
              {AWARENESS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <GeneratePanel
            key={`${inspiring.id}-${genProduct}-${genPromo}-${genAwareness}`}
            source={{ kind: "competitor", id: inspiring.id }}
            title={`inspiratie van ${inspiring.page_name ?? "onbekend"}`}
            sourceText={[inspiring.headline, inspiring.primary_text].filter(Boolean).join(" — ") || null}
            product={genProduct}
            promoType={genPromo}
            awarenessLevel={genAwareness}
            onClose={() => setInspiring(null)}
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nog geen ads gescraped. Plak hierboven een Ads Library-link (bijv. die van Dennis) en klik Scrape.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {a.media_url && a.media_type === "video" ? (
                <video src={a.media_url} className="aspect-square w-full bg-gray-100 object-cover" controls muted preload="metadata" />
              ) : a.media_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.media_url} alt="" className="aspect-square w-full bg-gray-100 object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                  geen media
                </div>
              )}
              <div className="p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">{a.page_name ?? "onbekend"}</p>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${a.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {a.is_active ? "actief" : "inactief"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {a.started_at ? `sinds ${a.started_at}` : ""}
                  {a.impressions ? ` · ${a.impressions} impressies` : ""}
                </p>
                {a.headline && <p className="mt-1 text-sm font-medium text-gray-900">{a.headline}</p>}
                {a.primary_text && (
                  <p className="mt-1 line-clamp-5 whitespace-pre-line text-xs text-gray-600" title={a.primary_text}>
                    {a.primary_text}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => { setInspiring(a); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="rounded-lg border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-900 hover:border-gray-900"
                    title="Gebruik deze ad als inspiratie voor eigen hooks + copy"
                  >
                    ✨ gebruik als inspiratie
                  </button>
                  <a
                    href={`https://www.facebook.com/ads/library/?id=${a.ad_archive_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    bekijk in Ads Library ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
