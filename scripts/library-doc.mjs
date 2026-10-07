// npm run docs → regenerates docs/SLIDE-LIBRARY.md from engine/library.js (the same templates the studio uses).
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { LIBRARY, COVER_STYLES, slideFor, coverAs } from '../engine/library.js';

const y = (o) => YAML.stringify([o], { lineWidth: 0, flowCollectionPadding: true }).trimEnd().replace(/^/gm, '  ');
let md = `# Slide library

Every slide type and cover style, as a ready-to-paste YAML block (generated from \`engine/library.js\` by
\`npm run docs\`; the studio's **+ Add slide** and **Design** tab use the same templates).
Paste blocks under \`slides:\` in a post, then rewrite the words. \`*word*\` = the one emphasis.
Images shown are Company defaults; Founder uses \`image-assets/character.png\` (his cut-out), Agent Bro leaves
\`image\` out until his photos exist.

## Cover styles (slide 1)

| style | for | what it is |
|---|---|---|
${Object.entries(COVER_STYLES).map(([k, v]) => `| \`${k}\` | ${v.best.join(', ')} | ${v.desc} |`).join('\n')}

`;
for (const k of Object.keys(COVER_STYLES)) md += `### cover · ${k}\n\n\`\`\`yaml\n${y(coverAs(k, {}, 'thedouble-company'))}\n\`\`\`\n\n`;
const groups = {};
for (const [k, v] of Object.entries(LIBRARY)) (groups[v.group] ||= []).push([k, v]);
for (const [g, items] of Object.entries(groups)) {
  md += `## ${g}\n\n`;
  for (const [k, v] of items) md += `### ${v.label} · \`${k}\`\n\n${v.desc}\n\n\`\`\`yaml\n${y(slideFor(k, 'thedouble-company'))}\n\`\`\`\n\n`;
}
await fs.writeFile(new URL('../docs/SLIDE-LIBRARY.md', import.meta.url), md);
console.log('docs/SLIDE-LIBRARY.md written');
