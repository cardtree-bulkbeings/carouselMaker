// Editorial slide layouts (Company first, any brand can use them). After the "AI agency" carousel the user
// shared: two lanes, a numbered index, a money ledger, a brief with fact boxes, a pipeline with a
// before/after number, a team tree, notebook pages with sticky notes, and two endings (ring, photo).
// Same contract as layouts.js: (slide, ctx) → inner HTML; ctx.T renders an editable text field.
import { md, esc, logo, icon, colorVars } from './core.js';
import { imageBox } from './visuals.js';

const pad2 = (n) => String(n).padStart(2, '0');
const K = (c, f) => `data-k="${c.k}.${f}"`;

// ---------------------------------------------------------------- LANES: "Two lanes. You only need one."
// lanes: [{ label, title, text, color }]  (2 or 3)
function lanes(s, c) {
  const L = s.lanes || [];
  return `<div class="stack ed lanes-l">
    ${c.T('kicker', 'kicker')}${c.T('headline', 'h-xl fit')}${c.T('body', 'lede')}
    <div class="lanes n${L.length}">${L.map((l, i) => `
      <div class="lane ${i % 2 ? 'alt' : ''}" style="${colorVars(c.brand, l.color)}">
        <span class="ln-n">${pad2(i + 1)}</span>
        ${l.label ? `<span class="ln-lbl" ${K(c, `lanes.${i}.label`)}>${md(l.label)}</span>` : ''}
        <b class="ln-t" ${K(c, `lanes.${i}.title`)}>${md(l.title || '')}</b>
        ${l.text ? `<span class="ln-x" ${K(c, `lanes.${i}.text`)}>${md(l.text)}</span>` : ''}
      </div>`).join('')}
    </div>
    ${c.T('footer', 'ed-foot')}
  </div>`;
}

// ---------------------------------------------------------------- INDEX: "Pick the industry first." 1–N in two columns
// items: ["Market", "Offer", …]
function index(s, c) {
  const it = s.items || [];
  return `<div class="stack ed index-l">
    ${c.T('kicker', 'kicker')}${c.T('headline', 'h-xl fit')}${c.T('body', 'lede')}
    <div class="ix-card ${it.length > 5 ? 'two' : ''}">${it.map((x, i) => `
      <div class="ix"><span class="ix-n">${i + 1}</span><span class="ix-t" ${K(c, `items.${i}`)}>${md(typeof x === 'string' ? x : x.title)}</span></div>`).join('')}
    </div>
    ${c.T('footer', 'ed-foot')}
  </div>`;
}

// ---------------------------------------------------------------- LEDGER: "Start with who pays." a ruled table, one chip column
// cols: ["Industry", "Monthly", "Why"], rows: [["Financial services", "$3–7k", "Spends 2.6× …"]], chip: 1
function ledger(s, c) {
  const chip = s.chip ?? 1;
  return `<div class="stack ed ledger-l">
    ${c.T('kicker', 'ed-pill')}${c.T('headline', 'h-xl fit')}
    <div class="lg-table" style="--cols:${(s.cols || []).length}">
      <div class="lg-row th">${(s.cols || []).map((h) => `<span>${md(h)}</span>`).join('')}</div>
      ${(s.rows || []).map((r, i) => `<div class="lg-row">${r.map((v, j) => `<span class="${j === chip ? 'chip' : ''}" ${K(c, `rows.${i}.${j}`)}>${md(v)}</span>`).join('')}</div>`).join('')}
    </div>
    ${c.T('footer', 'ed-foot it')}
  </div>`;
}

// ---------------------------------------------------------------- BRIEF: "Sell the audit first." a tinted box + fact boxes
// body (the box), facts: [{ label, value }], footer
function brief(s, c) {
  return `<div class="stack ed brief-l">
    ${c.T('kicker', 'ed-pill')}${c.T('headline', 'h-xl fit')}
    ${s.body ? `<div class="br-box" ${K(c, 'body')}>${md(s.body)}</div>` : ''}
    ${s.facts ? `<div class="br-facts n${s.facts.length}">${s.facts.map((f, i) => `<div class="br-fact"><span ${K(c, `facts.${i}.label`)}>${md(f.label)}</span><b ${K(c, `facts.${i}.value`)}>${md(f.value)}</b></div>`).join('')}</div>` : ''}
    ${c.T('footer', 'ed-foot big')}
  </div>`;
}

// ---------------------------------------------------------------- PIPELINE: numbered stops on a curve, a note, then before → after
// steps: ["Sales Navigator", "Clearout", …], note, sub, compare: [{ label, value }, { label, value }]
function pipeline(s, c) {
  const st = s.steps || [];
  const W = 900, H = 230, n = Math.max(st.length, 2);
  const pts = st.map((_, i) => ({ x: 40 + (i * (W - 80)) / (n - 1), y: i % 2 ? 150 : 70 }));
  const path = pts.map((p, i) => (i ? `S ${p.x - (W - 80) / (n - 1) / 2} ${p.y} ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(' ');
  return `<div class="stack ed pipe-l">
    ${c.T('kicker', 'ed-pill')}${c.T('headline', 'h-xl fit')}
    <div class="pp-card"><div class="pp-track"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${path}"/></svg>
      ${pts.map((p, i) => `<div class="pp-stop ${i % 2 ? 'lo' : 'hi'}" style="left:${(p.x / W) * 100}%;top:${(p.y / H) * 100}%"><span class="pp-dot">${i + 1}</span><span class="pp-lbl" ${K(c, `steps.${i}`)}>${md(st[i])}</span></div>`).join('')}
    </div></div>
    ${s.note ? `<div class="pp-note"><b ${K(c, 'note')}>${md(s.note)}</b>${s.sub ? `<span ${K(c, 'sub')}>${md(s.sub)}</span>` : ''}</div>` : ''}
    ${s.compare ? `<div class="pp-cmp">${s.compare.map((x, i) => `<div class="${i === s.compare.length - 1 ? 'win' : ''}"><span ${K(c, `compare.${i}.label`)}>${md(x.label)}</span><b ${K(c, `compare.${i}.value`)}>${md(x.value)}</b>${x.unit ? `<small>${esc(x.unit)}</small>` : ''}</div>`).join('<i class="pp-div"></i>')}</div>` : ''}
  </div>`;
}

// ---------------------------------------------------------------- TREE: "Your internal team." one root pill → N boxes
// chips: ["153k stars", …], root, branches: ["Sales", …], footer, sub
function tree(s, c) {
  const b = s.branches || [];
  return `<div class="stack ed tree-l">
    ${c.T('kicker', 'kicker')}${c.T('headline', 'h-xl fit')}${c.T('body', 'lede')}
    ${s.chips ? `<div class="tr-chips">${s.chips.map((x, i) => `<span ${K(c, `chips.${i}`)}>${md(x)}</span>`).join('')}</div>` : ''}
    <div class="tr-org">
      <span class="tr-root" ${K(c, 'root')}>${s.root_tool ? logo(s.root_tool).mark : ''}${md(s.root || 'Your Double')}</span>
      <div class="tr-wires" style="--n:${b.length}"></div>
      <div class="tr-kids n${b.length}">${b.map((x, i) => { const o = typeof x === 'string' ? { name: x } : x;
        return `<div class="tr-kid">${o.tool ? logo(o.tool).mark : o.image ? `<img class="tr-av" src="/${esc(o.image)}" alt="">` : ''}<b ${K(c, `branches.${i}${typeof x === 'string' ? '' : '.name'}`)}>${md(o.name)}</b></div>`; }).join('')}</div>
    </div>
    ${c.T('footer', 'ed-foot big')}${c.T('sub', 'ed-sub')}
  </div>`;
}

// ---------------------------------------------------------------- NOTEBOOK: a ring-bound page with sticky notes (tool + 3 points)
// title, notes: [{ tool, name, points: [] }]
function notebook(s, c) {
  const N = s.notes || [];
  return `<div class="stack ed nb-l">
    <div class="nb-title"><span ${K(c, 'title')}>${md(s.title || 'The stack')}</span><i class="nb-mark">${icon('cursor-click', 'fill')}</i></div>
    <div class="nb-page"><div class="nb-rings">${'<i></i>'.repeat(9)}</div>
      ${N.map((n, i) => `<div class="nb-note p${i % 4}" data-el="${c.k}.notes.${i}">
        <div class="nb-h">${n.tool ? logo(n.tool).mark : ''}<b ${K(c, `notes.${i}.name`)}>${md(n.name || (n.tool ? logo(n.tool).title : ''))}</b></div>
        ${(n.points || []).map((p, j) => `<span ${K(c, `notes.${i}.points.${j}`)}>${md(p)}</span>`).join('')}
      </div>`).join('')}
    </div>
  </div>`;
}

// ---------------------------------------------------------------- endings
// cta style ring: a big outlined circle, a tilted "Comment" tag, the keyword huge inside. keyword, sub
function ctaRing(s, c) {
  return `<div class="stack ed cta-ring novis">
    <div class="rg-circle"><span class="rg-tag">${esc(s.label || 'Comment')}</span><b class="rg-kw" ${K(c, 'keyword')}>${esc(s.keyword || 'GUIDE')}</b>${c.T('sub', 'rg-sub')}</div>
  </div>`;
}
// cta style photo: ask + keyword pill on top, a picture filling the bottom with a rounded top
function ctaPhoto(s, c) {
  return `<div class="stack ed cta-photo">
    ${c.T('headline', 'h-xl fit')}${c.T('sub', 'lede')}
    <span class="ph-kw">Comment <b ${K(c, 'keyword')}>${esc(s.keyword || 'GUIDE')}</b></span>
    ${c.T('note', 'ph-note')}
    <div class="ph-img">${imageBox(s.image, `${c.k}.image`, { fit: s.fit || 'cover', pos: s.position, hint: 'Drop a photo or felt scene', adj: s, field: 'image' })}</div>
  </div>`;
}

export const EDITORIAL = { lanes, index, ledger, brief, pipeline, tree, notebook };
export const CTA_STYLES = { ring: ctaRing, photo: ctaPhoto };
