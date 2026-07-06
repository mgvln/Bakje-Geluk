"use client";

import { useState, useTransition } from "react";
import { labelStories } from "@/app/actions";
import { PRODUCTS, storyMedia, type Story, type Decision } from "@/lib/types";
import TriageControls from "./TriageControls";

export default function TriageBoard({ stories }: { stories: Story[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkProduct, setBulkProduct] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allSelected = selected.size === stories.length && stories.length > 0;
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(stories.map((s) => s.story_id)));
  }

  // Assign a decision (and optional product) to every selected story at once.
  function bulkDecide(decision: Decision) {
    const ids = [...selected];
    if (ids.length === 0) return;
    startTransition(async () => {
      await labelStories(ids, {
        decision,
        ...(bulkProduct ? { product: bulkProduct } : {}),
      });
      setSelected(new Set());
      setBulkProduct("");
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4" />
          Select all
        </label>
        <span className="text-sm font-medium text-gray-900">{selected.size} selected</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={bulkProduct}
            onChange={(e) => setBulkProduct(e.target.value)}
            disabled={selected.size === 0 || pending}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 disabled:opacity-50"
          >
            <option value="">Product (optional)…</option>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button onClick={() => bulkDecide("build_now")} disabled={selected.size === 0 || pending}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            Now
          </button>
          <button onClick={() => bulkDecide("build_future")} disabled={selected.size === 0 || pending}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Later
          </button>
          <button onClick={() => bulkDecide("rejected")} disabled={selected.size === 0 || pending}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-50 disabled:opacity-50">
            Skip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stories.map((s) => {
          const isSel = selected.has(s.story_id);
          const { url, isVideo } = storyMedia(s);
          return (
            <div
              key={s.story_id}
              className={`flex flex-col overflow-hidden rounded-xl border bg-white ${
                isSel ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200"
              }`}
            >
              <div className="relative aspect-[9/16] bg-gray-100">
                {/* selection checkbox overlay */}
                <label className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/90 shadow">
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggle(s.story_id)}
                    className="h-4 w-4"
                  />
                </label>
                {url && isVideo ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" controls />
                ) : url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">no media</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-gray-900">@{s.username ?? "unknown"}</span>
                  <span className="text-xs text-gray-400">
                    {s.posted_at ? new Date(s.posted_at).toLocaleDateString() : ""}
                  </span>
                </div>
                {s.overlay_text && <p className="line-clamp-2 text-xs text-gray-600">{s.overlay_text}</p>}
                <TriageControls story={s} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
