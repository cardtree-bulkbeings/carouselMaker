// CLI: npm run check -- posts/company/x.yaml [more …]   |   npm run check -- --all
// Renders each post like the exporter does, then reports:
//   · the swipe checklist (engine.js lint): cover length, slide 2, word count, CTA, imagery rules
//   · layout problems: text clipped by its box, or running off the slide
// Exit code 1 when anything needs fixing, so an agent can loop: write → check → fix → export.
import { createServer } from '../server.mjs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const server = createServer().listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://localhost:${server.address().port}`;
let posts = args.filter((a) => !a.startsWith('--'));
if (args.includes('--all') || !posts.length) posts = (await (await fetch(`${base}/api/posts`)).json()).map((p) => p.path).filter((p) => !/\/(archive|lab)\//.test(p));

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' })).catch(() => chromium.launch({ channel: 'msedge' }));

// Runs inside the rendered page.
const AUDIT = () => {
  const out = [];
  document.querySelectorAll('.slide').forEach((sl, si) => {
    const R = sl.getBoundingClientRect();
    for (const el of sl.querySelectorAll('*')) {
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ');
      if (!txt) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      const where = `slide ${si + 1}: "${txt.slice(0, 48)}"`;
      if (cs.overflow !== 'visible' && el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== 'ellipsis') out.push(`clipped sideways · ${where}`);
      if (r.left < R.left - 1 || r.right > R.right + 1 || r.bottom > R.bottom + 1 || r.top < R.top - 1) out.push(`runs off the slide · ${where}`);
    }
  });
  return [...new Set(out)];
};

let problems = 0;
for (const p of posts) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  await page.goto(`${base}/render?post=${encodeURIComponent(p)}`);
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 });
  const err = await page.evaluate(() => window.__error);
  if (err) { console.log(`✗ ${p}\n    render error: ${err}`); problems++; await page.close(); continue; }
  const lint = await page.evaluate(async (path) => {
    const { lint, parsePost, loadBrand } = await import('/engine/engine.js');
    const { text } = await (await fetch(`/api/post?path=${encodeURIComponent(path)}`)).json();
    const { post } = parsePost(text);
    return lint(post, await loadBrand(post.brand)).filter((x) => x.level === 'warn' || x.level === 'bad').map((x) => `${x.slide != null ? `slide ${x.slide + 1}: ` : ''}${x.msg}`);
  }, p);
  const layout = await page.evaluate(AUDIT);
  const all = [...lint, ...layout];
  problems += all.length;
  console.log(`${all.length ? '✗' : '✓'} ${p}${all.length ? '\n    ' + all.join('\n    ') : ''}`);
  await page.close();
}
await browser.close(); server.close();
console.log(problems ? `\n${problems} thing(s) to fix.` : '\nAll clear.');
process.exit(problems ? 1 : 0);
