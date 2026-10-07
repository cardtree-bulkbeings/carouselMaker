# Agents: start here

Any AI agent working in this folder (Claude, Codex, Cursor, Gemini …) follows **`CLAUDE.md`**. It covers
how to turn a brief ("Company carousel, F03, about X") or a plan day into finished posts, the image rules
per account, and the check → export → review loop.

Quick reference:

- A post = one YAML file in `posts/<founder|company|agentbro>/`.
- Slide types and cover styles, paste-ready: `docs/SLIDE-LIBRARY.md`. Rules: `docs/DESIGN-SYSTEM.md`.
- `npm run check -- <posts…>` must pass before `npm run export -- <posts…>`.
- The user edits visually in the studio: `npm run studio` → http://localhost:4321.
