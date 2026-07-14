# Phase 2 — Prompt Prototype + Sample Outputs

2026-07-10. First prototype, **pre-calibration**: no few-shot examples from the team yet, so
tone is an educated guess from the account's own voice (informeel NL, spreektaal, emoji-licht).
Purpose: concrete material for the stakeholder to react to ("which would you ship?").

## Draft prompt template (v0)

```
Je schrijft advertentieteksten voor Bakje Geluk (NL, informeel, warm, spreektaal —
zelfde toon als de IG-posts van het account).

Origineel bericht ({category}):
"""{overlay_text of caption}"""

Product: {product}
Promotype: {promo_type}

Opdracht:
1. Schrijf {n} HOOKS: korte openingszinnen (max 12 woorden) die de scroll stoppen.
   Gebruik het gevoel/de insight van het originele bericht, geen letterlijke kopie.
2. Schrijf daarna de ADVERTENTIETEKST bij hook #1: 3–5 korte zinnen + call-to-action.

Regels per categorie:
- recipe → nieuwsgierigheid + gemak ("zo simpel is het")
- testimonial → social proof, echte woorden laten spreken
- lifestyle → herkenbaarheid, "dit ben jij ook"
- promo/product → concreet voordeel + urgentie, niet schreeuwerig
```

## Sample outputs (3 real stories uit de library)

### 1. Bananenbrood-story (recipe, 2026-07-11)
Origineel: "Ik bak elke week een bananenbrood voor mijn vriend en vries dit per plak in. …
Kost je 1 keer in de week 1 uur tijd en je profiteert er de hele week van."

Hooks:
1. Eén uur bakken, heel de week een 4-uurtje geregeld.
2. Dit bananenbrood-trucje scheelt je élke werkweek gedoe.
3. Meal preppen? Begin gewoon bij je 4-uurtje.

Copy (bij hook 1):
"Elke week 1 bananenbrood bakken, per plak invriezen, en elke ochtend een plak mee in de tas.
Zo simpel kan gezond snacken zijn. In [Boek/product] vind je recepten die je één keer maakt
en waar je dagen van profiteert. Geen streng dieet, gewoon slim. → Link in bio"

### 2. Beweeg-post (feed post, 2026-07-02)
Origineel: "Hardlopen, kracht, de fiets op, een actieve rustdag of gewoon een wandelsessie…
Ik geloof niet in 'bewegen als een verplicht lijstje afwerken'."

Hooks:
1. Bewegen is geen lijstje dat je moet afwerken.
2. Ook die rustige wandeling telt. Echt.
3. De ene dag vol gas, de andere dag rustig — allebei goed.

Copy (bij hook 1):
"De ene dag een training, de andere dag een podcast-wandeling. Allebei tellen ze, allebei zijn
ze goed. Bij Bakje Geluk geloven we in bewegen dat bij je leven past — niet andersom.
Klaar om het ook zo aan te pakken? → [CTA]"

### 3. Fiets-story (lifestyle, 2026-06-28)
Origineel: "Alle beren in mij zeiden nee toen m'n wekker ging… HUP MARIS JE NEST UIT EN NIET
ZEIKEN, GAS EROP 🔥 Tap als je dit herkent"

Hooks:
1. Alle beren zeiden nee. Ik ging toch.
2. Herken jij die wekker-discussie met jezelf ook?
3. Motivatie komt niet vanzelf — momentum wel.

Copy (bij hook 2):
"Die interne discussie om half 7 kennen we allemaal. Het geheim is niet meer discipline, maar
een plan dat zo makkelijk is dat de beren niks te zeggen hebben. Dat is precies wat
[product] je geeft. → [CTA]"

## Notes / to calibrate with stakeholder

- Product-koppeling is nu gegokt (stories hebben nog geen product-label in triage) — echte
  triage-data maakt dit beter.
- CTA-vorm en link-conventie onbekend → placeholders.
- Tone check nodig: te soft? te salesy? emoji meer/minder?
- Hook-lengte (12 woorden) is een aanname.
