// SCAN checklist from Dennis's block 03 (anti-AI guardrails).
// Hard rules are auto-fixed silently; soft rules are returned as flags for the
// human reviewer — never auto-removed, because half the "AI hype words" are
// Mariska's authentic voice (next level, mega, ...).

export type ScanResult = {
  text: string; // hard-fixed text
  flags: string[]; // soft-rule warnings for the reviewer
};

const AI_TELLS = [
  "ontdek",
  "maak kennis met",
  "laat je verrassen",
  "zeg vaarwel tegen",
  "in de wereld van",
  "het draait allemaal om",
  "als het gaat om",
  "laten we eerlijk zijn",
  "naadloos",
  "moeiteloos",
  "ultieme",
  "game-changer",
  "revolutionair",
  "baanbrekend",
];

const STITCHERS = ["bovendien", "daarnaast", "kortom", "al met al", "tot slot"];

const SEASONS_YEARS = /\b(20\d\d|zomer|winter|lente|herfst|kerst|bikini\s?body)\b/i;

const EMOJI = /\p{Extended_Pictographic}/gu;

function hardFix(input: string): string {
  let t = input;
  // 1. Em/en-dashes and " - " sentence separators → comma (compound hyphens stay).
  t = t.replace(/\s*[—–]\s*/g, ", ");
  t = t.replace(/(\S)\s-\s(\S)/g, "$1, $2");
  // 2. Vocab: dag X lowercase (except at sentence start), Vipper/VIP → Vip.
  t = t.replace(/([^.!?\n]\s)Dag (\d)/g, "$1dag $2");
  t = t.replace(/\bVipper\b/g, "Vip");
  t = t.replace(/\bVIP\b/g, "Vip");
  return t;
}

export function scanText(
  input: string,
  kind: "hook" | "copy",
): ScanResult {
  const text = hardFix(input);
  const flags: string[] = [];
  const lower = text.toLowerCase();

  // 3. Facts: Mariska has no gezin/kinderen in ik-vorm.
  if (/\bmijn (gezin|kinderen|kids)\b|\bgezinsleven door\b/i.test(text)) {
    flags.push('Feiten: "mijn gezin/kinderen" — Mariska heeft geen gezin (herschrijf naar jij-vorm)');
  }
  // No years/seasons (ads run year-round) or health-claim red flags.
  const sy = text.match(SEASONS_YEARS);
  if (sy) flags.push(`Seizoen/jaartal "${sy[0]}" — ads draaien het hele jaar`);

  // 4. AI-tell words (soft).
  for (const tell of AI_TELLS) {
    if (lower.includes(tell)) flags.push(`AI-tell: "${tell}"`);
  }
  // 5. Connective stitchers (soft).
  for (const s of STITCHERS) {
    if (new RegExp(`\\b${s}\\b`, "i").test(text)) flags.push(`Stitcher: "${s}"`);
  }

  // Format checks (from block 01).
  if (kind === "hook") {
    if (text.length > 40) flags.push(`Hook is ${text.length} tekens (max 40)`);
    if (EMOJI.test(text)) flags.push("Hook bevat emoji (hoort niet)");
  } else {
    const emojiCount = (text.match(EMOJI) ?? []).length;
    if (emojiCount !== 1) flags.push(`Copy heeft ${emojiCount} emoji (moet exact 1, aan het eind)`);
    if (text.length < 200) flags.push(`Copy is ${text.length} tekens (te dun, doel 250–350)`);
    if (text.length > 380) flags.push(`Copy is ${text.length} tekens (doel 250–350)`);
  }

  return { text, flags };
}
