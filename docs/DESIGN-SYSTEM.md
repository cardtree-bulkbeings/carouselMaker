# Carousel design system

The rules every carousel follows, for all 3 handles and all 12 formats. Built from two sources:
the **Human Motivation Instagram study** (Consensus, 31 pp.) and **21 reference posts** from 8 accounts
(`refrences/`, analysed in `docs/CAROUSEL-BRIEF.md`).

How the pieces fit:

```
brand kit (brands/<id>/brand.yaml)     → tokens, fonts, colours, imagery rules, colour presets
  └─ design language (engine/skins/*)  → bold · calm · studio  (how a brand *looks*)
layouts (engine/layouts.js)            → 20 slide types (cover, step, item, quiz, cta …)
visuals (engine/visuals.js)            → the picture half: UI kits, screenshots, rows, flows …
formats (formats/F01–F12.yaml)         → a recipe: which layouts, in which order, with which rules
post (posts/<handle>/*.yaml)           → one carousel = brand + format + copy + images
```

---

## 1. Research → rules (and where each rule lives)

| Research finding | Rule | Built into |
|---|---|---|
| People scroll to escape boredom/stress; they want **quick reward**, not information alone | Every post does one job: **help me · show me · let me signal who I am** | format `job:` |
| Information + affect (personality, story) beats information alone | A face, a character or a real moment in every post | imagery rules per handle |
| Stop triggers: **face with direct gaze, high contrast, clear early text**, product salience | Cover = 3–8 word promise on clean ground + face/avatar + the product | cover layout, checklist |
| Large central text over busy images *lowers* engagement | Cover text never sits on the photo; photo sits below/behind | cover layout |
| **Early brand appearance lowers engagement** | No logo on the cover; brand shows in the chrome from slide 2 and in the CTA | engine (cover has no mark) |
| Carousel's native action is the **next swipe**: curiosity + control + low load | Counter on every slide, "Next: …" teaser, one idea per slide | chrome, `next` teaser |
| Slide 1 = a **promise** (claim, contrast, checklist, mistake/result), not a topic label | Cover headline formula (§6) | checklist |
| Each slide reveals **part** of the answer; connected narrative units | Middle slides repeat one template; steps/items numbered | layouts |
| **5–8 slides** safest; longer only if every slide pays | Target 7–9 (refs run 9–11) | checklist |
| Visual informativeness helps; cognitive burden hurts | Real UI (chat, Claude, n8n, Sheets) over decoration; ≤ ~45 words per slide | UI kits, checklist |
| Positive high-arousal (awe, excitement, amusement) spreads; overload backfires | One accent colour, one emphasis per headline, no hype words | skins, checklist |
| Story needs **surprise, plot, characters** | Felt agents as recurring characters (Company, Founder agent posts) | `mascot` + `says` |
| End with a **light CTA**: question, save cue or keyword; hard sell lowers likes | CTA styles: comment · question · save | `cta` layout |
| New creators: like/save asks often beat comment asks | Use `style: save` on early posts; comment keyword when there's a real gift | `cta` layout |
| Familiarity: followed creators get more engagement; be distinct **in a stable way** | Each handle keeps one look forever (purple cow) | brand kit + skin |
| Perceived effort builds trust; slop repels | Handwritten notes, real screenshots, specific numbers | `note`, visuals |
| Later-20s/30s want evidence and logical consequences | A proof or numbers slide in most formats | `stat`, `scorecard` |

---

## 2. What the references taught

Ranked by likes: algowinner *7 AI businesses* 10.1K · meghanify *tool stack* 6.1K · wellbeing 3.1K ·
algowinner *69 prompts* 3.0K · meghanify *AI agency* 2.8K · aiagently *WhatsApp agent* 2.3K ·
theaiagents 2.2K / 1.8K · aiagently *Hormozi clone* 1.2K + **2.6K comments** · … ·
theonlyworkshop 90–781 (most refined, least liked).

1. **Sell a wish, then the how.** Money, free, forever, "your own team". Pure tool tutorials ranked last.
2. **Cover:** headline in the top 30–40%, 2–6 words, one coloured word, a small-caps stakes line, then
   one face or one object filling the lower 55–65%.
3. **No intro slide.** Slide 2 is already a payoff: item #1, the result, or a choice.
4. **The middle repeats one template:** same title spot, same badge, same visual zone. Progress visible.
5. **One visual per slide**, ~50–60% of the height, plus 2–5 short lines. Titles are verb-first.
6. **Second-to-last = payoff** ("Here's the full system", "Final score", "The takeaway").
7. **Last = one ask:** "Want the complete guide?" → **COMMENT "WORD"** → "I'll send it to you".
8. **Two colours max.** Light ground, black type, one accent used only for the keyword/label/CTA.
9. **A recurring character** on every slide (face badge, blob, avatar).
10. **Participation** ("How many can you relate to?", A/B/C) drives comments.
11. **Hand-drawn arrows/notes** point the eye and read as human.

Measured on the 1080 px slide: headlines **85–100 px**, sub-lines **30–38 px**, labels **20–26 px**,
side margins **72–88 px**, card radius **24–32 px**. Weights 600 (calm) → 900 (heavy).

---

## 3. The three handles

| | **Founder** | **Company (The Double)** | **Agent Bro** |
|---|---|---|---|
| Who | The Double's founder, first person ("I built…") | The product's voice ("Your Double…") | The AI-agent guy. **Not** The Double |
| Design language | `bold`, after aiagently | `calm`, after theonlyworkshop + Wellbeing | `studio`, after theaiagents |
| Ground | White + soft accent glows in two corners | Off-white `#F7F6F3` | Light grey with a soft top light |
| Type | Poppins 700–800, centred; Inter body | Inter Tight 600, very tight, centred; DM Mono labels | Satoshi 900, left-aligned; Inter body |
| Accent (default) | Cobalt `#2F43F2` (title gradient → ink) | Ink + **lime marker underline** `#D4F53C` | Hot pink `#F0325A` |
| Emphasis `*word*` | accent colour | lime underline | accent colour |
| Signature | "STEP 1" tinted pill · gradient title · "Next →" pill | mono series label · "Next: … →" mono footer · captions under UI | pink gradient pill · grey caps subtitle · BUILD STACK cards · red handwriting |
| **Cover image** | **The founder's real photo** (cut-out, direct gaze) | **Felt avatar or felt scene. Never a human.** | **His real photo** (cut-out) |
| Characters inside | Felt agents allowed on agent-build posts (`mascot`, `says`, roster avatars) | Felt agents everywhere: mascot, avatars, scenes | **None.** Only his photos + tool logos |
| Colour presets | cobalt · green · red · orange · violet · ink | lime · yellow · cobalt · pink · orange (marker) | pink · green · yellow · blue · violet · orange |

Change any colour per post: `theme: green` (a preset) or `theme: { accent: "#12B76A" }`
(Company: `theme: { highlight: "#FFD60A" }`). The studio's colour dots do this for you.

---

## 4. Type scale (px on the 1080×1350 slide)

| Role | Founder (bold) | Company (calm) | Agent Bro (studio) |
|---|---|---|---|
| Cover headline | 128 / 800 | 118 / 600 | 136 / 900 |
| Slide headline (`h-xl`) | 96 / 700 | 104 / 600 | 96 / 900 |
| Step / item title (`h-lg`) | 90 / 700 gradient | 92 / 600 | 84 / 900 |
| Type-only slide headline | 112 | 112 | 112 |
| Lede / sub | 31 | 34 | 30 |
| Label / kicker | 22 bold caps | 21 mono, tracked .26em | 32 grey caps (subtitle) |
| Body in cards | 22–30 | 22–30 | 22–30 |
| Notes (handwriting) | Caveat 44 | Instrument Serif italic 40 | Caveat 46, red |

Headlines auto-shrink to fit (never below 45%). Write shorter rather than relying on it.

---

## 5. Slide anatomy

```
┌──────────────────────────────────────────────┐
│ logo (not on cover)   SERIES LABEL     02/08 │  chrome-top
│                                              │
│ STEP 1  ← pill / kicker                      │
│ Verb-first title with *one* emphasis         │  ≤ 2 lines
│ One line of lede.                            │  ≤ 2 lines
│ ┌──────────────────────────────────────────┐ │
│ │  ONE visual: UI kit / screenshot / rows  │ │  50–60% of height
│ └──────────────────────────────────────────┘ │
│                         ↙ handwritten note   │
│ @handle   [→ Next: Step 2 · Give it a voice] │  chrome-bottom
└──────────────────────────────────────────────┘
```

- **Counter** on every slide but the cover (perceived control).
- **Next teaser** is automatic before step / item / prompt / roster / Q&A slides; override with `next:`.
- **Swipe** pill on the cover; small arrow on middle slides; nothing on the last.
- **Mascot** (`mascot:` at post level, `says:` per slide): Company and Founder agent posts only.

---

## 6. Copy rules

**Cover (slide 1): a promise, not a label.** 3–8 words, one `*emphasis*`, plus a stakes `tagline`.

| Frame | Example |
|---|---|
| Result | AI receptionist for *dentists* · BOOKS PATIENTS 24/7 |
| Contrast | Chatbot vs agent vs *clone* |
| Checklist / number | 5 AI agents every startup *needs* |
| Mistake | You're using *ChatGPT* wrong |
| Identity | I turned *Chanakya* into my AI advisor |
| Question | Still think AI sounds *robotic?* |

**Slide 2: a second cover** (Instagram can re-serve the post opening on it). ≤ 12 words, standalone.
Patterns: **proof first** ("11:47 PM. A patient asks for Saturday. *Booked.*") · **pick your lane** ·
**you already have it** · **what if** · **play first** (quiz) · **stakes** · **item #1 straight away**.
Never "In this post…" / "Here's what you'll learn".

**Middle:** verb-first titles ("Connect *WhatsApp*…"), one idea per slide, ≤ ~45 words, real numbers.
**Penultimate:** payoff (the whole system, the numbers, the score, the takeaway).
**CTA:** one ask. `keyword` when you have a real gift to DM. `question` for comments. `save` for new accounts.
**Never:** revolutionary, unleash, game-changer, insane, "you won't believe", "!!".

---

## 7. Layouts (slide types)

| Layout | Use for | Key fields |
|---|---|---|
| `cover` | slide 1 | `style: person · scene · object · number · type`, kicker, headline, tagline, sub, image, logos, tag, badge, note, chips |
| `statement` | slide 2, context, proof, takeaway | kicker, headline, body, visual, note, info, `size: xl`, `align: center` |
| `step` | F02 steps | title, kicker, body, visual, note, info (auto-numbered, dots) |
| `item` | F03 list items | label, kicker, name, what, tool/icon, visual, example, tags |
| `qa` | F01 question → answer | q, persona, avatar, a |
| `prompt` | F09 prompts | label, kicker, title, tool, prompt (with `{vars}`), preview, tip |
| `versus` | F07 rounds | criterion, headline, `sides: [{label, text, verdict: good/bad/meh}]` |
| `scorecard` | F07 summary | cols, rows (true/false/text), winner, verdict |
| `quiz` | F08 guess / reveal | options [{text, is: AI/Human, why}], `reveal: true`, prompt |
| `flow` | F05 stages, F04 handoff | stage, headline, nodes [{kind: trigger/agent/action, title, sub, tool/icon}], result |
| `roster` | F04 team member | role, name, avatar, handles, tools, kpi |
| `org` | F04 team chart | top {name, image}, members [{name, role, image}] |
| `grid` | F10 mega grid | category, headline, items [{name, use, tool/icon, pick}] |
| `quote` | F01 best line | quote, by, role |
| `stat` | proof, the maths | stats [{value, label}] (last one is highlighted) |
| `recap` | save slide | items [{name, tool/icon}], flag |
| `news` | F12 | masthead, date, breaking, source, headline, tldr, visual |
| `list` | honest limits, rules | items [{title, text}] |
| `cta` | last slide | `style: comment` (keyword) · `question` (answers) · `save` |

Text markup in any field: `*emphasis*` · `**bold**` · `~~strike~~` · `{variable}` · `[[handwritten]]`.

## 8. Visuals (the picture half of a slide)

`image` (frame: plain · browser · phone · felt · bleed) · `chat` (whatsapp · imessage · instagram · call) ·
`claude` (Claude desktop) · `double` (The Double dashboard) · `n8n` (workflow canvas) · `gmail` · `sheet` ·
`notify` (lock-screen) · `rows` (icon list) · `code` (terminal) · `tools` (logo row) · `table` · `flow` ·
`cards` · `checklist` · `doc` (guide mockup) · `hub` (tool tiles → mockup → features, theaiagents style).
Any visual can take `caption:`. Tool logos come from Simple Icons by name (`claude`, `whatsapp`, `n8n`,
`gmail`, `googlesheets`, `notion` …); drop custom logos in `assets/logos/<name>.png`.

---

## 9. The 12 formats

| ID | Format | Handles | Job | Slides | Slide 2 | Ends with |
|---|---|---|---|---|---|---|
| F01 | Persona Clone | Founder, Company | show me | 8 | the best answer, first | comment CLONE |
| F02 | Step-by-Step Build | all | help me | 8 | the result working | comment keyword |
| F03 | Numbered List | all | help me | 7–8 | item #1 | recap → question (pick a number) |
| F04 | Team Roster | Founder | show me | 8 | org chart | comment TEAM |
| F05 | Automation Flow | Founder | show me | 8 | the stakes (old way) | comment SYSTEM |
| F06 | Use-Case Scenario | Company | show me | 8 | the moment (a time) | comment DOUBLE |
| F07 | Versus | Company, Agent Bro | signal | 7 | one-line definitions | question |
| F08 | Spot the AI | Company | play | 8 | round 1, unlabelled | question: your score |
| F09 | Prompt Pack | Agent Bro | help me | 7 | prompt #1 | comment PROMPTS |
| F10 | Mega Resource Grid | Agent Bro | help me | 6 | first category grid | comment keyword |
| F11 | Hot Take | Agent Bro | signal | 8 | what everyone believes | question: agree? |
| F12 | News Drop | Agent Bro | show me | 7 | TL;DR | question / follow |

Each `formats/F*.yaml` file holds the full slide-by-slide structure, rules, and a working scaffold.

---

## 10. Working

- **Studio:** `npm run studio` → http://localhost:4321. Pick a post, edit text in place (double-click),
  drag/zoom/replace images, pick a colour, read the checklist, **⬇ Download all** for a zip.
- **CLI export:** `npm run export -- posts/founder/x.yaml` or `npm run export -- --all` → `out/…/01.png`.
- **With Claude:** see `CLAUDE.md`. "Build Day 3 for all handles" → Claude reads the plan, picks formats,
  writes the YAML, exports and reviews.
- **Images to make:** `docs/ASSETS.md`.
