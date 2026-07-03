"use client";

import { useState, useTransition } from "react";
import { exportToNotion } from "@/app/actions";
import { PROMO_TYPES, storyMedia, type Story } from "@/lib/types";

export default function AdSystem({ stories }: { stories: Story[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [promoType, setPromoType] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportSelected() {
    setMsg(null);
    startTransition(async () => {
      try {
        await exportToNotion([...selected], promoType);
        setMsg(`Exported ${selected.size} stor${selected.size === 1 ? "y" : "ies"} to Notion.`);
        setSelected(new Set());
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Export failed.");
      }
    });
  }

  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <span className="text-sm font-medium text-gray-900">{selected.size} selected</span>
        <select
          value={promoType}
          onChange={(e) => setPromoType(e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
        >
          <option value="">Promo type…</option>
          {PROMO_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={exportSelected}
          disabled={pending || selected.size === 0 || !promoType}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Exporting…" : "Insert into Notion"}
        </button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {stories.length === 0 ? (
        <p className="text-sm text-gray-500">No stories marked “Build now” are waiting.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stories.map((s) => {
            const isSel = selected.has(s.story_id);
            const { url, isVideo } = storyMedia(s);
            return (
              <button
                key={s.story_id}
                onClick={() => toggle(s.story_id)}
                className={`overflow-hidden rounded-xl border-2 text-left ${
                  isSel ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200"
                }`}
              >
                <div className="relative aspect-[9/16] bg-gray-100">
                  {url && isVideo ? (
                    // no controls so the click still selects the card; shows first frame
                    <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">no media</div>
                  )}
                  {isVideo && (
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">▶ video</span>
                  )}
                  {isSel && (
                    <span className="absolute right-2 top-2 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                      ✓
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-medium text-gray-900">@{s.username ?? "unknown"}</p>
                  {s.product && <p className="text-xs text-blue-700">{s.product}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
