// Calibration round 1: generate hooks + copy for 5 real stories across all 5
// awareness levels, through the same prompt/spec as production. Output:
// ../CALIBRATION_ROUND_1.md for Dennis to react to.
// Run: node scripts/calibration-round.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(here, "..", ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
  if (m) process.env.ANTHROPIC_API_KEY = m[1].trim();
}
const promptTs = readFileSync(join(here, "..", "src", "lib", "generation", "systemPrompt.ts"), "utf8");
const SYSTEM = JSON.parse(promptTs.match(/GENERATION_SYSTEM_PROMPT = (".*");/s)[1]);
const client = new Anthropic();
const system = [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }];

const SUPABASE = "https://uagvazsyjjulsiinvuot.supabase.co/rest/v1";
const KEY = readFileSync(join(here, "..", ".env.local"), "utf8").match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

// story_id → concept frame (spread across all 5 awareness levels)
const BATCH = [
  { id: "3941000086441460531_33760134348", product: "Boek 1", promo: "INSTA-ADS", level: "Unaware" },
  { id: "3940473126527371317_33760134348", product: "Boek 6", promo: "RDB-ADS", level: "Problem Aware" },
  { id: "3939484270369780798_33760134348", product: "Boek 2", promo: "STATIC-ADS", level: "Solution Aware" },
  { id: "3938744721402436706_33760134348", product: "Boek 6", promo: "STATIC-ADS", level: "Product Aware" },
  { id: "3932222259529312079", product: "ALLES", promo: "COM-ADS", level: "Most Aware" },
];

const hookSchema = {
  type: "object",
  properties: { hooks: { type: "array", items: { type: "object", properties: { hook: { type: "string" }, formule: { type: "string" } }, required: ["hook", "formule"], additionalProperties: false } } },
  required: ["hooks"],
  additionalProperties: false,
};
const copySchema = {
  type: "object",
  properties: { ad_copy: { type: "array", items: { type: "object", properties: { variant: { type: "string" }, tekst: { type: "string" } }, required: ["variant", "tekst"], additionalProperties: false } } },
  required: ["ad_copy"],
  additionalProperties: false,
};

async function fetchStory(id) {
  const r = await fetch(`${SUPABASE}/stories?story_id=eq.${id}&select=overlay_text,caption,category,content_type`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return (await r.json())[0];
}

async function gen(schema, userMsg, maxTokens) {
  const resp = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: maxTokens,
    system,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: userMsg }],
  });
  if (resp.stop_reason === "refusal") throw new Error("refusal");
  return JSON.parse(resp.content.find((b) => b.type === "text").text);
}

let md = `# Calibratie ronde 1 — ${BATCH.length} concepten, alle 5 awareness levels\n\nGegenereerd door de tool (zelfde prompt als productie). Per concept: 3 hooks + 2 copy varianten bij hook #1.\n\n**Vraag aan Dennis:** welke zou je zo inzetten, welke niet, en wat is er mis met de afvallers?\n\n`;

for (const b of BATCH) {
  const s = await fetchStory(b.id);
  const text = s.caption ?? s.overlay_text;
  const source = `Bron (${s.category ?? s.content_type ?? "onbekend"}):\n"""${text}"""`;
  const ctx = `Product: ${b.product}\nPromo Type: ${b.promo}\nAwareness Level: ${b.level}`;
  console.log(`Generating: ${b.level} / ${b.product}...`);

  const { hooks } = await gen(hookSchema, `${source}\n\n${ctx}\n\nGenereer 3 hooks volgens de spec (max 40 tekens, sweet spot 27–35, minstens 2 verschillende formules, formules passend bij dit awareness level).`, 2048);
  const { ad_copy } = await gen(copySchema, `${source}\n\n${ctx}\nGekozen hook: "${hooks[0].hook}"\n\nSchrijf 2 ad copy varianten (Ad Copy 1 en Ad Copy 2) bij deze hook volgens de spec: elk 250–350 tekens, 3-blokken-structuur, elk een andere invalshoek, copy-variant passend bij dit awareness level, exact 1 emoji aan het eind.`, 3000);

  md += `---\n\n## ${b.level} · ${b.product} · ${b.promo}\n\n**Bron:** _${text.replace(/\n+/g, " ").slice(0, 180)}${text.length > 180 ? "…" : ""}_\n\n**Hooks:**\n`;
  hooks.forEach((h, i) => { md += `${i + 1}. "${h.hook}" _(${h.formule}, ${h.hook.length} tekens)_\n`; });
  md += `\n**Ad copy (bij hook 1):**\n`;
  for (const c of ad_copy) md += `\n**${c.variant}** (${c.tekst.length} tekens)\n> ${c.tekst.replace(/\n/g, "\n> ")}\n`;
  md += "\n";
}

const out = join(here, "..", "..", "CALIBRATION_ROUND_1.md");
writeFileSync(out, md);
console.log(`\nWrote ${out}`);
