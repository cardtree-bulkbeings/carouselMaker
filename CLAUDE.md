# Carousel Maker: how to build carousels

This folder is a carousel factory. A carousel is one YAML file in `posts/<handle>/`; the engine
renders it into 1080×1350 PNGs. Read `docs/DESIGN-SYSTEM.md` before writing posts.

## When asked to "build a carousel" / "build Day N" / "build these 10"

1. **Find the post in the plan.** `../contentplan.xlsx` (sheets Founder / Company / AgentBro: day →
   title) and `../Carousel_Design_Formats.xlsx` → *Calendar Mapping* (handle, day, title → format ID).
   Read them with openpyxl (`python`), UTF-8 output. Skip "🎬 Video" slots. ★ = collab: one post in
   the Founder brand, mention the company.
2. **Pick the format** from the mapping (F01–F12). Read `formats/F<id>-*.yaml`: its structure, rules
   and scaffold.
3. **Create the post** by copying the scaffold (everything after `# ---- scaffold ----`) into
   `posts/<founder|company|agentbro>/<fid>-<slug>.yaml`. Set `brand`, `format`, `title`.
   Brand ids: `thedouble-founder`, `thedouble-company`, `agentbro`.
4. **Write the copy** to the rules in DESIGN-SYSTEM §6:
   - Cover: a promise in 3–8 words, one `*emphasis*`, a stakes `tagline`. Sell the wish, then the how.
   - Slide 2: standalone (it's a second cover), ≤ 12 words, proof / item #1 / a choice. No intro.
   - Middle: verb-first titles, one idea per slide, ≤ ~45 words, real specifics.
   - Penultimate: payoff. Last: one light ask (`keyword`, `question` or `save`).
   - 7–9 slides. No hype words, no "!!", no invented statistics presented as fact. Mark example
     numbers as examples ("example numbers" in a kicker or note) until the user supplies real ones.
5. **Images, per handle (hard rules):**
   - Founder: cover `style: person` with the founder's cut-out (`assets/people/founder/*.png`).
     Felt agents (`assets/agents/*.png`) may appear inside agent-build posts (`mascot`, `says`, roster).
   - Company: **no humans.** Felt agents, felt scenes and objects only (`assets/agents`, `image-assets`).
   - Agent Bro: **only his photos** (`assets/people/agentbro/*.png`). No mascots, no felt characters.
   - If the photo doesn't exist yet, leave `image` out; the slot shows a placeholder to fill in the studio.
   - Prefer coded UI kits (`chat`, `claude`, `double`, `n8n`, `gmail`, `sheet`, `notify`, `hub`) over
     screenshots. Real screenshots go in `image` with `frame: browser`.
6. **Export and review:** `npm run export -- posts/<handle>/<file>.yaml`. Look at the PNGs in
   `out/<handle>/<file>/` (or build a contact sheet) and fix anything that overflows, reads small or
   leaves a slide mostly empty. Then check the swipe checklist (`lint` in `engine/engine.js`; also shown
   in the studio's Checklist tab) and fix every warning.
7. Tell the user which files you created and that they can open them in the studio
   (`npm run studio` → http://localhost:4321/?post=posts/...).

## Don't

- Don't edit a post the user is working on in the studio without asking (the studio autosaves; check
  the file's modified time).
- Don't hard-code colours or fonts in a post. Use `theme:` (preset name or `{ accent: "#hex" }`).
- Don't add a logo to covers (research: early brand appearance lowers engagement).

## Map of the code

| Path | What |
|---|---|
| `server.mjs` | local server: studio, post read/write, upload, export, zip |
| `studio/` | the editor UI (`index.html`, `studio.js`, `studio.css`) and `render.html` (used for export) |
| `engine/engine.js` | brand loading, post → slides, text fitting, theme, swipe checklist |
| `engine/layouts.js` | the 20 slide layouts |
| `engine/visuals.js` | visuals + UI kits |
| `engine/slides.css`, `kits.css` | base styles; `engine/skins/{bold,calm,studio}.css` = design languages |
| `brands/<id>/brand.yaml` | tokens, fonts, colour presets, imagery rules |
| `formats/F*.yaml` | format recipes + scaffolds |
| `scripts/export.mjs` | CLI export (Playwright → PNG) |
