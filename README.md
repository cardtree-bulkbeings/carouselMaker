# Carousel Maker

Write a carousel as a YAML file in `posts/<handle>/`, get on-brand 1080×1350 Instagram slides.

## Run it

```bash
npm install
npx playwright install chromium   # needed for export/check
npm run studio                    # editor at http://localhost:4321
```

Other commands:

```bash
npm run check  -- posts/<handle>/<file>.yaml   # swipe rules + clipped text
npm run export -- posts/<handle>/<file>.yaml   # PNGs -> out/<handle>/<file>/
```

Read `CLAUDE.md`, `docs/DESIGN-SYSTEM.md` and `docs/SLIDE-LIBRARY.md` before writing posts.
