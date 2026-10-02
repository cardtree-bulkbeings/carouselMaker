// Core helpers shared by every layout: text markup, images, logos, icons, colours.
// A slide is HTML rendered at 1080×1350; every editable text node carries data-k="slides.N.field"
// so the studio can edit it in place and write the change back to the YAML.

export const W = 1080, H = 1350;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { esc };

/**
 * Inline markup used in every text field:
 *   *phrase*  → emphasis (brand decides: serif italic, highlighter, or colour)
 *   **bold**  → bold     ~~word~~ → strikethrough     {variable} → variable chip
 *   [[note]]  → handwritten aside     newline → line break
 */
export function md(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\[\[(.+?)\]\]/g, '<span class="hand">$1</span>')
    .replace(/\{([^{}\n]{1,40})\}/g, '<span class="var">{$1}</span>')
    .replace(/\n/g, '<br>');
}

/** Inverse of md() for contenteditable elements. */
export function unmd(el) {
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { out += n.textContent; continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName.toLowerCase(), inner = unmd(n);
    if (tag === 'br') out += '\n';
    else if (tag === 'em' || tag === 'i') out += `*${inner}*`;
    else if (tag === 'b' || tag === 'strong') out += `**${inner}**`;
    else if (tag === 's') out += `~~${inner}~~`;
    else if (n.classList.contains('hand')) out += `[[${inner}]]`;
    else if (tag === 'div' || tag === 'p') out += (out && !out.endsWith('\n') ? '\n' : '') + inner;
    else out += inner;
  }
  return out.replace(/ /g, ' ');
}

/** Word count ignoring markup, for the swipe checklist. */
export const words = (s) => String(s ?? '').replace(/[*~{}[\]]/g, '').split(/\s+/).filter(Boolean).length;

// ---------- logos (Simple Icons + assets/logos overrides) ----------
let SI = {}, LOCAL = {};
export async function initLibraries() {
  if (Object.keys(SI).length) return;
  const [si, local] = await Promise.all([
    fetch('/node_modules/simple-icons/data/simple-icons.json').then((r) => r.json()),
    fetch('/api/logos').then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]);
  for (const ic of (Array.isArray(si) ? si : si.icons)) SI[ic.slug] = ic;
  for (const f of local) LOCAL[f.slug] = f;
}

const ALIAS = {
  'google-sheets': 'googlesheets', sheets: 'googlesheets', 'google-calendar': 'googlecalendar', calendar: 'googlecalendar',
  gemini: 'googlegemini', 'make.com': 'make', drive: 'googledrive', meta: 'meta', ig: 'instagram', wa: 'whatsapp',
  'google-ads': 'googleads', 'meta-ads': 'meta', gcal: 'googlecalendar', docs: 'googledocs', x: 'x', twitter: 'x',
};
const slugOf = (name) => { const s = String(name).toLowerCase().trim().replace(/[\s.+]+/g, ''); return ALIAS[String(name).toLowerCase().trim()] || ALIAS[s] || s; };

function lum(hex) {
  const n = parseInt(hex, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** A tool logo: { mark, title } where mark is an <i>/<img> element. Accepts "claude" or {name, src}. */
export function logo(tool) {
  const t = typeof tool === 'string' ? { name: tool } : (tool || {});
  const slug = slugOf(t.slug || t.name || '');
  if (t.src || LOCAL[slug]) {
    const src = t.src || LOCAL[slug].path;
    return { mark: `<img class="lg-img" src="/${esc(src)}" alt="">`, title: t.label || t.name || LOCAL[slug]?.title || slug };
  }
  const ic = SI[slug];
  if (ic) {
    const col = lum(ic.hex) > 0.86 ? '15172B' : ic.hex;
    return { mark: `<i class="lg" style="--src:url(/node_modules/simple-icons/icons/${slug}.svg);--col:#${col}"></i>`, title: t.label || ic.title };
  }
  const label = t.label || t.name || '?';
  return { mark: `<i class="lg lg-letter">${esc(label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || '?')}</i>`, title: label };
}

// ---------- UI icons (Phosphor) ----------
export function icon(name, weight = 'bold') {
  if (!name) return '';
  if (/[\/.]/.test(name)) return `<img class="ic-img" src="/${esc(name)}" alt="">`;
  const w = weight === 'regular' ? '' : `-${weight}`;
  return `<i class="ic" style="--src:url(/node_modules/@phosphor-icons/core/assets/${weight}/${esc(name)}${w}.svg)"></i>`;
}

// ---------- colours ----------
/** CSS custom props for a named palette colour (or a raw hex), used as style="…". */
export function colorVars(brand, name) {
  if (!name) return '';
  const p = brand.palette?.[name];
  if (p) return `--c:${p[0]};--c-soft:${p[1]};--c-ink:${p[2]};`;
  if (/^#/.test(name)) return `--c:${name};--c-soft:${name}22;--c-ink:#fff;`;
  return '';
}
/** Cycle palette colours for lists without explicit colours. */
export function cycleColor(brand, i) {
  const names = Object.keys(brand.palette || {}).filter((n) => n !== 'ink' && n !== 'lime');
  return names.length ? names[i % names.length] : null;
}
