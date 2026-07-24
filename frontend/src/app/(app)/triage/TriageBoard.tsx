"use client";

import { useState, useTransition } from "react";
import { labelStories, addProduct } from "@/app/actions";
import { storyMedia, type Story, type Decision } from "@/lib/types";
import TriageControls from "./TriageControls";

// A story row is a "post/reel" when content_type is 'post'; everything else
// (incl. null legacy rows) is a story.
function isPost(s: Story) {
  return s.content_type === "post";
}

export default function TriageBoard({
  stories,
  products,
}: {
  stories: Story[];
  products: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkProduct, setBulkProduct] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "story" | "post">("all");
  const [productList, setProductList] = useState<string[]>(products);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [pending, startTransition] = useTransition();

  function saveNewProduct() {
    const name = newProduct.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        const updated = await addProduct(name);
        setProductList(updated);
        setBulkProduct(name);
        setNewProduct("");
        setAddingProduct(false);
      } catch {
        // keep the input open on failure
      }
    });
  }

  const visible = stories.filter((s) =>
    typeFilter === "all" ? true : typeFilter === "post" ? isPost(s) : !isPost(s),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allSelected = visible.length > 0 && visible.every((s) => selected.has(s.story_id));
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visible.map((s) => s.story_id)));
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

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "story" | "post")}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
          title="Filter op type"
        >
          <option value="all">Alle types</option>
          <option value="story">Stories</option>
          <option value="post">Posts / Reels</option>
        </select>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {addingProduct ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNewProduct()}
                placeholder="Nieuw product…"
                className="w-40 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button onClick={saveNewProduct} disabled={pending || !newProduct.trim()}
                className="rounded-lg bg-gray-900 px-2 py-1.5 text-sm font-medium text-white disabled:opacity-50">
                ✓
              </button>
              <button onClick={() => { setAddingProduct(false); setNewProduct(""); }}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-500">
                ✕
              </button>
            </span>
          ) : (
            <select
              value={bulkProduct}
              onChange={(e) => {
                if (e.target.value === "__add__") { setAddingProduct(true); return; }
                setBulkProduct(e.target.value);
              }}
              disabled={pending}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 disabled:opacity-50"
            >
              <option value="">Product (optional)…</option>
              {productList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="__add__">+ Nieuw product toevoegen…</option>
            </select>
          )}
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
        {visible.map((s) => {
          const isSel = selected.has(s.story_id);
          const { url, isVideo } = storyMedia(s);
          const post = isPost(s);
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
                {/* story vs post/reel badge (Dennis 07-24) */}
                <span
                  className={`absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    post ? "bg-blue-600 text-white" : "bg-black/60 text-white"
                  }`}
                >
                  {post ? "post / reel" : "story"}
                </span>
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
                {(s.overlay_text || s.caption) && (
                  <p className="line-clamp-2 text-xs text-gray-600" title={s.overlay_text ?? s.caption ?? undefined}>
                    {s.overlay_text ?? s.caption}
                  </p>
                )}
                <TriageControls story={s} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
