"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PRODUCTS, DECISION_LABELS } from "@/lib/types";

export default function LibraryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectCls =
    "rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900";

  return (
    <div className="flex flex-wrap gap-2">
      <select value={sp.get("view") ?? ""} onChange={(e) => set("view", e.target.value)} className={selectCls}>
        <option value="">All</option>
        <option value="raw">Raw (untriaged)</option>
        <option value="filtered">Filtered</option>
      </select>

      <select value={sp.get("content") ?? ""} onChange={(e) => set("content", e.target.value)} className={selectCls}>
        <option value="">Stories &amp; posts</option>
        <option value="story">Stories</option>
        <option value="post">Posts</option>
      </select>

      <select value={sp.get("decision") ?? ""} onChange={(e) => set("decision", e.target.value)} className={selectCls}>
        <option value="">Any decision</option>
        {Object.entries(DECISION_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select value={sp.get("product") ?? ""} onChange={(e) => set("product", e.target.value)} className={selectCls}>
        <option value="">Any product</option>
        {PRODUCTS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select value={sp.get("exported") ?? ""} onChange={(e) => set("exported", e.target.value)} className={selectCls}>
        <option value="">Notion: any</option>
        <option value="yes">Exported</option>
        <option value="no">Not exported</option>
      </select>
    </div>
  );
}
