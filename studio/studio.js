// Carousel Studio: pick a post, see every slide live, edit text in place or in YAML,
// move/zoom/replace images, recolour, check the swipe rules, and download PNGs.
import { loadBrand, renderPost, fitText, waitImages, parsePost, lint, YAML } from '/engine/engine.js';
import { unmd } from '/engine/core.js';
import { LAYOUTS } from '/engine/layouts.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const HANDLE = { 'thedouble-founder': 'founder', 'thedouble-company': 'company', agentbro: 'agentbro' };

const st = {
  posts: [], brands: [], formats: [], filter: '',
  path: null, text: '', doc: null, post: null, brand: null, mtime: 0,
  dirty: false, exportedAt: 0, savedAt: 0,
  zoom: 0.4, view: 'strip', sel: null,
};

// ------------------------------------------------------------------ helpers
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), ms);
}
const api = (u, o) => fetch(u, o).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); return j; });
const keyPath = (k) => k.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const outDir = () => st.path.replace(/^posts\//, 'out/').replace(/\.ya?ml$/, '');

function setSave(state) {
  const el = $('#saveState');
  el.className = 'save-state ' + state;
  el.textContent = { dirty: 'Unsaved…', saved: 'Saved', '': '—', error: 'YAML error' }[state] ?? state;
}

// ------------------------------------------------------------------ posts list
async function loadPosts() {
  st.posts = await api('/api/posts');
  const groups = {};
  for (const p of st.posts) {
    const h = HANDLE[p.brand] || p.brand || 'other';
    if (st.filter && h !== st.filter) continue;
    (groups[h] ||= []).push(p);
  }
  const names = { founder: 'Founder', company: 'Company', agentbro: 'Agent Bro' };
  $('#posts').innerHTML = Object.entries(groups).map(([h, ps]) => `<div class="pgroup">${names[h] || h}</div>` +
    ps.map((p) => `<button class="post ${p.path === st.path ? 'on' : ''}" data-p="${p.path}"><b>${escapeHtml(p.title)}</b><span>${p.format || ''} · ${p.slides} slides</span></button>`).join('')).join('');
}
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$('#posts').addEventListener('click', (e) => { const b = e.target.closest('.post'); if (b) openPost(b.dataset.p); });
$('#brandFilter').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#brandFilter button').forEach((x) => x.classList.toggle('on', x === b));
  st.filter = b.dataset.b; loadPosts();
});

async function openPost(path) {
  if (st.dirty) await save();
  const { text, mtime } = await api(`/api/post?path=${encodeURIComponent(path)}`);
  Object.assign(st, { path, text, mtime, dirty: false, exportedAt: 0, sel: null });
  $('#yaml').value = text;
  history.replaceState(null, '', `?post=${encodeURIComponent(path)}`);
  setSave('saved');
  await loadPosts();
  await render();
}

// ------------------------------------------------------------------ render
async function render() {
  let parsed;
  try { parsed = parsePost(st.text); } catch (e) { $('#err').hidden = false; $('#err').textContent = e.message; setSave('error'); return; }
  $('#err').hidden = true;
  st.doc = parsed.doc; st.post = parsed.post;
  if (!st.post.brand) { $('#stage').innerHTML = '<div class="empty-state">Add <code>brand:</code> to the YAML.</div>'; return; }
  st.brand = await loadBrand(st.post.brand);
  $('#postTitle').textContent = st.post.title || st.path;
  $('#postMeta').textContent = `${st.brand.name} · ${st.post.format || ''} · ${(st.post.slides || []).length} slides · ${st.path}`;
  renderColors();
  renderChecklist();

  const html = renderPost(st.post, st.brand);
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  let slides = [...tmp.children];
  const z = st.zoom;
  const stage = $('#stage');
  const scroll = stage.scrollLeft;

  if (st.view === 'grid') {
    // Instagram profile grid: 3:4 thumbnails. This post's cover + other covers from the same handle.
    const others = st.posts.filter((p) => p.brand === st.post.brand && p.path !== st.path).slice(0, 8);
    const cw = 250, s = cw / 1080, ch = cw * 4 / 3;
    stage.innerHTML = `<p class="grid-note">How the cover reads on your profile (3:4 crop, real size on a phone ≈ this width).</p><div class="grid3" id="grid"></div>`;
    const grid = $('#grid');
    const add = (sec) => { const c = document.createElement('div'); c.className = 'cell'; c.innerHTML = `<div class="frame" style="width:${cw}px;height:${ch}px"><div class="scaler" style="transform:translate(0,${-(1350 * s - ch) / 2}px) scale(${s})"></div></div>`; c.querySelector('.scaler').appendChild(sec); grid.appendChild(c); };
    add(slides[0]);
    for (const p of others) {
      try {
        const { text } = await api(`/api/post?path=${encodeURIComponent(p.path)}`);
        const { post } = parsePost(text); const b = await loadBrand(post.brand);
        const t = document.createElement('div'); t.innerHTML = renderPost({ ...post, slides: post.slides.slice(0, 1) }, b); add(t.firstElementChild);
      } catch { /* skip broken posts */ }
    }
  } else {
    if (st.view === 'reserve') slides = [...slides.slice(1), slides[0]];
    const strip = document.createElement('div'); strip.className = 'strip';
    for (const sec of slides) {
      const i = Number(sec.dataset.i);
      const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.i = i;
      cell.innerHTML = `<div class="frame" style="width:${1080 * z}px;height:${1350 * z}px"><div class="scaler" style="transform:scale(${z})"></div></div>
        <div class="cell-foot"><span>${String(i + 1).padStart(2, '0')} · ${escapeHtml(st.post.slides[i]?.layout || '')}</span><button data-dl="${i}" title="Download this slide as PNG">⬇ PNG</button></div>`;
      cell.querySelector('.scaler').appendChild(sec);
      strip.appendChild(cell);
    }
    stage.innerHTML = ''; stage.appendChild(strip);
  }
  stage.scrollLeft = scroll;
  await waitImages(stage);
  await fitText(stage);
  if (st.sel) { const box = $(`.imgbox[data-img="${st.sel}"]`, stage); if (box) box.classList.add('selected'); else selectImage(null); }
}

// ------------------------------------------------------------------ editing the YAML
const rerender = debounce(() => render(), 250);
const autosave = debounce(() => save(), 900);
$('#yaml').addEventListener('input', () => { st.text = $('#yaml').value; st.dirty = true; setSave('dirty'); rerender(); autosave(); });

async function save() {
  if (!st.path) return;
  try { YAML.parseDocument(st.text); } catch { return; }
  const r = await api(`/api/post?path=${encodeURIComponent(st.path)}`, { method: 'PUT', body: st.text });
  st.mtime = r.mtime; st.dirty = false; st.savedAt = Date.now(); setSave('saved');
}
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); toast('Saved'); } });

/** Write a value into the YAML document (keeps comments), then save + re-render. */
async function setValue(key, value, { del = false, quiet = false } = {}) {
  const p = keyPath(key);
  if (del) st.doc.deleteIn(p); else st.doc.setIn(p, value);
  st.text = st.doc.toString({ lineWidth: 0 });
  $('#yaml').value = st.text;
  st.dirty = true; setSave('dirty');
  await save();
  if (!quiet) await render();
}
const getValue = (key) => st.doc.getIn(keyPath(key));

// Remember where the editor scroll is so YAML rewrites don't jump.
$('#yaml').addEventListener('scroll', () => { st.edScroll = $('#yaml').scrollTop; });

// ------------------------------------------------------------------ inline text editing
$('#stage').addEventListener('dblclick', (e) => {
  const el = e.target.closest('[data-k]'); if (!el || el.isContentEditable) return;
  e.preventDefault();
  el.contentEditable = 'true';
  const before = unmd(el);
  // Focus after the browser's own double-click word selection has happened.
  setTimeout(() => {
    el.focus();
    const range = document.createRange(); range.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }, 0);
  const finish = async (commit) => {
    el.removeEventListener('blur', onBlur); el.removeEventListener('keydown', onKey);
    el.contentEditable = 'false';
    const after = unmd(el).trim();
    if (commit && after !== before.trim()) await setValue(el.dataset.k, after); else await render();
  };
  const onBlur = () => finish(true);
  const onKey = (ev) => {
    if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); el.blur(); }
  };
  el.addEventListener('blur', onBlur); el.addEventListener('keydown', onKey);
});

// ------------------------------------------------------------------ images: select, drag, zoom, replace, drop
function selectImage(key) {
  st.sel = key;
  $$('.imgbox.selected').forEach((b) => b.classList.remove('selected'));
  if (key) { const b = $(`.imgbox[data-img="${key}"]`); if (b) b.classList.add('selected'); }
  $('#imgbar').hidden = !key;
}
const adjKey = (key, suffix) => key + suffix; // slides.0.image → slides.0.image_x (sibling key)

$('#stage').addEventListener('click', (e) => {
  if (e.target.closest('[contenteditable=true]')) return;
  const dl = e.target.closest('[data-dl]'); if (dl) { downloadSlide(Number(dl.dataset.dl)); return; }
  const box = e.target.closest('.imgbox');
  if (box) { selectImage(box.dataset.img); return; }
  if (!e.target.closest('.imgbar')) selectImage(null);
});

$('#stage').addEventListener('mousedown', (e) => {
  const box = e.target.closest('.imgbox.selected'); if (!box || e.button !== 0) return;
  const img = box.querySelector('img'); if (!img) return;
  e.preventDefault();
  const key = box.dataset.img;
  const x0 = Number(getValue(adjKey(key, '_x')) || 0), y0 = Number(getValue(adjKey(key, '_y')) || 0), z = Number(getValue(adjKey(key, '_zoom')) || 1);
  const sx = e.clientX, sy = e.clientY; const scale = st.view === 'strip' || st.view === 'reserve' ? st.zoom : 1;
  let nx = x0, ny = y0;
  const move = (ev) => {
    nx = Math.round(x0 + (ev.clientX - sx) / scale); ny = Math.round(y0 + (ev.clientY - sy) / scale);
    img.style.transform = `translate(${nx}px,${ny}px) scale(${z})`;
  };
  const up = async () => {
    removeEventListener('mousemove', move); removeEventListener('mouseup', up);
    if (nx === x0 && ny === y0) return;
    st.doc.setIn(keyPath(adjKey(key, '_x')), nx); await setValue(adjKey(key, '_y'), ny);
  };
  addEventListener('mousemove', move); addEventListener('mouseup', up);
});

const zoomBy = async (key, d) => {
  const z = Math.max(0.3, Math.min(3, Math.round((Number(getValue(adjKey(key, '_zoom')) || 1) + d) * 100) / 100));
  await setValue(adjKey(key, '_zoom'), z);
};
$('#stage').addEventListener('wheel', (e) => {
  const box = e.target.closest('.imgbox.selected'); if (!box) return;
  e.preventDefault(); zoomBy(box.dataset.img, e.deltaY < 0 ? 0.05 : -0.05);
}, { passive: false });

$('#imgbar').addEventListener('click', async (e) => {
  const a = e.target.closest('[data-a]')?.dataset.a; if (!a || !st.sel) return;
  if (a === 'close') return selectImage(null);
  if (a === 'replace') return $('#filePick').click();
  if (a === 'zoomin') return zoomBy(st.sel, 0.1);
  if (a === 'zoomout') return zoomBy(st.sel, -0.1);
  if (a === 'reset') {
    for (const s of ['_x', '_y', '_zoom']) st.doc.deleteIn(keyPath(adjKey(st.sel, s)));
    await setValue(st.sel, getValue(st.sel));
  }
});

async function upload(file) {
  const r = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
  const j = await r.json(); if (!r.ok) throw new Error(j.error); return j.path;
}
async function setImage(key, path) {
  for (const s of ['_x', '_y', '_zoom']) st.doc.deleteIn(keyPath(adjKey(key, s)));
  await setValue(key, path);
  selectImage(key);
}
$('#filePick').addEventListener('change', async () => {
  const f = $('#filePick').files[0]; if (!f || !st.sel) return;
  try { await setImage(st.sel, await upload(f)); toast('Image replaced'); } catch (e) { toast(e.message); }
  $('#filePick').value = '';
});
$('#stage').addEventListener('dragover', (e) => { const box = e.target.closest('.imgbox'); if (!box) return; e.preventDefault(); $$('.imgbox.drop').forEach((b) => b.classList.remove('drop')); box.classList.add('drop'); });
$('#stage').addEventListener('dragleave', (e) => { e.target.closest?.('.imgbox')?.classList.remove('drop'); });
$('#stage').addEventListener('drop', async (e) => {
  const box = e.target.closest('.imgbox'); if (!box) return; e.preventDefault(); box.classList.remove('drop');
  const asset = e.dataTransfer.getData('text/x-asset');
  try {
    if (asset) await setImage(box.dataset.img, asset);
    else if (e.dataTransfer.files[0]) await setImage(box.dataset.img, await upload(e.dataTransfer.files[0]));
    toast('Image placed');
  } catch (err) { toast(err.message); }
});

// ------------------------------------------------------------------ colours
function renderColors() {
  const presets = st.brand.accents || {};
  const cur = st.post.theme;
  const curName = typeof cur === 'string' ? cur : null;
  const curHex = typeof cur === 'object' && cur ? (cur.accent || cur.highlight) : null;
  const swatch = (v) => v.accent || v.highlight;
  $('#colors').innerHTML = Object.entries(presets).map(([n, v]) => `<button class="dot ${curName === n || curHex === swatch(v) ? 'on' : ''}" title="${n}" data-c="${n}" style="background:${swatch(v)}"></button>`).join('')
    + `<input type="color" id="pick" title="Any colour" value="${curHex || '#2F43F2'}">${cur ? '<button class="reset" id="resetColor" title="Back to the brand colour">reset</button>' : ''}`;
}
$('#colors').addEventListener('click', async (e) => {
  const d = e.target.closest('[data-c]'); if (d) return setValue('theme', d.dataset.c);
  if (e.target.id === 'resetColor') return setValue('theme', null, { del: true });
});
$('#colors').addEventListener('change', async (e) => {
  if (e.target.id !== 'pick') return;
  const key = st.brand.emphasis === 'underline' ? 'highlight' : 'accent';
  await setValue('theme', { [key]: e.target.value });
});

// ------------------------------------------------------------------ checklist
function renderChecklist() {
  const items = lint(st.post, st.brand);
  const order = { bad: 0, warn: 1, tip: 2, ok: 3 };
  items.sort((a, b) => order[a.level] - order[b.level]);
  const n = items.filter((x) => x.level === 'warn' || x.level === 'bad').length;
  $('#checkCount').textContent = n ? `(${n})` : '✓';
  $('#checklist').innerHTML = `<p class="muted">Rules from the Instagram motivation study and the reference posts.</p>` + items.map((x) =>
    `<div class="check ${x.level}" ${x.slide != null ? `data-s="${x.slide}"` : ''}><i></i><div>${escapeHtml(x.msg)}${x.slide != null ? ` <small>· slide ${x.slide + 1}</small>` : ''}</div></div>`).join('');
}
$('#checklist').addEventListener('click', (e) => {
  const c = e.target.closest('[data-s]'); if (!c) return;
  $(`.cell[data-i="${c.dataset.s}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
});

// ------------------------------------------------------------------ export + downloads
async function exportNow() {
  if (st.dirty) await save();
  const r = await api(`/api/export?path=${encodeURIComponent(st.path)}`, { method: 'POST' });
  if (!r.ok) throw new Error(r.error);
  st.exportedAt = Date.now();
  return r;
}
$('#exportBtn').addEventListener('click', async (e) => {
  const b = e.currentTarget; b.disabled = true; b.textContent = 'Rendering…';
  try { const r = await exportNow(); toast(`${r.files.length} PNGs saved to ${outDir()}/`); } catch (err) { toast(err.message); }
  b.disabled = false; b.textContent = 'Export PNGs';
});
$('#zipBtn').addEventListener('click', async (e) => {
  if (!st.path) return;
  const b = e.currentTarget; b.disabled = true; b.textContent = 'Preparing…';
  if (st.dirty) await save();
  const a = document.createElement('a'); a.href = `/api/zip?path=${encodeURIComponent(st.path)}`; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => { b.disabled = false; b.textContent = '⬇ Download all'; }, 2500);
});
async function downloadSlide(i) {
  try {
    if (!st.exportedAt || st.savedAt > st.exportedAt) { toast('Rendering…', 1500); await exportNow(); }
    const a = document.createElement('a'); a.href = `/${outDir()}/${String(i + 1).padStart(2, '0')}.png?t=${Date.now()}`;
    a.download = `${outDir().split('/').pop()}-${String(i + 1).padStart(2, '0')}.png`; document.body.appendChild(a); a.click(); a.remove();
  } catch (err) { toast(err.message); }
}

// ------------------------------------------------------------------ view + zoom
$('#viewSeg').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#viewSeg button').forEach((x) => x.classList.toggle('on', x === b)); st.view = b.dataset.v; render();
});
const setZoom = (z) => { st.zoom = Math.max(0.2, Math.min(0.8, z)); $('#zVal').textContent = `${Math.round(st.zoom * 100)}%`; render(); };
$('#zIn').addEventListener('click', () => setZoom(st.zoom + 0.05));
$('#zOut').addEventListener('click', () => setZoom(st.zoom - 0.05));

// ------------------------------------------------------------------ tabs, assets, help
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#tabs button').forEach((x) => x.classList.toggle('on', x === b));
  $$('.tab').forEach((t) => (t.hidden = t.dataset.t !== b.dataset.t));
  if (b.dataset.t === 'assets') loadAssets();
});
let assetList = [];
async function loadAssets() {
  if (!assetList.length) assetList = await api('/api/assets');
  const q = $('#assetSearch').value.toLowerCase();
  $('#assets').innerHTML = assetList.filter((p) => p.toLowerCase().includes(q)).map((p) =>
    `<div class="asset" draggable="true" data-a="${p}" title="${p}"><img src="/${p}" loading="lazy" alt=""><span>${p.split('/').pop()}</span></div>`).join('');
}
$('#assetSearch').addEventListener('input', loadAssets);
$('#assets').addEventListener('dragstart', (e) => { const a = e.target.closest('.asset'); if (a) e.dataTransfer.setData('text/x-asset', a.dataset.a); });
$('#assets').addEventListener('click', async (e) => {
  const a = e.target.closest('.asset'); if (!a) return;
  if (st.sel) { await setImage(st.sel, a.dataset.a); toast('Image placed'); return; }
  await navigator.clipboard?.writeText(a.dataset.a).catch(() => {}); toast(`Copied ${a.dataset.a}`);
});
$('#layoutList').innerHTML = Object.keys(LAYOUTS).map((l) => `<code>${l}</code>`).join(' ');

// ------------------------------------------------------------------ new post
$('#newBtn').addEventListener('click', async () => {
  if (!st.brands.length) [st.brands, st.formats] = await Promise.all([api('/api/brands'), api('/api/formats')]);
  $('#nBrand').innerHTML = st.brands.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
  if (st.post?.brand) $('#nBrand').value = st.post.brand;
  fillFormats(); $('#newDlg').showModal();
});
function fillFormats() {
  const h = HANDLE[$('#nBrand').value];
  const list = st.formats.filter((f) => !f.used_by.length || f.used_by.includes(h));
  $('#nFormat').innerHTML = list.map((f) => `<option value="${f.id}">${f.id} · ${escapeHtml(f.name)}</option>`).join('');
  hintFormat();
}
function hintFormat() { const f = st.formats.find((x) => x.id === $('#nFormat').value); $('#nFormatHint').textContent = f ? f.use_when : ''; }
$('#nBrand').addEventListener('change', fillFormats);
$('#nFormat').addEventListener('change', hintFormat);
$('#nCreate').addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    const r = await api('/api/new', { method: 'POST', body: JSON.stringify({ brand: $('#nBrand').value, format: $('#nFormat').value, title: $('#nTitle').value || 'Untitled' }) });
    $('#newDlg').close(); $('#nTitle').value = '';
    await openPost(r.path); toast('Created from the format scaffold. Edit the copy and images.');
  } catch (err) { toast(err.message); }
});

// ------------------------------------------------------------------ live reload when the file changes on disk (Claude / VS Code edits)
setInterval(async () => {
  if (!st.path || st.dirty || document.querySelector('[contenteditable=true]')) return;
  try {
    const { mtime } = await api(`/api/mtime?path=${encodeURIComponent(st.path)}`);
    if (mtime > st.mtime + 1) {
      const r = await api(`/api/post?path=${encodeURIComponent(st.path)}`);
      Object.assign(st, { text: r.text, mtime: r.mtime }); $('#yaml').value = r.text; await render(); toast('Reloaded: file changed on disk');
    }
  } catch { /* ignore */ }
}, 2000);

// ------------------------------------------------------------------ boot
await loadPosts();
const start = new URLSearchParams(location.search).get('post') || st.posts[0]?.path;
if (start) openPost(start);
