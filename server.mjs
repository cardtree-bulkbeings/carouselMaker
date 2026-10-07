// Carousel Maker — local studio server.
// Serves the studio UI + engine, reads/writes post YAML files, uploads images, exports PNGs.
// No framework: Node's http module only. Run with `npm run studio`.

import http from 'node:http';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
};

// Only these top-level folders are served as static files.
const STATIC_DIRS = ['studio', 'engine', 'brands', 'formats', 'image-assets', 'assets', 'out', 'node_modules'];

/** Resolve a user-supplied relative path inside ROOT, refusing anything that escapes it. */
function safePath(rel) {
  const p = path.resolve(ROOT, decodeURIComponent(rel).replace(/^[/\\]+/, ''));
  if (!p.startsWith(ROOT + path.sep)) throw Object.assign(new Error('Path outside project'), { status: 400 });
  return p;
}
const toRel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');

async function walk(dir, ext) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p, ext));
    else if (ext.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

async function listPosts() {
  const files = await walk(path.join(ROOT, 'posts'), ['.yaml', '.yml']);
  const rows = [];
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8');
    let doc = {};
    try { doc = YAML.parse(text) || {}; } catch { doc = { title: '⚠ YAML error' }; }
    const st = await fs.stat(f);
    rows.push({ path: toRel(f), brand: doc.brand, format: doc.format, title: doc.title || path.basename(f), slides: (doc.slides || []).length, mtime: st.mtimeMs });
  }
  return rows.sort((a, b) => a.path.localeCompare(b.path));
}

async function listDirs(dir, file) {
  const out = [];
  for (const e of await fs.readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('_')) continue;
    const p = path.join(ROOT, dir, e.name, file);
    if (fss.existsSync(p)) out.push({ id: e.name, ...YAML.parse(await fs.readFile(p, 'utf8')) });
  }
  return out;
}

async function listFormats() {
  const out = [];
  for (const f of (await fs.readdir(path.join(ROOT, 'formats'))).filter((n) => n.endsWith('.yaml')).sort()) {
    const doc = YAML.parse(await fs.readFile(path.join(ROOT, 'formats', f), 'utf8'));
    out.push({ id: doc.id, name: doc.name, used_by: doc.used_by || [], use_when: doc.use_when, structure: doc.structure || [], file: `formats/${f}` });
  }
  return out;
}

// ---------- version history (never lose a post) ----------
const histDir = (p) => path.join(ROOT, '.history', toRel(p).replace(/^posts\//, '').replace(/\.ya?ml$/, ''));
async function backup(p, next) {
  if (!fss.existsSync(p)) return;
  const prev = await fs.readFile(p, 'utf8'); if (prev === next) return;
  const dir = histDir(p); await fs.mkdir(dir, { recursive: true });
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.yaml')).sort();
  // Autosave fires often: keep at most one snapshot per 20 s, and the newest 200.
  const last = files.length ? Number(files.at(-1).replace('.yaml', '')) : 0;
  if (Date.now() - last > 20000) await fs.writeFile(path.join(dir, `${Date.now()}.yaml`), prev);
  for (const f of files.slice(0, Math.max(0, files.length - 199))) await fs.unlink(path.join(dir, f));
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'post';

async function readBody(req, limit = 30 * 1024 * 1024) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > limit) throw Object.assign(new Error('Too large'), { status: 413 }); chunks.push(c); }
  return Buffer.concat(chunks);
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const q = Object.fromEntries(url.searchParams);
    try {
      // ---------- API ----------
      if (url.pathname === '/api/posts') return send(res, 200, await listPosts());
      if (url.pathname === '/api/brands') return send(res, 200, await listDirs('brands', 'brand.yaml'));
      if (url.pathname === '/api/formats') return send(res, 200, await listFormats());
      if (url.pathname === '/api/logos') {
        const files = await walk(path.join(ROOT, 'assets', 'logos'), ['.svg', '.png', '.webp', '.jpg']);
        return send(res, 200, files.map((f) => ({ slug: path.parse(f).name.toLowerCase().replace(/[\s.+]+/g, ''), title: path.parse(f).name, path: toRel(f) })));
      }
      if (url.pathname === '/api/assets') {
        const dirs = (q.dirs || 'image-assets,assets').split(',');
        const out = [];
        for (const d of dirs) for (const f of await walk(safePath(d), ['.png', '.webp', '.jpg', '.jpeg', '.svg'])) out.push(toRel(f));
        return send(res, 200, out.filter((p) => !p.includes('/logos/')));
      }

      if (url.pathname === '/api/post') {
        const p = safePath(q.path);
        if (!/\.ya?ml$/.test(p) || !toRel(p).startsWith('posts/')) return send(res, 400, { error: 'posts/*.yaml only' });
        if (req.method === 'GET') {
          const st = await fs.stat(p);
          return send(res, 200, { text: await fs.readFile(p, 'utf8'), mtime: st.mtimeMs });
        }
        if (req.method === 'PUT') {
          const next = (await readBody(req)).toString('utf8');
          await backup(p, next);
          await fs.writeFile(p, next);
          return send(res, 200, { ok: true, mtime: (await fs.stat(p)).mtimeMs });
        }
        if (req.method === 'DELETE') { await fs.unlink(p); return send(res, 200, { ok: true }); }
      }

      // Version history: every save keeps the previous file in .history/<post>/<time>.yaml
      if (url.pathname === '/api/history') {
        const p = safePath(q.path); const dir = histDir(p);
        if (q.v) return send(res, 200, { text: await fs.readFile(path.join(dir, path.basename(q.v)), 'utf8') });
        const files = fss.existsSync(dir) ? (await fs.readdir(dir)).filter((f) => f.endsWith('.yaml')).sort().reverse() : [];
        return send(res, 200, files.map((f) => ({ v: f, time: Number(f.replace('.yaml', '')) })));
      }

      if (url.pathname === '/api/mtime') {
        return send(res, 200, { mtime: (await fs.stat(safePath(q.path))).mtimeMs });
      }

      // New post: copy a format's scaffold, stamped with brand + title.
      if (url.pathname === '/api/new' && req.method === 'POST') {
        const { brand, format, title } = JSON.parse((await readBody(req)).toString('utf8'));
        const fmt = (await fs.readdir(path.join(ROOT, 'formats'))).find((n) => n.startsWith(format));
        if (!fmt) return send(res, 400, { error: 'Unknown format' });
        let text = await fs.readFile(path.join(ROOT, 'formats', fmt), 'utf8');
        text = text.slice(text.indexOf('# ---- scaffold ----')); // drop the format's own header
        text = text.replace('# ---- scaffold ----\n', '');
        text = `brand: ${brand}\nformat: ${format}\ntitle: ${JSON.stringify(title || 'Untitled')}\n` + text.replace(/^(brand|format|title):.*\n/gm, '');
        const dir = path.join(ROOT, 'posts', brand.replace(/^thedouble-/, ''));
        await fs.mkdir(dir, { recursive: true });
        let file = path.join(dir, `${slugify(title)}.yaml`); let i = 2;
        while (fss.existsSync(file)) file = path.join(dir, `${slugify(title)}-${i++}.yaml`);
        await fs.writeFile(file, text);
        return send(res, 200, { path: toRel(file) });
      }

      if (url.pathname === '/api/upload' && req.method === 'POST') {
        const name = slugify(path.parse(q.name || 'image').name) + (path.extname(q.name || '.png').toLowerCase() || '.png');
        if (!/\.(png|jpe?g|webp|gif|svg)$/.test(name)) return send(res, 400, { error: 'Images only' });
        const file = path.join(ROOT, 'assets', 'uploads', `${Date.now().toString(36)}-${name}`);
        await fs.writeFile(file, await readBody(req));
        return send(res, 200, { path: toRel(file) });
      }

      // Export (if needed) and send every slide of a post as one .zip download.
      if (url.pathname === '/api/zip') {
        const { exportPosts } = await import('./scripts/exporter.mjs');
        const { makeZip } = await import('./scripts/zip.mjs');
        const [r] = await exportPosts([q.path], { base: `http://localhost:${req.socket.localPort}` });
        if (!r.ok) return send(res, 500, { error: r.error });
        const files = await Promise.all(r.files.map(async (f) => ({ name: path.basename(f), data: await fs.readFile(path.join(ROOT, f)) })));
        const name = path.basename(q.path).replace(/\.ya?ml$/, '');
        res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}.zip"`, 'Cache-Control': 'no-store' });
        return res.end(makeZip(files));
      }

      if (url.pathname === '/api/export' && req.method === 'POST') {
        const { exportPosts } = await import('./scripts/exporter.mjs');
        const port = req.socket.localPort;
        const result = await exportPosts([q.path], { base: `http://localhost:${port}` });
        return send(res, 200, result[0]);
      }

      // ---------- static ----------
      let rel = url.pathname === '/' ? '/studio/index.html' : url.pathname;
      if (rel === '/render') rel = '/studio/render.html';
      const top = rel.split('/')[1];
      if (!STATIC_DIRS.includes(top)) return send(res, 404, 'Not found', 'text/plain');
      const p = safePath(rel);
      const data = await fs.readFile(p);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    } catch (e) {
      send(res, e.status || (e.code === 'ENOENT' ? 404 : 500), { error: e.message });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4321);
  createServer().listen(port, () => console.log(`Carousel studio → http://localhost:${port}`));
}
