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

// A generation source: our own story/post, or a competitor ad from Inspiratie.
export type SourceRef = { kind: "story" | "competitor"; id: string };

async function sourceText(ref: SourceRef): Promise<string> {
  const supabase = await requireUser();
  if (ref.kind === "story") {
    const { data, error } = await supabase
      .from("stories")
      .select("overlay_text, caption, category")
      .eq("story_id", ref.id)
      .single();
    if (error) throw new Error(error.message);
    const text = data.caption ?? data.overlay_text;
    if (!text) throw new Error("Deze story heeft geen tekst (OCR/caption leeg) — genereren zonder bron werkt niet goed.");
    return `Bron (${data.category ?? "onbekend"}):\n"""${text}"""`;
  }
  const { data, error } = await supabase
    .from("competitor_ads")
    .select("page_name, headline, primary_text")
    .eq("id", ref.id)
    .single();
  if (error) throw new Error(error.message);
  const text = [data.headline, data.primary_text].filter(Boolean).join("\n\n");
  if (!text) throw new Error("Deze advertentie heeft geen tekst om als inspiratie te gebruiken.");
  return `Bron: een advertentie van een ANDER merk (${data.page_name ?? "onbekend"}) — ALLEEN ter inspiratie:\n"""${text}"""\n\nBELANGRIJK: dit is concurrent-materiaal. Kopieer geen zinnen, claims of cijfers letterlijk en noem het andere merk of hun product nergens. Extraheer wat de advertentie sterk maakt (de invalshoek, de structuur, de emotionele trigger) en vertaal dat volledig naar Bakje Geluk: Mariska's stem, onze methode, onze producten. Claims over verkoopcijfers of reviews van het andere merk mag je NIET overnemen of vertalen.`;
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
  source: SourceRef;
  product: string;
  promoType: string;
  awarenessLevel: AwarenessLevel;
}): Promise<GeneratedHook[]> {
  const source = await sourceText(input.source);
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
  source: SourceRef;
  hook: string;
  formule: string | null;
  adCopy1: string;
  adCopy2: string;
  awarenessLevel: AwarenessLevel;
  product: string;
  promoType: string;
  assignedTo: string | null;
  flags: string[];
}): Promise<{ id: string; adCode: string }> {
  const supabase = await requireUser();
  const { productUrl, monthToken, adCode } = await import("@/lib/generation/config");

  // AD code = {PROMO}-B{batch}-{MONTH}{YY}, batch auto-increments per promo type
  // per month (Dennis Loom). Find the current max batch for this promo+month.
  const month = monthToken();
  const { data: last } = await supabase
    .from("generated_hooks")
    .select("batch")
    .eq("promo_type", input.promoType)
    .eq("ad_month", month)
    .order("batch", { ascending: false })
    .limit(1)
    .maybeSingle();
  const batch = ((last?.batch as number | null) ?? 0) + 1;
  const code = adCode(input.promoType, batch, month);

  const { data, error } = await supabase
    .from("generated_hooks")
    .insert({
      story_id: input.source.kind === "story" ? input.source.id : null,
      competitor_ad_id: input.source.kind === "competitor" ? input.source.id : null,
      hook_title: input.hook,
      formule: input.formule,
      ad_copy_1: input.adCopy1,
      ad_copy_2: input.adCopy2,
      awareness_level: input.awarenessLevel,
      product: input.product,
      promo_type: input.promoType,
      assigned_to: input.assignedTo,
      ad_code: code,
      batch,
      ad_month: month,
      button: buttonFor(input.awarenessLevel),
      link: productUrl(input.product),
      scan_flags: input.flags,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, adCode: code };
}

export async function generateAdCopy(input: {
  source: SourceRef;
  product: string;
  promoType: string;
  awarenessLevel: AwarenessLevel;
  hook: string;
}): Promise<GeneratedCopy[]> {
  const source = await sourceText(input.source);
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
        content: `${source}\n\nProduct: ${input.product}\nPromo Type: ${input.promoType}\nAwareness Level: ${input.awarenessLevel}\nGekozen hook: "${input.hook}"\n\nSchrijf 2 ad copy varianten (Ad Copy 1 en Ad Copy 2) bij deze hook volgens de spec: elk 250–350 tekens, 3-blokken-structuur, elk een andere invalshoek, copy-variant passend bij dit awareness level, exact 1 emoji aan het eind.\n\nCTA-regel: gebruik NOOIT "Ontdek hoe het wél kan" of een variant met "Ontdek…" als call-to-action — dit is een AI-tell (blok 03). De twee varianten moeten elk een ANDERE, concrete CTA hebben die past bij het awareness level (bijv. een directe uitnodiging, een vraag, of een actie zoals "Bekijk [product]", "Start vandaag", "Doe de challenge mee"). Varieer bewust; herhaal geen CTA-frase.`,
      },
    ],
  });

  const data = extractJson(response) as { ad_copy: { variant: string; tekst: string }[] };
  return data.ad_copy.slice(0, 2).map((c) => {
    const { text, flags } = scanText(c.tekst, "copy");
    return { variant: c.variant, tekst: text, flags };
  });
}
