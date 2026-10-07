---
name: carousel
description: Create one or more Instagram carousels for the Founder, Company (The Double) or Agent Bro accounts in this Carousel Maker project. Use when the user asks to make, build or generate a carousel / post / slides, gives a brief ("format F03 about X"), or names plan days ("build Day 5", "this week for Company").
---

# Make carousels

Follow `CLAUDE.md` in the project root exactly. In short:

1. **Understand the ask.** For each post: account (founder / company / agentbro), format (F01–F12, or pick
   one from the brief), title, and the user's content. Plan days: read `../contentplan.xlsx` and
   `../Carousel_Design_Formats.xlsx` (Calendar Mapping) with openpyxl.
2. **Draft each post** as `posts/<account>/<fid>-<slug>.yaml`: the format scaffold (`formats/F<id>-*.yaml`)
   plus slides from `docs/SLIDE-LIBRARY.md`. Choose a cover style that fits the account, and vary covers
   across a batch.
3. **Copy rules** (DESIGN-SYSTEM §6): promise on the cover, standalone slide 2, verb-first middle,
   payoff, one light ask. 7–9 slides. Example numbers are labelled as examples.
4. **Images**: Company = felt agents/scenes and 3D icons, never people. Founder = his cut-out. Agent Bro =
   only his photos (leave `image` out if none exist).
5. **Verify**: `npm run check -- <files>` until it prints "All clear", then `npm run export -- <files>`
   and look at the PNGs (build a contact sheet). Fix anything small, crowded or empty.
6. **Report** the files, each post's format and cover style, what is example copy, and the studio links
   (http://localhost:4321/?post=posts/...).
