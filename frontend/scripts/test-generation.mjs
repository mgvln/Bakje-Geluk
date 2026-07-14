// End-to-end test of the Phase 2 generation calls (hooks + copy) against the
// real assembled system prompt and a real story. Run: node scripts/test-generation.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = dirname(fileURLToPath(import.meta.url));
// Load ANTHROPIC_API_KEY from .env.local
for (const line of readFileSync(join(here, "..", ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
  if (m) process.env.ANTHROPIC_API_KEY = m[1].trim();
}

const promptTs = readFileSync(join(here, "..", "src", "lib", "generation", "systemPrompt.ts"), "utf8");
const SYSTEM = JSON.parse(promptTs.match(/GENERATION_SYSTEM_PROMPT = (".*");/s)[1]);

const client = new Anthropic();
const system = [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }];

const source = `Bron (recipe):\n"""Ik bak elke week een bananenbrood voor mijn vriend en vries dit per plak in. Hij haalt elke avond een plak uit de vriezer, legt deze in de koelkast en gooit 'm 's morgens in z'n tas om te eten als 4 uurtje.\n\nKost je 1 keer in de week 1 uur tijd en je profiteert er de hele week van."""`;
const ctx = "Product: Boek 6\nPromo Type: STATIC-ADS\nAwareness Level: Solution Aware";

const hooksResp = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 2048,
  system,
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: { hook: { type: "string" }, formule: { type: "string" } },
              required: ["hook", "formule"],
              additionalProperties: false,
            },
          },
        },
        required: ["hooks"],
        additionalProperties: false,
      },
    },
  },
  messages: [{ role: "user", content: `${source}\n\n${ctx}\n\nGenereer 3 hooks volgens de spec (max 40 tekens, sweet spot 27–35, minstens 2 verschillende formules, formules passend bij dit awareness level).` }],
});

if (hooksResp.stop_reason === "refusal") throw new Error("refusal on hooks");
const hooks = JSON.parse(hooksResp.content.find((b) => b.type === "text").text).hooks;
console.log("HOOKS:");
for (const h of hooks) console.log(`  [${h.hook.length}ch] ${h.formule}: "${h.hook}"`);
console.log("cache:", hooksResp.usage.cache_creation_input_tokens, "written /", hooksResp.usage.cache_read_input_tokens, "read");

const copyResp = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 3000,
  system,
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          ad_copy: {
            type: "array",
            items: {
              type: "object",
              properties: { variant: { type: "string" }, tekst: { type: "string" } },
              required: ["variant", "tekst"],
              additionalProperties: false,
            },
          },
        },
        required: ["ad_copy"],
        additionalProperties: false,
      },
    },
  },
  messages: [{ role: "user", content: `${source}\n\n${ctx}\nGekozen hook: "${hooks[0].hook}"\n\nSchrijf 2 ad copy varianten (Ad Copy 1 en Ad Copy 2) bij deze hook volgens de spec: elk 250–350 tekens, 3-blokken-structuur, elk een andere invalshoek, copy-variant passend bij dit awareness level, exact 1 emoji aan het eind.` }],
});

if (copyResp.stop_reason === "refusal") throw new Error("refusal on copy");
const copies = JSON.parse(copyResp.content.find((b) => b.type === "text").text).ad_copy;
console.log("\nAD COPY:");
for (const c of copies) console.log(`\n[${c.variant}] (${c.tekst.length}ch)\n${c.tekst}`);
console.log("\ncache:", copyResp.usage.cache_creation_input_tokens, "written /", copyResp.usage.cache_read_input_tokens, "read");
