# Images to generate (and where to save them)

Logos and UI are already covered: tool logos come from Simple Icons, and WhatsApp / Claude /
The Double / n8n / Gmail / Sheets / notifications are built in code (editable text). What the system
needs from you are **photos and illustrations**. Save as **PNG with a transparent background**
(remove the background after generating), at least **1400 px** on the long side.

## 1. Founder photos → `assets/people/founder/`

Real photos, cut out. Shot or generated from his real face. **Direct gaze into the camera** on every
cover pose (research: faces with direct gaze stop the scroll). Same outfit family across the set.

| File | Pose | Used on |
|---|---|---|
| `point-up.png` | pointing up at the headline, confident half-smile | F02/F05 covers |
| `laptop-chair.png` | sitting on a chair with a laptop, looking at camera (aiagently-style) | F02, F05 |
| `arms-crossed.png` | arms crossed, slight smile | F04 team, F01 |
| `thinking.png` | hand on chin, curious | F01 persona, F07 |
| `holding-phone.png` | holding phone towards camera, screen visible | F06-style, WhatsApp posts |
| `presenting.png` | open palm presenting to the side (empty space for UI) | F05 |
| `shocked.png` | genuine surprise, eyebrows up | hot takes, results |
| `thumbs-up.png` | relaxed thumbs-up | CTA slides (optional) |
| `face-circle.png` | head and shoulders, tight crop | small avatar badge |

ChatGPT prompt pattern (with his photo attached):
> "Use the person in the attached photo. Full-body studio photo, [POSE], looking directly into the camera,
> clean white background, soft natural light, sharp focus, realistic, no text. Same face and hairstyle."

## 2. Agent Bro photos → `assets/people/agentbro/`

Same list as the founder (point-up, laptop-chair, arms-crossed, thinking, holding-phone, presenting,
shocked, face-circle) of **his** face. More casual styling (hoodie / tee). No felt characters, ever.

## 3. Felt agents (The Double crew) → `assets/agents/`

Five already cut out from the crew image: `tangerine.png`, `grape.png`, `cobalt.png`, `bubblegum.png`,
`sky.png`. Each is a capability: grape = knowledge · bubblegum = personality · sky = voice ·
cobalt = channels · tangerine = actions. For more expressive slides generate poses, one file each:
`<colour>-<pose>.png`.

| Pose | Used on |
|---|---|
| `wave` | covers, hello / meet-your-Double |
| `point` | pointing to the right at a card |
| `phone` | holding a felt phone (WhatsApp, calls) |
| `laptop` | typing on a felt laptop (building, working) |
| `thinking` | "?" moments, Spot the AI |
| `celebrate` | arms up, results / booked |
| `headset` | voice agent / receptionist |
| `sleeping-moon` + `working-night` | "while you sleep" posts |
| `holding-sign` | blank felt sign (the engine can't write on it, so keep it blank) |

Prompt pattern (attach `image-assets/character-sheet-tangerine-agent.png`):
> "Same felt plush robot character as attached, [COLOUR] felt, black screen face with white pixel eyes,
> lime antenna, [POSE]. Full body, centred, plain white background, soft studio light, no text."

## 4. Persona portraits (F01) → `assets/personas/`

Stylised, not photoreal; never implying endorsement. One per legend in the plan: `chanakya.png`,
`steve-jobs.png`, `apj-abdul-kalam.png`, `naval.png`, `alex-hormozi.png`, `warren-buffett.png`,
`ratan-tata.png`, `paul-graham.png`, `marcus-aurelius.png`.
> "Stylised 3D illustration of [PERSON], half body, facing the camera, warm studio light, plain white
> background, no text, tasteful and respectful."

## 5. Felt objects → `assets/objects/`

`phone.png`, `calendar.png`, `envelope.png` (exists in image-assets), `chat-bubble.png`, `magnifier.png`,
`coins.png`, `clock.png`, `trophy.png`, `lightbulb.png`, `megaphone.png`, `house.png`, `tooth.png`,
`scissors-comb.png`, `stethoscope.png`. Same felt style as the crew, one object per file, centred.

## 6. Niche scenes (Company covers, F05/F06) → `assets/scenes/`

Felt diorama scenes with the crew at work, wide (16:10), empty wall on one side for text:
`dental-clinic.png`, `real-estate-office.png`, `salon.png`, `coaching.png`, `insurance.png`,
`loan-agency.png`, `d2c-warehouse.png`, `night-office.png`. **No humans in Company scenes.**

## 7. Real screenshots (as you build)

For step posts: the actual screens of the tools you used, saved to `assets/screens/<post>/`.
Drop them into a slide's image slot in the studio. Blur any personal data first.

---

**Tip:** in the studio, open the **Images** tab to see everything in `assets/` and `image-assets/`;
drag a picture onto any image slot. Click a slot to move/zoom it, or **Replace…** to upload a new file.
