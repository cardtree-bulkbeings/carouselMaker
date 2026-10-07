// Renders posts to PNG with headless Chromium. Each slide is screenshotted at exactly 1080×1350.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from '../server.mjs';

let browserPromise;
// Playwright's own Chromium first; if it isn't installed for this user, fall back to system Chrome / Edge.
const getBrowser = () => (browserPromise ||= chromium.launch()
  .catch(() => chromium.launch({ channel: 'chrome' }))
  .catch(() => chromium.launch({ channel: 'msedge' })));

export async function closeBrowser() {
  if (browserPromise) { const b = await browserPromise; browserPromise = null; await b.close(); }
}

/** posts: array of 'posts/…yaml' paths. base: running studio server URL. */
export async function exportPosts(posts, { base }) {
  const browser = await getBrowser();
  const results = [];
  for (const post of posts) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
    try {
      await page.goto(`${base}/render?post=${encodeURIComponent(post)}`);
      await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 });
      const err = await page.evaluate(() => window.__error);
      if (err) throw new Error(err);
      const rel = post.replace(/^posts\//, '').replace(/\.ya?ml$/, '');
      const outDir = path.join(ROOT, 'out', rel);
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.mkdir(outDir, { recursive: true });
      const slides = await page.$$('.slide');
      const files = [];
      for (let i = 0; i < slides.length; i++) {
        const f = path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`);
        await slides[i].screenshot({ path: f });
        files.push(path.relative(ROOT, f).split(path.sep).join('/'));
      }
      results.push({ post, ok: true, files });
    } catch (e) {
      results.push({ post, ok: false, error: e.message });
    } finally {
      await page.close();
    }
  }
  return results;
}
