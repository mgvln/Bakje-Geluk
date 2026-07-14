"use client";

import { useState, useTransition } from "react";
import {
  generateHooks,
  generateAdCopy,
  saveGeneration,
  type GeneratedHook,
  type GeneratedCopy,
} from "@/app/generate";
import type { AwarenessLevel } from "@/lib/generation/config";
import type { Story } from "@/lib/types";

// Phase 2 generation flow for one story:
// 1. Generate 3 hooks → team picks one (or regenerates)
// 2. Generate 2 copy variants for the chosen hook → editable
// 3. Save to generated_hooks (Notion write path comes later)
export default function GeneratePanel({
  story,
  promoType,
  awarenessLevel,
  onClose,
}: {
  story: Story;
  promoType: string;
  awarenessLevel: AwarenessLevel;
  onClose: () => void;
}) {
  const [hooks, setHooks] = useState<GeneratedHook[] | null>(null);
  const [chosen, setChosen] = useState<GeneratedHook | null>(null);
  const [copies, setCopies] = useState<GeneratedCopy[] | null>(null);
  const [copy1, setCopy1] = useState("");
  const [copy2, setCopy2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const base = {
    storyId: story.story_id,
    product: story.product ?? "ALLES",
    promoType,
    awarenessLevel,
  };

  function runHooks() {
    setMsg(null);
    setChosen(null);
    setCopies(null);
    start(async () => {
      try {
        setHooks(await generateHooks(base));
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Genereren mislukt.");
      }
    });
  }

  function runCopy(hook: GeneratedHook) {
    setChosen(hook);
    setCopies(null);
    setMsg(null);
    start(async () => {
      try {
        const result = await generateAdCopy({ ...base, hook: hook.hook });
        setCopies(result);
        setCopy1(result[0]?.tekst ?? "");
        setCopy2(result[1]?.tekst ?? "");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Copy genereren mislukt.");
      }
    });
  }

  function save() {
    if (!chosen) return;
    start(async () => {
      try {
        const allFlags = [
          ...chosen.flags,
          ...(copies?.flatMap((c) => c.flags) ?? []),
        ];
        await saveGeneration({
          storyId: story.story_id,
          hook: chosen.hook,
          formule: chosen.formule,
          adCopy1: copy1,
          adCopy2: copy2,
          awarenessLevel,
          product: base.product,
          promoType,
          flags: allFlags,
        });
        setMsg("Opgeslagen ✅");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Opslaan mislukt.");
      }
    });
  }

  const sourceText = story.caption ?? story.overlay_text;

  return (
    <div className="mb-4 rounded-xl border border-gray-300 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            ✨ Genereer ad — @{story.username ?? "unknown"}
          </h3>
          <p className="text-xs text-gray-500">
            {base.product} · {promoType} · {awarenessLevel} · button: {chosen?.button ?? "—"}
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">✕ sluiten</button>
      </div>

      {sourceText ? (
        <p className="mb-3 line-clamp-2 text-xs italic text-gray-500">Bron: {sourceText}</p>
      ) : (
        <p className="mb-3 text-xs text-red-600">Deze story heeft geen tekst — genereren werkt hier niet goed.</p>
      )}

      {!hooks && (
        <button
          onClick={runHooks}
          disabled={pending || !sourceText}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Genereren…" : "Genereer 3 hooks"}
        </button>
      )}

      {hooks && (
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-3">
            <p className="text-xs font-medium text-gray-700">Kies een hook:</p>
            <button onClick={runHooks} disabled={pending} className="text-xs text-blue-700 hover:underline disabled:opacity-50">
              ↻ opnieuw
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {hooks.map((h, i) => (
              <button
                key={i}
                onClick={() => runCopy(h)}
                disabled={pending}
                className={`rounded-lg border px-3 py-2 text-left text-sm text-gray-900 hover:border-gray-900 ${
                  chosen?.hook === h.hook ? "border-gray-900 bg-gray-50" : "border-gray-200"
                }`}
              >
                “{h.hook}”
                <span className="ml-2 text-xs text-gray-400">{h.formule} · {h.hook.length} tekens</span>
                {h.flags.length > 0 && (
                  <span className="ml-2 text-xs text-amber-600">⚠ {h.flags.join(" · ")}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {chosen && !copies && pending && (
        <p className="text-sm text-gray-500">Copy genereren…</p>
      )}

      {copies && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Ad Copy 1", value: copy1, set: setCopy1, flags: copies[0]?.flags ?? [] },
            { label: "Ad Copy 2", value: copy2, set: setCopy2, flags: copies[1]?.flags ?? [] },
          ].map((c) => (
            <div key={c.label}>
              <p className="mb-1 text-xs font-medium text-gray-700">
                {c.label} <span className="text-gray-400">({c.value.length} tekens)</span>
              </p>
              <textarea
                value={c.value}
                onChange={(e) => c.set(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {c.flags.length > 0 && (
                <p className="text-xs text-amber-600">⚠ {c.flags.join(" · ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {copies && (
        <button
          onClick={save}
          disabled={pending || !copy1}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Opslaan…" : "Opslaan"}
        </button>
      )}

      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
