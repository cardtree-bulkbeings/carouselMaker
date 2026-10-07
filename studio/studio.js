// Carousel Studio: pick a post, see every slide live, edit text in place or in YAML,
// move/zoom/replace images, recolour, check the swipe rules, and download PNGs.
import { loadBrand, renderPost, fitText, waitImages, parsePost, lint, YAML } from '/engine/engine.js';
import { unmd } from '/engine/core.js';
import { LAYOUTS } from '/engine/layouts.js';
import { LIBRARY, COVER_STYLES, slideFor, coverAs } from '/engine/library.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const HANDLE = { 'thedouble-founder': 'founder', 'thedouble-company': 'company', agentbro: 'agentbro' };

const st = {
  posts: [], brands: [], formats: [], filter: '',
  path: null, text: '', doc: null, post: null, brand: null, mtime: 0,
  dirty: false, exportedAt: 0, savedAt: 0,
  zoom: 0.4, view: 'strip', sel: null, focus: 0, undo: null, q: '',
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
    if (st.q && !`${p.title} ${p.format} ${p.path}`.toLowerCase().includes(st.q)) continue;
    (groups[h] ||= []).push(p);
  }
  const names = { founder: 'Founder', company: 'Company', agentbro: 'Agent Bro' };
  $('#posts').innerHTML = Object.entries(groups).map(([h, ps]) => `<div class="pgroup">${names[h] || h}</div>` +
    ps.map((p) => `<button class="post ${p.path === st.path ? 'on' : ''}" data-p="${p.path}"><b>${escapeHtml(p.title)}</b><span><i class="fmt">${p.format || '—'}</i>${p.slides} slides</span></button>`).join('')).join('');
}
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$('#postSearch').addEventListener('input', (e) => { st.q = e.target.value.toLowerCase().trim(); loadPosts(); });
$('#posts').addEventListener('click', (e) => { const b = e.target.closest('.post'); if (b) openPost(b.dataset.p); });
$('#brandFilter').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#brandFilter button').forEach((x) => x.classList.toggle('on', x === b));
  st.filter = b.dataset.b; loadPosts();
});

async function openPost(path) {
  if (st.dirty) await save();
  const { text, mtime } = await api(`/api/post?path=${encodeURIComponent(path)}`);
  Object.assign(st, { path, text, mtime, dirty: false, exportedAt: 0, sel: null, focus: 0, undo: null });
  Object.assign(hist, { past: [], future: [], saved: text });
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
  renderColors(); renderModes();
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
      const sl = st.post.slides[i] || {};
      cell.className = `cell ${st.focus === i ? 'focus' : ''}`;
      cell.innerHTML = `<div class="frame" style="width:${1080 * z}px;height:${1350 * z}px"><div class="scaler" style="transform:scale(${z})"></div></div>
        ${st.view === 'strip' ? '<button class="insert" data-op="add" title="Insert a slide here">+</button>' : ''}
        <div class="cell-foot"><span class="no">${String(i + 1).padStart(2, '0')}</span><span class="ly">${escapeHtml(sl.layout === 'cover' ? `cover · ${sl.style || 'person'}` : sl.layout || '')}</span>
          <span class="acts"><button data-op="left" title="Move left">←</button><button data-op="right" title="Move right">→</button><button data-op="dup" title="Duplicate">⧉</button><button data-op="del" title="Delete (Ctrl+Z to undo)">✕</button></span>
          <button class="png" data-dl="${i}" title="Download this slide as PNG">PNG</button></div>`;
      cell.querySelector('.scaler').appendChild(sec);
      strip.appendChild(cell);
    }
    if (st.view === 'strip') { const add = document.createElement('button'); add.className = 'add-tile'; add.dataset.op = 'add'; add.style.cssText = `width:${1080 * z * 0.55}px;height:${1350 * z}px`; add.innerHTML = '<b>+</b>Add slide'; strip.appendChild(add); }
    stage.innerHTML = ''; stage.appendChild(strip);
  }
  stage.scrollLeft = scroll;
  await waitImages(stage);
  await fitText(stage);
  if (st.sel) { if (elOf(st.sel)) drawHandles(); else select(null); }
  if (!$('.tab[data-t="design"]').hidden) renderDesign();
}

// ------------------------------------------------------------------ editing the YAML
const rerender = debounce(() => render(), 250);
const autosave = debounce(() => save(), 900);
$('#yaml').addEventListener('input', () => { st.text = $('#yaml').value; st.dirty = true; setSave('dirty'); rerender(); autosave(); });

// Undo / redo: every saved state of the post is a step (slides, text, moves, cover style …).
const hist = { past: [], future: [], saved: null };
async function save() {
  if (!st.path) return;
  try { YAML.parseDocument(st.text); } catch { return; }
  if (hist.saved != null && hist.saved !== st.text) { hist.past.push(hist.saved); if (hist.past.length > 100) hist.past.shift(); if (!save.redoing) hist.future = []; }
  hist.saved = st.text;
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

// ------------------------------------------------------------------ elements: select, move, resize, layer
// Any text, image, mockup or cover piece can be picked up. Placement is stored per slide as
// `move: { <key>: { x, y, s, z } }` and applied by the engine (engine.js applyMoves), so exports match.
// Images also have a Crop mode: pan / zoom the picture inside its frame (image_x / image_y / image_zoom).
const MOVABLE = '[data-el], [data-img], [data-k]';
const adjKey = (key, suffix) => key + suffix; // slides.0.image → slides.0.image_x (sibling key)
const splitKey = (full) => { const m = /^slides\.(\d+)\.(.+)$/.exec(full || ''); return m ? { i: Number(m[1]), key: m[2] } : null; };
const fullKey = (el) => el.dataset.el || el.dataset.img || el.dataset.k;
const getMove = (sel) => ({ ...(st.post.slides?.[sel.i]?.move?.[sel.key] || {}) });
const editable = () => st.view !== 'grid';

function elOf(sel) {
  if (!sel) return null;
  const slide = $(`.cell[data-i="${sel.i}"] .slide`); if (!slide) return null;
  return $$(MOVABLE, slide).find((e) => fullKey(e) === `slides.${sel.i}.${sel.key}`) || null;
}

function select(sel) {
  st.sel = sel; st.crop = false;
  drawHandles();
}
// image slots are selected by their full key ("slides.0.image")
const selectImage = (full) => select(full ? splitKey(full) : null);

function drawHandles() {
  $$('.imgbox.selected').forEach((b) => b.classList.remove('selected'));
  let box = $('#selbox');
  const el = st.sel && elOf(st.sel);
  $('#elbar').hidden = !el;
  if (!el) { box?.remove(); return; }
  if (!box) { box = document.createElement('div'); box.id = 'selbox'; box.innerHTML = '<i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i>'; $('#stage').appendChild(box); }
  const stage = $('#stage'), sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
  Object.assign(box.style, { left: `${r.left - sr.left + stage.scrollLeft}px`, top: `${r.top - sr.top + stage.scrollTop}px`, width: `${r.width}px`, height: `${r.height}px` });
  box.classList.toggle('crop', !!st.crop);
  const isImg = !!el.dataset.img;
  $('#elbar [data-a=replace]').hidden = !isImg; $('#elbar [data-a=crop]').hidden = !isImg;
  $('#elbar [data-a=crop]').classList.toggle('on', !!st.crop);
  const m = getMove(st.sel);
  $('#elName').textContent = st.sel.key.replace(/\./g, ' ') + (m.s && m.s !== 1 ? ` · ${Math.round(m.s * 100)}%` : '');
  if (st.crop) el.classList.add('selected');
}
$('#stage').addEventListener('scroll', () => drawHandles());
addEventListener('resize', () => drawHandles());

/** Screen px per slide px at this element (studio zoom × any scaled mockup around it). */
const pxScale = (el) => { const p = el.parentElement; const r = p.getBoundingClientRect(); return p.offsetWidth ? r.width / p.offsetWidth : st.zoom; };

async function commitMove(sel, m) {
  const clean = Object.fromEntries(Object.entries(m).filter(([k, v]) => v != null && !(k === 's' && v === 1) && !((k === 'x' || k === 'y') && v === 0)));
  const path = ['slides', sel.i, 'move', sel.key];
  if (Object.keys(clean).length) st.doc.setIn(path, st.doc.createNode(clean, { flow: true }));
  else if (st.doc.hasIn(path)) {
    st.doc.deleteIn(path);
    const mv = st.doc.getIn(['slides', sel.i, 'move']); if (mv && !mv.items?.length) st.doc.deleteIn(['slides', sel.i, 'move']);
  }
  st.text = st.doc.toString({ lineWidth: 0 }); $('#yaml').value = st.text;
  st.dirty = true; setSave('dirty'); await save(); await render();
}

$('#stage').addEventListener('click', (e) => {
  const dl = e.target.closest('[data-dl]'); if (dl) downloadSlide(Number(dl.dataset.dl));
});

// mousedown: pick the element (Alt = its parent) and drag to move it. Corner handles resize.
// In Crop mode, dragging the selected image pans the picture inside its frame instead.
$('#stage').addEventListener('mousedown', (e) => {
  if (e.button !== 0 || !editable() || e.target.closest('[contenteditable=true], .cell-foot')) return;
  const handle = e.target.closest('#selbox [data-h]');
  if (handle) return startResize(e);
  if (st.crop) { const box = e.target.closest('.imgbox.selected'); if (box) return startCrop(e, box); }
  let el = e.target.closest(MOVABLE);
  if (!el || !el.closest('.slide')) { select(null); return; }
  const cur = st.sel && elOf(st.sel);
  if (e.altKey) { const up = (cur && cur.contains(el) ? cur : el).parentElement?.closest(MOVABLE); if (up) el = up; }
  else if (cur && cur !== el && cur.contains(el)) el = cur; // grabbing inside the selection drags the selection
  const sel = splitKey(fullKey(el)); if (!sel) return;
  if (!st.sel || st.sel.i !== sel.i || st.sel.key !== sel.key) select(sel);
  startMove(e, el, sel);
});

function startMove(e, el, sel) {
  const m0 = getMove(sel), k = pxScale(el), sx = e.clientX, sy = e.clientY;
  let moved = false, x = m0.x || 0, y = m0.y || 0;
  const move = (ev) => {
    let dx = (ev.clientX - sx) / k, dy = (ev.clientY - sy) / k;
    if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
    if (!moved) { moved = true; getSelection().removeAllRanges(); }
    if (ev.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
    x = Math.round((m0.x || 0) + dx); y = Math.round((m0.y || 0) + dy);
    el.style.translate = `${x}px ${y}px`; drawHandles();
  };
  const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up); if (moved) commitMove(sel, { ...m0, x, y }); };
  addEventListener('mousemove', move); addEventListener('mouseup', up);
}

function startResize(e) {
  e.preventDefault(); e.stopPropagation();
  const sel = st.sel, el = elOf(sel); if (!el) return;
  const m0 = getMove(sel), r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1; let s = m0.s || 1;
  const move = (ev) => {
    s = Math.max(0.2, Math.min(4, Math.round((m0.s || 1) * (Math.hypot(ev.clientX - cx, ev.clientY - cy) / d0) * 100) / 100));
    el.style.scale = s; drawHandles();
  };
  const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up); if (s !== (m0.s || 1)) commitMove(sel, { ...m0, s }); };
  addEventListener('mousemove', move); addEventListener('mouseup', up);
}

function startCrop(e, box) {
  const img = box.querySelector('img'); if (!img) return;
  e.preventDefault();
  const key = box.dataset.img;
  const x0 = Number(getValue(adjKey(key, '_x')) || 0), y0 = Number(getValue(adjKey(key, '_y')) || 0), z = Number(getValue(adjKey(key, '_zoom')) || 1);
  const sx = e.clientX, sy = e.clientY, scale = pxScale(img);
  let nx = x0, ny = y0;
  const move = (ev) => { nx = Math.round(x0 + (ev.clientX - sx) / scale); ny = Math.round(y0 + (ev.clientY - sy) / scale); img.style.transform = `translate(${nx}px,${ny}px) scale(${z})`; };
  const up = async () => {
    removeEventListener('mousemove', move); removeEventListener('mouseup', up);
    if (nx === x0 && ny === y0) return;
    st.doc.setIn(keyPath(adjKey(key, '_x')), nx); await setValue(adjKey(key, '_y'), ny); st.crop = true; drawHandles();
  };
  addEventListener('mousemove', move); addEventListener('mouseup', up);
}

const zoomBy = async (key, d) => {
  const z = Math.max(0.3, Math.min(3, Math.round((Number(getValue(adjKey(key, '_zoom')) || 1) + d) * 100) / 100));
  await setValue(adjKey(key, '_zoom'), z); st.crop = true; drawHandles();
};
const scaleBy = (d) => { const m = getMove(st.sel); return commitMove(st.sel, { ...m, s: Math.max(0.2, Math.min(4, Math.round(((m.s || 1) + d) * 100) / 100)) }); };
$('#stage').addEventListener('wheel', (e) => {
  if (!st.sel || !editable()) return;
  const el = elOf(st.sel); if (!el || !el.contains(e.target)) return;
  e.preventDefault();
  if (st.crop && el.dataset.img) zoomBy(fullKey(el), e.deltaY < 0 ? 0.05 : -0.05); else scaleBy(e.deltaY < 0 ? 0.05 : -0.05);
}, { passive: false });

/** Current stacking value of an element (auto → 0). */
const zOf = (el) => { const z = parseInt(getComputedStyle(el).zIndex, 10); return Number.isFinite(z) ? z : 0; };
$('#elbar').addEventListener('click', async (e) => {
  const a = e.target.closest('[data-a]')?.dataset.a; if (!a || !st.sel) return;
  const el = elOf(st.sel), m = getMove(st.sel);
  if (a === 'close') return select(null);
  if (a === 'replace') return $('#filePick').click();
  if (a === 'crop') { st.crop = !st.crop; return drawHandles(); }
  if (a === 'bigger') return scaleBy(0.1);
  if (a === 'smaller') return scaleBy(-0.1);
  if (a === 'forward') return commitMove(st.sel, { ...m, z: zOf(el) + 1 });
  if (a === 'backward') return commitMove(st.sel, { ...m, z: zOf(el) - 1 });
  if (a === 'front') return commitMove(st.sel, { ...m, z: 40 });
  if (a === 'back') return commitMove(st.sel, { ...m, z: -1 });
  if (a === 'reset') {
    if (el?.dataset.img) for (const s of ['_x', '_y', '_zoom']) st.doc.deleteIn(keyPath(adjKey(fullKey(el), s)));
    return commitMove(st.sel, {});
  }
});
// arrow keys nudge the selection (Shift = 10 px); Esc deselects
document.addEventListener('keydown', (e) => {
  if (!st.sel || e.target.closest?.('textarea, input, select, [contenteditable=true]')) return;
  if (e.key === 'Escape') return select(null);
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
  e.preventDefault();
  const m = getMove(st.sel), n = e.shiftKey ? 10 : 2;
  commitMove(st.sel, { ...m, x: (m.x || 0) + d[0] * n, y: (m.y || 0) + d[1] * n });
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
  try { await setImage(`slides.${st.sel.i}.${st.sel.key}`, await upload(f)); toast('Image replaced'); } catch (e) { toast(e.message); }
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

// ------------------------------------------------------------------ slides: focus, add, move, duplicate, delete
// The focused slide (click it) drives the Design tab. Slide edits go through the YAML document so
// comments survive, then save + re-render like every other edit.
async function commitDoc() {
  st.text = st.doc.toString({ lineWidth: 0 }); $('#yaml').value = st.text;
  st.dirty = true; setSave('dirty'); await save(); await render();
}
const slidesSeq = () => st.doc.get('slides', true);
async function insertSlide(at, obj) {
  slidesSeq().items.splice(at, 0, st.doc.createNode(obj));
  st.focus = at; select(null); await commitDoc();
  $(`.cell[data-i="${at}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}
async function replaceSlide(i, obj) { slidesSeq().items[i] = st.doc.createNode(obj); select(null); await commitDoc(); }
async function moveSlide(i, d) {
  const it = slidesSeq().items, j = i + d; if (j < 0 || j >= it.length) return;
  [it[i], it[j]] = [it[j], it[i]]; st.focus = j; select(null); await commitDoc();
}
async function dupSlide(i) { const it = slidesSeq().items; it.splice(i + 1, 0, it[i].clone()); st.focus = i + 1; await commitDoc(); }
async function delSlide(i) {
  const it = slidesSeq().items; if (it.length <= 1) return toast('A carousel needs at least one slide.');
  const removed = it.splice(i, 1)[0]; st.undo = { i, node: removed };
  st.focus = Math.min(i, it.length - 1); select(null); await commitDoc();
  toast('Slide deleted · Ctrl+Z brings it back', 4000);
}
async function stepHistory(dir) {
  const from = dir < 0 ? hist.past : hist.future, to = dir < 0 ? hist.future : hist.past;
  if (!from.length) return toast(dir < 0 ? 'Nothing to undo' : 'Nothing to redo');
  to.push(st.text); st.text = from.pop(); hist.saved = st.text; $('#yaml').value = st.text;
  select(null); st.dirty = true; save.redoing = true; await save(); save.redoing = false; await render();
  toast(dir < 0 ? 'Undone' : 'Redone', 1200);
}
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.target.closest?.('textarea, input, [contenteditable=true]')) return;
  if (e.key.toLowerCase() === 'z') { e.preventDefault(); stepHistory(e.shiftKey ? 1 : -1); }
  if (e.key.toLowerCase() === 'y') { e.preventDefault(); stepHistory(1); }
});
$('#undoBtn').addEventListener('click', () => stepHistory(-1));
$('#redoBtn').addEventListener('click', () => stepHistory(1));

// Version history (server keeps a copy of the post before each save, .history/)
$('#histBtn').addEventListener('click', async () => {
  const list = await api(`/api/history?path=${encodeURIComponent(st.path)}`);
  $('#histBody').innerHTML = list.length ? list.map((h) => `<button class="hist" data-v="${h.v}"><b>${new Date(h.time).toLocaleString()}</b><span>Restore this version</span></button>`).join('') : '<p class="muted">No earlier versions yet. One is kept every time the post is saved.</p>';
  $('#histDlg').showModal();
});
$('#histClose').addEventListener('click', () => $('#histDlg').close());
$('#histBody').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-v]'); if (!b) return;
  const { text } = await api(`/api/history?path=${encodeURIComponent(st.path)}&v=${b.dataset.v}`);
  $('#histDlg').close(); st.text = text; $('#yaml').value = text; st.dirty = true; await save(); await render();
  toast('Restored. Ctrl+Z goes back to what you had.');
});

function setFocus(i) {
  if (st.focus === i && $('.cell.focus')) return;
  st.focus = i;
  $$('.cell.focus').forEach((c) => c.classList.remove('focus'));
  $(`.cell[data-i="${i}"]`)?.classList.add('focus');
  renderDesign();
}
$('#stage').addEventListener('mousedown', (e) => { const cell = e.target.closest('.cell[data-i]'); if (cell && !e.target.closest('.cell-foot button, .insert')) setFocus(Number(cell.dataset.i)); }, true);
$('#stage').addEventListener('click', (e) => {
  const b = e.target.closest('[data-op]'); if (!b) return;
  const i = Number(b.closest('.cell')?.dataset.i ?? (st.post.slides || []).length - 1), op = b.dataset.op;
  if (op === 'left') moveSlide(i, -1); else if (op === 'right') moveSlide(i, 1);
  else if (op === 'dup') dupSlide(i); else if (op === 'del') delSlide(i);
  else if (op === 'add') openLibrary('add', b.closest('.cell') ? i + 1 : (st.post.slides || []).length);
});

// ------------------------------------------------------------------ thumbnails: a slide rendered small, in this post's brand
async function fillThumbs(root) {
  const cells = $$('.tf[data-slide]', root);
  for (const tf of cells) {
    const slide = JSON.parse(tf.dataset.slide); tf.removeAttribute('data-slide');
    const w = tf.clientWidth || 176, s = w / 1080;
    tf.innerHTML = `<div class="sc" style="transform:scale(${s})">${renderPost({ ...st.post, slides: [slide], mascot: slide.layout === 'cover' ? null : st.post.mascot }, st.brand)}</div>`;
  }
  await waitImages(root); await fitText(root);
}
const thumb = (slide, { title, desc, on = false, best = false, data = '' }) =>
  `<button class="thumb ${on ? 'on' : ''}" ${data}><div class="tf" data-slide="${escapeHtml(JSON.stringify(slide))}"></div><b>${escapeHtml(title)}${best ? '<i class="best">fits</i>' : ''}</b>${desc ? `<span>${escapeHtml(desc)}</span>` : ''}</button>`;
const handleOf = () => HANDLE[st.post.brand] || 'company';

// ------------------------------------------------------------------ Design tab
const BGS = [['', 'Default'], ['paper', 'Paper'], ['soft', 'Tint'], ['deep', 'Dark'], ['cobalt', 'Cobalt']];
async function renderDesign() {
  const box = $('#design'); if (!st.post) return;
  const n = (st.post.slides || []).length; if (st.focus == null || st.focus >= n) st.focus = 0;
  const i = st.focus, s = st.post.slides[i] || {};
  const isCover = s.layout === 'cover';
  let html = `<div class="ds-head"><b>Slide ${i + 1} <span>· ${escapeHtml(isCover ? `cover · ${s.style || 'person'}` : s.layout || '')}</span></b>
    <div class="ds-acts"><button class="btn sm" data-d="left" title="Move left">←</button><button class="btn sm" data-d="right" title="Move right">→</button><button class="btn sm" data-d="dup">Duplicate</button><button class="btn sm" data-d="del">Delete</button></div></div>
    <button class="btn lime wide" data-d="add">+ Add a slide after this one</button>`;
  if (isCover) {
    html += `<div class="ds-sec">Cover style · first slide</div><div class="thumbs" id="dsThumbs">${Object.entries(COVER_STYLES).map(([k, v]) =>
      thumb(coverAs(k, s, st.post.brand), { title: v.label, desc: v.desc, on: (s.style || 'person') === k, best: v.best.includes(handleOf()), data: `data-cover="${k}"` })).join('')}</div>`;
  } else {
    html += `<div class="ds-sec">Background</div><div class="chips">${BGS.map(([v, l]) => `<button data-bg="${v}" class="${(s.bg || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    html += `<div class="ds-sec">Change this slide's type <span class="muted">(keeps the headline)</span></div><div class="thumbs" id="dsThumbs">${Object.entries(LIBRARY).map(([k, v]) => {
      const t = slideFor(k, st.post.brand); const on = t.layout === s.layout && (t.style || '') === (s.style || '');
      return thumb(t, { title: v.label, desc: v.desc, on, data: `data-type="${k}"` }); }).join('')}</div>`;
  }
  box.innerHTML = html;
  await fillThumbs(box);
}
$('#design').addEventListener('click', async (e) => {
  const d = e.target.closest('[data-d]')?.dataset.d, i = st.focus;
  if (d === 'left') return moveSlide(i, -1); if (d === 'right') return moveSlide(i, 1);
  if (d === 'dup') return dupSlide(i); if (d === 'del') return delSlide(i);
  if (d === 'add') return openLibrary('add', i + 1);
  const bg = e.target.closest('[data-bg]'); if (bg) return setValue(`slides.${i}.bg`, bg.dataset.bg || null, { del: !bg.dataset.bg });
  const cv = e.target.closest('[data-cover]'); if (cv) return replaceSlide(i, coverAs(cv.dataset.cover, st.post.slides[i], st.post.brand));
  const ty = e.target.closest('[data-type]'); if (ty) return replaceSlide(i, carryText(slideFor(ty.dataset.type, st.post.brand), st.post.slides[i]));
});
/** Keep the old slide's main line when switching type: headline / title / name / q map onto each other. */
function carryText(next, old) {
  const main = old.headline ?? old.title ?? old.name ?? old.q ?? old.quote;
  const slot = ['headline', 'title', 'name', 'q', 'quote'].find((f) => f in next);
  if (main && slot) next[slot] = main;
  for (const f of ['kicker', 'body', 'bg']) if (old[f] != null && f in next) next[f] = old[f];
  return next;
}

// ------------------------------------------------------------------ slide library dialog
let libAt = 0;
async function openLibrary(mode, at) {
  libAt = at;
  const groups = {};
  for (const [k, v] of Object.entries(LIBRARY)) (groups[v.group] ||= []).push([k, v]);
  const covers = Object.entries(COVER_STYLES).map(([k, v]) => thumb(coverAs(k, {}, st.post.brand), { title: `Cover · ${v.label}`, desc: v.desc, best: v.best.includes(handleOf()), data: `data-add-cover="${k}"` })).join('');
  $('#libTitle').textContent = `Add a slide at position ${at + 1}`;
  $('#libBody').innerHTML = Object.entries(groups).map(([g, items]) => `<div class="ds-sec">${g}</div><div class="thumbs">${items.map(([k, v]) => thumb(slideFor(k, st.post.brand), { title: v.label, desc: v.desc, data: `data-add="${k}"` })).join('')}</div>`).join('')
    + `<div class="ds-sec">Covers</div><div class="thumbs">${covers}</div>`;
  $('#libDlg').showModal();
  await fillThumbs($('#libBody'));
}
$('#libClose').addEventListener('click', () => $('#libDlg').close());
$('#libBody').addEventListener('click', async (e) => {
  const a = e.target.closest('[data-add]'), c = e.target.closest('[data-add-cover]'); if (!a && !c) return;
  $('#libDlg').close();
  await insertSlide(libAt, a ? slideFor(a.dataset.add, st.post.brand) : coverAs(c.dataset.addCover, {}, st.post.brand));
  toast('Slide added · double-click its text to write over it');
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
// Light / Dark: brands that list `modes:` (Agent Bro) get a switch; it writes `mode:` into the post.
function renderModes() {
  const seg = $('#modeSeg'), modes = st.brand.modes;
  seg.hidden = !modes; if (!modes) return;
  const cur = st.post.mode || st.brand.mode || modes[0];
  $$('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.m === cur));
}
$('#modeSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-m]'); if (!b) return;
  return b.dataset.m === (st.brand.mode || 'light') ? setValue('mode', null, { del: true }) : setValue('mode', b.dataset.m);
});
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
  if (b.dataset.t === 'design') renderDesign();
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
  if (st.sel && elOf(st.sel)?.dataset.img) { await setImage(`slides.${st.sel.i}.${st.sel.key}`, a.dataset.a); toast('Image placed'); return; }
  await navigator.clipboard?.writeText(a.dataset.a).catch(() => {}); toast(`Copied ${a.dataset.a}`);
});

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
