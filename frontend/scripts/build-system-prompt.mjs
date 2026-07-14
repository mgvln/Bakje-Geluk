// Assembles Dennis's generation blocks (phase2-input/miguel-phase2/00–08) into
// src/lib/generation/systemPrompt.ts. Block 09 is the Notion mapping layer and is
// applied in code, not in the prompt. Re-run after Dennis refreshes the bundle:
//   node scripts/build-system-prompt.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const blocksDir = join(here, "..", "..", "phase2-input", "miguel-phase2");

const files = [
  "00-system-prompt.md",
  "01-generation-spec.md",
  "02-tone-of-voice.md",
  "03-anti-ai-guardrails.md",
  "04-hook-formules.md",
  "05-copy-varianten.md",
  "06-awareness-levels.md",
  "07-doelgroep-taal.md",
  "08-brand-overview.md",
];

// Strip the English "For Miguel" framing notes (blockquote right after the H1) —
// they're for the integrator, not the model.
function stripFramingNote(md) {
  return md.replace(/^(# .+\n\n)>[\s\S]*?\n\n---\n/m, "$1");
}

const assembled = files
  .map((f) => stripFramingNote(readFileSync(join(blocksDir, f), "utf8")).trim())
  .join("\n\n---\n\n");

const out = `// GENERATED FILE — do not edit by hand.
// Source: phase2-input/miguel-phase2/ (Dennis's generation bundle).
// Regenerate with: node scripts/build-system-prompt.mjs

export const GENERATION_SYSTEM_PROMPT = ${JSON.stringify(assembled)};
`;

const outPath = join(here, "..", "src", "lib", "generation", "systemPrompt.ts");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (${assembled.length} chars)`);
