"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { GENERATION_SYSTEM_PROMPT } from "@/lib/generation/systemPrompt";
import { scanText } from "@/lib/generation/scan";
import { buttonFor, type AwarenessLevel } from "@/lib/generation/config";

// Phase 2: hook + copy generation (Dennis's blocks 00–08 as system prompt,
// SCAN checklist from block 03 applied post-generation).

export type GeneratedHook = {
  hook: string;
  formule: string;
  button: "Meer informatie" | "Nu winkelen";
  flags: string[];
};

export type GeneratedCopy = {
  variant: string;
  tekst: string;
  flags: string[];
};

const MODEL = "claude-opus-4-8";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

async function storySource(storyId: string): Promise<string> {
  const supabase = await requireUser();
  const { data, error } = await supabase
    .from("stories")
    .select("overlay_text, caption, category")
    .eq("story_id", storyId)
    .single();
  if (error) throw new Error(error.message);
  const text = data.caption ?? data.overlay_text;
  if (!text) throw new Error("Deze story heeft geen tekst (OCR/caption leeg) — genereren zonder bron werkt niet goed.");
  return `Bron (${data.category ?? "onbekend"}):\n"""${text}"""`;
}

function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  return new Anthropic();
}

function extractJson(response: Anthropic.Message): unknown {
  if (response.stop_reason === "refusal") {
    throw new Error("Generatie geweigerd door het model — probeer opnieuw of pas de bron aan.");
  }
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Lege response van het model.");
  return JSON.parse(block.text);
}

const system = [
  {
    type: "text" as const,
    text: GENERATION_SYSTEM_PROMPT,
    cache_control: { type: "ephemeral" as const },
  },
];

export async function generateHooks(input: {
  storyId: string;
  product: string;
  promoType: string;
  awarenessLevel: AwarenessLevel;
}): Promise<GeneratedHook[]> {
  const source = await storySource(input.storyId);
  const client = anthropic();

  const response = await client.messages.create({
    model: MODEL,
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
                properties: {
                  hook: { type: "string" },
                  formule: { type: "string" },
                },
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
    messages: [
      {
        role: "user",
        content: `${source}\n\nProduct: ${input.product}\nPromo Type: ${input.promoType}\nAwareness Level: ${input.awarenessLevel}\n\nGenereer 3 hooks volgens de spec (max 40 tekens, sweet spot 27–35, minstens 2 verschillende formules, formules passend bij dit awareness level).`,
      },
    ],
  });

  const data = extractJson(response) as { hooks: { hook: string; formule: string }[] };
  return data.hooks.slice(0, 5).map((h) => {
    const { text, flags } = scanText(h.hook, "hook");
    return { hook: text, formule: h.formule, button: buttonFor(input.awarenessLevel), flags };
  });
}

// Persist a finished generation (chosen hook + edited copy) to generated_hooks.
// Field names mirror the Notion 🪩 Hooks DB so the Notion write path can be
// switched on later without a schema change.
export async function saveGeneration(input: {
  storyId: string;
  hook: string;
  formule: string | null;
  adCopy1: string;
  adCopy2: string;
  awarenessLevel: AwarenessLevel;
  product: string;
  promoType: string;
  flags: string[];
}): Promise<string> {
  const supabase = await requireUser();
  const { productUrl } = await import("@/lib/generation/config");
  const { data, error } = await supabase
    .from("generated_hooks")
    .insert({
      story_id: input.storyId,
      hook_title: input.hook,
      formule: input.formule,
      ad_copy_1: input.adCopy1,
      ad_copy_2: input.adCopy2,
      awareness_level: input.awarenessLevel,
      product: input.product,
      promo_type: input.promoType,
      button: buttonFor(input.awarenessLevel),
      link: productUrl(input.product),
      scan_flags: input.flags,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function generateAdCopy(input: {
  storyId: string;
  product: string;
  promoType: string;
  awarenessLevel: AwarenessLevel;
  hook: string;
}): Promise<GeneratedCopy[]> {
  const source = await storySource(input.storyId);
  const client = anthropic();

  const response = await client.messages.create({
    model: MODEL,
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
                properties: {
                  variant: { type: "string" },
                  tekst: { type: "string" },
                },
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
    messages: [
      {
        role: "user",
        content: `${source}\n\nProduct: ${input.product}\nPromo Type: ${input.promoType}\nAwareness Level: ${input.awarenessLevel}\nGekozen hook: "${input.hook}"\n\nSchrijf 2 ad copy varianten (Ad Copy 1 en Ad Copy 2) bij deze hook volgens de spec: elk 250–350 tekens, 3-blokken-structuur, elk een andere invalshoek, copy-variant passend bij dit awareness level, exact 1 emoji aan het eind.`,
      },
    ],
  });

  const data = extractJson(response) as { ad_copy: { variant: string; tekst: string }[] };
  return data.ad_copy.slice(0, 2).map((c) => {
    const { text, flags } = scanText(c.tekst, "copy");
    return { variant: c.variant, tekst: text, flags };
  });
}
