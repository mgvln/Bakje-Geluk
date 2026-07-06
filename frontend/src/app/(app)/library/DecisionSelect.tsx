"use client";

import { useTransition } from "react";
import { labelStory } from "@/app/actions";
import { DECISION_LABELS, type Story, type Decision } from "@/lib/types";

// Lets you change a story's status from the Library (e.g. Build now → Rejected).
export default function DecisionSelect({ story }: { story: Story }) {
  const [pending, startTransition] = useTransition();

  function change(value: string) {
    const decision = (value || null) as Decision | null;
    startTransition(() => labelStory(story.story_id, { decision }));
  }

  return (
    <select
      value={story.decision ?? ""}
      onChange={(e) => change(e.target.value)}
      disabled={pending}
      className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-900 disabled:opacity-50"
    >
      <option value="">Untriaged</option>
      {(Object.keys(DECISION_LABELS) as Decision[]).map((d) => (
        <option key={d} value={d}>{DECISION_LABELS[d]}</option>
      ))}
    </select>
  );
}
