# Carousel Maker — design brief (study phase)

> Superseded for day-to-day use by `docs/DESIGN-SYSTEM.md` (the rules) and `CLAUDE.md` (how to build). This brief keeps the full reference analysis.

Written 2026-10-02 after studying: `contentplan.xlsx`, `Carousel_Design_Formats.xlsx`,
the 8 reference boards in `refrences/`, `image-assets/`, and the brand spec at
`V:\TheDoubleNewSite\docs\BRAND-GUIDELINES.md`.

---

## 1. What we are building and why

| | |
|---|---|
| Handles | **Founder**, **Company** (thedouble.ai), **Agent Bro** |
| Volume | 30-day plan → 135 carousels, **120 unique** (15 Founder × Company collabs) |
| Formats | 12 layouts (F01–F12). F02 Step-by-Step (40 posts) + F03 Numbered List (17) = 42% of the calendar |
| Job of every post | Stop the scroll → earn the swipe → get a **save / share / comment-keyword** → DM → thedouble.ai |
| Tool goal | No Canva. Write a post as data → get finished 1080×1350 PNGs in our design system |

---

## 2. What the research says (Human Motivation Instagram Content, Consensus, 31 pp.)

**Why people are on Instagram:** to feel something quickly, learn something lightly and stay
connected. They're escaping boredom and stress, not searching. Information alone loses.
Information **plus affect** (personality, story, emotion) wins. "AI slop" repels: people reward
content that feels authentic, useful and made with visible effort.

**Every post must do one of three jobs:** *help me* · *show me* · *let me signal who I am*.

| Stage | They leave when… | They continue when… |
|---|---|---|
| First second | generic opening, low contrast, no clear point | visual interruption: face with direct gaze, contrast, readable text, an unexpected object |
| Slide 2–3 | confusion, slow setup, weak relevance | immediate payoff, clarity, "this is about me" |
| Middle | repetition, density, irritation | each slide reveals **part** of the answer; low reading load; reader controls pace |
| End | no closure, no reward | resolved curiosity, useful takeaway, something to share or answer |

**Carousel-specific rules (cited in the study):**
1. The native action is **the next swipe**. Curiosity + perceived control + low cognitive load.
2. Slide 1 = a **promise hook**: a claim, contrast, checklist, or mistake/result frame. A concrete
   promise, **not a topic label**.
3. One core promise across the post; each slide does a different job: hook → context → develop
   → prove → apply → close. Each slide is one connected narrative unit.
4. **5–8 slides** is the safest range for infotainment. Longer only if every slide earns it.
5. Several stop triggers at once (face + contrast + text) beat one at a time, but must stay
   **coherent, not cluttered**. Large overlays on busy images reduce engagement.
6. **Positive high-arousal** emotions spread most: awe, excitement, amusement, inspiration.
   Moderate intensity. Overload and hype backfire.
7. End with a **light CTA**: a question, a save cue or a keyword. Hard selling lowers likes.
   Questions lift comments. Clickbait phrases lower reactions after the click.
8. **Proof / achievement / case-study** carousels lift likes, especially with a question at the end.
9. For a new creator: one audience, one problem, one recognisable style, **repeated**. Be
   distinct in a stable way (the "purple cow"). Trust = expertise + honesty, not polish.
   Identity posts (how I think, what we believe) sparingly, in support of usefulness.
10. Later-20s and 30s respond to **evidence and logical consequences**, not just fun.

Plus two platform mechanics (not from the study):
- **Slide 2 is a second cover.** If someone skips the post, Instagram can re-serve it opening on
  slide 2, so slide 2 must stand alone.
- **Comment-keyword CTAs** turn likes into comments and DMs (aiagently: 1.2K likes /
  **2.6K comments**).

## 3. The references, one by one

Engagement is read off the screenshots (likes / comments where visible).

### 3.1 aiagently: loud red, face cutout, "Comment build"
- **Look:** white ground, one red accent (`~#E5232B`), heavy grotesk, red-gradient glow corners.
  Cover = real person cut out (laptop / chair) + 2-line headline with one **red keyword**
  ("AI RECEPTIONIST", "Alex Harmozi") + tool logo chips (Claude ✳ + n8n + …).
- **Body:** "STEP 1" eyebrow → big 2-line red title → a white card with an **icon spine on the
  left** and rows of instruction + tiny UI snippets + code chips. Problem→Solution variant: two
  half-cards ("① Problem" red / "① Solution" green) under a hero mockup.
- **Slide 2 move:** straight into the result. *"Your Beauty Salon Run on **Autopilot**."* +
  a real n8n workflow screenshot. It proves the cover, then promises the how.
- **CTA:** giant "COMMENT "build"" in a red pill + a mock "Complete Guide" document stack.
- **Numbers:** Hormozi clone **1.2K / 2.6K**, salon 882 / 1.1K, WhatsApp 2.3K likes.
- **We take:** person-cutout cover, one accent keyword, step card with icon spine, guide-mockup
  CTA, comment keyword. **We drop:** red glow everywhere (off-brand).
- **Fits:** F01 Persona Clone (the Hormozi post *is* our "I Turned {PERSON} into…" formula),
  F02 Step-by-Step, F05 (salon "on Autopilot").

### 3.2 theaiagents: premium SaaS-mockup density
- **Look:** cool light-grey ground, logo top-left, slide number top-right, pink "AGENT #01" pill,
  grey mono subtitle, **huge black 2-line claim** ("Give it one product URL. Get a full ad
  factory."). Center = dense, real-looking product mockup (WhatsApp thread, call screen,
  pipeline), tool tiles down the left joined by dotted connectors, **handwritten arrow notes**
  ("One URL. Endless creatives."). Bottom = two info cards (BUILD STACK / OPPORTUNITY).
- **Slide 2 move:** the first item lands immediately, as a *question or promise*: *"What if your
  WhatsApp could actually sell?"*
- **Numbers:** 2.2K / 166 / 170 shares; Hermes guide 1.8K.
- **We take:** the whole F04 Team Roster / F03 agent-card anatomy, handwritten annotations,
  dotted tool connectors, BUILD STACK footer cards, the 01/09 counter.
- **Fits:** F03, F04, F05, F06 (phone mockups), F12 (Hermes = tool guide).

### 3.3 meghanify: editorial serif + yellow highlighter
- **Look:** near-white, high-contrast **condensed serif** headlines, a **yellow highlighter box**
  on one word ("industry", "audit"), soft blue / butter-yellow cards, numbered pills
  ("STEP 1 · PICK WHO PAYS"), tables with yellow price chips.
- **Slide 2 move:** frames the choice. *"Two lanes. You only need one."* Two cards (Consultant /
  Builder). The reader starts picking their lane, which is a reason to keep going.
- **Prompt pack anatomy:** "AGENT 01" pill → title → yellow **COPY THIS PROMPT** card → "EXAMPLE
  PREVIEW" mock UI below. Best prompt-card design in the set.
- **Cover:** lifestyle photo of her + giant serif number/word ("10 Agents", "Ai Automation")
  with italic word mixing. **CTA:** cute/unexpected image (kitten "Comment SEND IT"), "Tool" in
  giant serif.
- **Numbers:** 2.8K, 6.1K (Tool Stack), 2.99K (prompts).
- **We take:** highlighter on one word = our "one italic phrase" rule in social form; prompt
  card + example preview; ring-binder "notebook" for tool stacks.
- **Fits:** F09 Prompt Pack (primary), F02 roadmap variant, F10 grid, F03.

### 3.4 algowinner01: bold condensed, laptop mockups
- **Look:** white, black ultra-condensed caps, red keyword, red "01" outlined box top-left,
  "2 / 9" counter top-right. Each item = title + "Create Once. **Earn Forever.**" tagline +
  4 icon rows + big 3D laptop showing the real product.
- **Prompt slides:** "| PROMPT" tag, centred quote, **red highlighted variables**
  ("[specific goal]"), "SAVE THIS. IT CAN CHANGE YOUR LIFE" flag. CTA = "COMMENT PROMPT /
  FOR ALL 69 UNIQUE PROMPTS" + person cutout.
- **Numbers:** **10.1K** ("7 AI Businesses That Can Pay You Forever"), 2.99K.
- **We take:** device-mockup items for F03, highlighted {variables} in prompts, money/outcome
  framing on the cover.
- **Fits:** F03 Numbered List, F09, F10.

### 3.5 aiwithanushka: warm cream, story told in a chat
- **Look:** cream ground, orange accent, caps sans titles, orange underline bar, faint giant
  slide number "02" top-right, @handle + "02/11" footer. Each slide = one UI moment
  (Connections toggles, WhatsApp thread, Sheets table).
- **Slide 2 move:** removes friction. *"STEP ONE: Connect it to the tools you already use."*
  (Gmail, Claude, Sheets, Notion… all toggled on.) The reader thinks "I already have these".
- **Story arc:** inbox → sales → follow-ups → research → "You don't need another dashboard"
  → "OLD AI vs AI AGENT: Done." → stack → **"HONEST LIMITS: Read this twice"** → CTA.
- **We take:** the honest-limits slide (trust), "old way vs done" contrast, the chat-as-story
  spine. Closest to our **brand voice** (calm ground, one accent).
- **Fits:** F06 Use-Case Scenario, F02, F07.

### 3.6 theonlyworkshop: Apple-calm, the most on-brand
- **Look:** off-white, centred tight black sans headline, **one highlighted word** (green
  underline "replies", "needs"), mono kicker "WHATSAPP × CLAUDE", one clean UI card, footer
  "Step 1 →  03 / 10". Lots of air.
- **Slide 2:** *"One number. Smarter replies. For FAQs, leads and bookings."* A 4-word promise
  plus 3 concrete uses.
- **Numbers:** 90 / 781 likes. Beautiful but low reach. Calm alone doesn't stop the scroll.
- **We take:** layout grid, typographic restraint, kicker + footer system. Needs our bold felt
  objects to add the scroll-stop.
- **Fits:** F02 for Company, F06.

### 3.7 okaashish: hand-drawn quiz / interactive
- **Look:** white, handwriting font, black doodle blob character, blue underlines on key words.
- **Mechanic:** reader **plays**. "Take this test… Don't cheat." → A/B/C choices → "If you picked
  B, you get 1 point" → "Read this ONCE. Don't go back." → final score card → "Comment how many
  did you get?"
- **Slide 2 move:** a question the reader *must* answer before swiping ("Which sentence is
  actually making a point?"). The swipe becomes the reveal.
- **Numbers:** very high (largest audience in the set).
- **We take:** the guess → reveal → score mechanic, character reactions per slide. Swap the doodle
  blob for **our felt agents** (same job, on-brand).
- **Fits:** **F08 Spot the AI** (exact match), F11 Hot Take (the "10 signs" list), Company
  objection posts.

### 3.8 wellbeingnutrition: luxury editorial science
- **Look:** white, 50/50 split: text left, **macro photograph bleeding off the right edge**
  into the next slide (seamless panorama). Small mono header (WELLBEING · NUTRITION), pill
  chips for ranges (Low / Optimal / High).
- **Slide 2 move:** the first item, bleeding off the edge, so the image itself pulls the
  swipe.
- **Numbers:** 3.1K, 2.5K, 1.0K.
- **We take:** **cross-slide bleed** (felt object / band that continues onto the next slide),
  pill chips for stats. Our felt renders are perfect for this.
- **Fits:** F01 source-stack slides, F05 journey (one continuous felt band across slides).

### 3.9 Patterns across all 21 posts (references × research)

**Ranked by likes:** 10.1K algowinner *7 AI businesses that can pay you forever* · 6.1K
meghanify *AI automation tool stack* · 3.1K / 2.5K wellbeing · 2.99K algowinner *69 prompts* ·
2.8K meghanify *Start an AI agency* · 2.3K aiagently *WhatsApp agent (FREE)* · 2.2K / 1.8K
theaiagents · 1.6K meghanify *10 agents* · 1.2K (+2.6K comments) aiagently *Hormozi clone* ·
… · 396–781 aiwithanushka · **90–781 theonlyworkshop** (most beautiful, least liked).

1. **Top posts sell a wish, not a tool.** Money, "forever", "free", "rich", "your own team". The
   tutorials that won wrapped the how-to inside an aspiration. Pure how-to on calm visuals came
   last. That's the research's "information + affect" and wishful-thinking point exactly.
   → Every cover pairs the *what* with a *desire*: "AI receptionist" + "books patients 24/7".
2. **Cover anatomy is the same everywhere:** headline in the top 30–40% (2–6 words, heavy type,
   **one coloured keyword**), a micro-stakes tagline in small caps ("THAT CAN PAY YOU FOREVER",
   "I BET YOU DON'T KNOW THIS", "(FREE)"), then **one face or one iconic object** filling the
   lower 55–65%, often with tool logos as proof. White/light ground so the face pops.
3. **No intro slide.** In top posts, slide 2 is already payoff: item #1 (algowinner,
   theaiagents, okaashish), the result (aiagently salon), or a choice (meghanify). Context
   slides belong later, if at all.
4. **The middle slides repeat one template.** Same title position, same number badge, same
   visual zone. After one slide the reader knows the pattern, and every next swipe costs less
   (low cognitive load, perceived control). Progress is always visible ("Step 03", "2 / 9", "04 —").
5. **One visual centerpiece per slide** (screenshot, mockup, illustration) in ~50–60% of the
   height, plus 2–5 short lines. Titles are verb-led micro-promises ("Turn views into leads").
6. **Second-to-last slide is a payoff:** "Here is the full system", "Now it grills your whole
   business", "Final score", "The takeaway". Closure before the ask.
7. **Last slide is one big ask:** "Want the complete guide?" → **Comment KEYWORD** in huge
   type inside a coloured pill → "I'll send it to you" + a guide mockup or the creator's face.
   The keyword names the payoff (build, PROMPT, WORKFLOW, GPT-6).
8. **Two colours, max.** Light ground + black type + **one** accent (red, yellow, orange, lime,
   blue), used only for the keyword, step label and CTA. That's our "calm ground, bold object".
9. **A recurring character** shows up on every slide (aiagently's face badge, okaashish's blob,
   theaiagents' Hermes avatar). Familiarity is a trust cue (study: followed creators get more
   engagement). → Our felt agents / founder avatar recur as a small mascot with a speech line.
10. **Participation wins comments:** "How many can you relate to?", "Comment your score", A/B/C
    choices (okaashish). → Spot-the-AI and list formats end with a number to comment.
11. **Hand-drawn arrows and notes** (theaiagents, aiagently) point the eye and feel human.
12. **Measurements** (as a share of the 1080 px slide width): side margins 6–8% (~72–88 px);
    cover headline 9–12% (~100–130 px); slide titles 6–7.5% (~66–80 px); body 2.6–3.2%
    (~28–34 px); card radius ~2.5% (~24–32 px). Calm refs leave ~10% margins. Most posts run
    9–11 slides. The study says 5–8 is safest, so **target 7–9** and cut any slide that only
    repeats.

---

## 4. Format → reference map

| Format | Primary reference | Borrow from | Notes |
|---|---|---|---|
| F01 Persona Clone | aiagently (Hormozi) | theaiagents chat UI, wellbeing bleed | Stylised portrait, no endorsement implied |
| F02 Step-by-Step | aiagently steps | theonlyworkshop (calm), anushka | 40 posts. Build first |
| F03 Numbered List | theaiagents agent cards | algowinner laptop items | Recap grid = save slide |
| F04 Team Roster | theaiagents | felt crew assets (`character-sheet`, `closing-crew`) | Avatars = our felt agents |
| F05 Automation Flow | aiagently "on Autopilot" | theaiagents tool connectors, wellbeing bleed | Diagram-led |
| F06 Use-Case Scenario | anushka chat story | theaiagents phone mockup | Timestamp chip 11:47 PM |
| F07 Versus | aiagently Problem→Solution | anushka "Old AI vs Agent" | Split card pair from brand kit |
| F08 Spot the AI | okaashish quiz | — | Felt agent reacts on each slide |
| F09 Prompt Pack | meghanify "COPY THIS PROMPT" | algowinner {variable} highlights | |
| F10 Mega Grid | meghanify ring-binder | — | Generate from CSV |
| F11 Hot Take | okaashish "10 signs" | algowinner condensed type | Massive type, felt RIP prop |
| F12 News Drop | theaiagents Hermes guide | — | Masthead + date chip |

---

## 5. Slide 2: the swipe engine

Every post gets a **slide-2 line written on purpose**, never "Here's what you'll learn".
Slide 2 must (a) work alone as a re-served cover, (b) pay off slide 1 a little, (c) open a bigger
loop. Patterns seen in the references, with one example each in our voice:

| Pattern | Reference | Our version |
|---|---|---|
| **Proof first**: show the result working | aiagently salon | "This is the receptionist. It booked 14 patients last night." + screenshot |
| **Pick your lane**: give a choice | meghanify | "Two kinds of founders read this. Which one are you?" |
| **Already have it**: remove friction | anushka | "You already have everything you need. It's 3 apps." |
| **What if**: ask a question about the reader's own world | theaiagents | "What if your WhatsApp could close the sale?" |
| **Play first**: the reader answers before swiping | okaashish | "One of these replies is AI. Pick before you swipe." |
| **Bleed**: the image pulls off the edge | wellbeing | felt band/object continues on slide 3 |
| **Stakes**: the cost of not knowing | — | "Dentists lose 1 in 3 calls after 6 PM. Here's the fix." |

Rules: max 12 words of headline; a number or a name in it; ends with an open loop (colon,
question or "→"); slide counter visible ("02 / 09") so people know how far is left.

Each format template has a dedicated `slide2` slot so this can't be skipped.

---

## 6. Three handles, one system: skins

The brand spec is calm ("Bold objects. Calm ground.", one italic phrase, no hype). The best
performing references are loud. Proposal: same layouts, three skins along a calm↔loud dial.

| | Company (thedouble.ai) | Founder | Agent Bro |
|---|---|---|---|
| Dial | Calm, brand-strict | Brand + personality | Loudest, creator energy |
| Cover hero | Felt scene / felt agent (`image-assets`) | **Real founder cutout** + felt props | **Real person cutout** + tool logos |
| Ground | Linen `#F6F4EF` | Warm wall `#F2ECE4` | Paper white / light grey |
| Accent | Cobalt `#2F43F2` + capability colours | Cobalt + tangerine | Lime `#D4F53C` highlighter + ink (open question) |
| Headline type | Funnel Display 700 + Newsreader italic phrase | Same, tighter, bigger | Funnel Display 800, highlighter word |
| Signature | Felt crew, pixel status chips ("■ LIVE") | Handwritten arrow notes, felt objects | Tool logo chips, mono labels, `{variables}` |

Collab ★ posts render in the Founder skin with the Company logo co-signed.

**Cover recipe (all handles):** 3–6 word headline, one highlighted word, one hero (person
cutout or felt object) breaking the frame edge, logo chips for the tools involved, swipe cue
bottom-right. You make the cutout image (ChatGPT → remove bg → PNG); the tool drops it into the
`hero` slot and handles scale, crop and glow.

---

## 7. Proposed build (for approval)

- **Engine:** HTML/CSS templates → rendered to PNG by Playwright at 1080×1350 (4:5).
  Real fonts (Funnel Display, Newsreader, Geist, Geist Mono, Silkscreen), real brand tokens.
- **A post = one YAML file** (`posts/founder/d01-p2.yaml`): handle, format, cover, slide-2 line,
  slides, CTA keyword, image paths. Claude can draft these straight from the content plan.
- **Templates:** `formats/F01…F12` built from shared components (step card, chat thread,
  phone/browser frame, prompt card, agent card, flow nodes, recap grid, CTA card, counter,
  handwritten note).
- **Skins:** `skins/company|founder|agentbro.css`, tokens only.
- **Live preview:** a local page that shows all slides side by side as you edit the YAML, plus
  an Instagram-grid preview to check the cover at thumbnail size.
- **Export:** `npm run build posts/founder/d01-p2.yaml` → `out/…/01.png … 09.png`.
- **Build order:** F02 → F03 → F09 → F05 → F01/F04/F06 → rest (matches the spreadsheet).

## 8. Open questions

2. **Agent Bro** is his own personal brand, not The Double (confirmed). Draft identity is in `brands/agentbro/brand.yaml`.
3. **Real photos:** do founder / Agent Bro cutout photos exist yet? Even one test image helps.
4. **Handles / @names** for the footer, and the comment keywords you want to standardise.
5. Size: 4:5 (1080×1350) is the safe default; 3:4 (1080×1440) is taller and now supported.
