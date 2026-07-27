"use client";

import { useTransition } from "react";
import { labelStory } from "@/app/actions";
import { type Story } from "@/lib/types";

export default function TriageControls({
  story,
  products,
}: {
  story: Story;
  products: string[];
}) {
  const [pending, startTransition] = useTransition();

  function decide(decision: "build_now" | "build_future" | "rejected") {
    startTransition(() => labelStory(story.story_id, { decision }));
  }

  function setProduct(product: string) {
    startTransition(() =>
      labelStory(story.story_id, { product: product || null }),
    );
  }

  return (
    <div className="mt-auto space-y-2 pt-1">
      <select
        defaultValue={story.product ?? ""}
        onChange={(e) => setProduct(e.target.value)}
        disabled={pending}
        className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900"
      >
        <option value="">Product…</option>
        {products.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => decide("build_now")}
          disabled={pending}
          className="rounded-md bg-gray-900 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Now
        </button>
        <button
          onClick={() => decide("build_future")}
          disabled={pending}
          className="rounded-md border border-gray-300 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Later
        </button>
        <button
          onClick={() => decide("rejected")}
          disabled={pending}
          className="rounded-md border border-gray-300 py-1 text-xs font-medium text-gray-400 hover:bg-gray-50 disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
