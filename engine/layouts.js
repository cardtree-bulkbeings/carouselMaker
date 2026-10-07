// Slide layouts. Each takes (slide, ctx) and returns inner HTML.
// ctx.T(field, cls, tag) renders an editable text field; ctx.V(visual) renders a visual.
// Formats (formats/F*.yaml) are just sequences of these layouts.
import { md, esc, logo, icon, colorVars, cycleColor } from './core.js';
import { visual, imageBox, chips } from './visuals.js';
import { EDITORIAL, CTA_STYLES } from './layouts-editorial.js';

const pad2 = (n) => String(n).padStart(2, '0');

// Footer info cards ("BUILD STACK", "WHO NEEDS THIS?"): slide-level `info: [{icon, title, text}]`.
function info(s, c) {
  if (!s.info) return '';
  return `<div class="info-cards n${s.info.length}">${s.info.map((f, i) => `<div class="ifc"><span class="ifc-ic">${icon(f.icon || 'stack')}</span><div><b data-k="${c.k}.info.${i}.title">${md(f.title)}</b><span data-k="${c.k}.info.${i}.text">${md(f.text || '')}</span></div></div>`).join('')}</div>`;
}

// Meta chips under a header: `meta: ["Difficulty ★★☆", "20 min", "Reward: auto-replies"]`
// (quest difficulty, department + staff no., folio dates …).
function meta(s, c) {
  if (!s.meta) return '';
  return `<div class="meta-row">${s.meta.map((m, i) => `<span class="meta" data-k="${c.k}.meta.${i}">${md(m)}</span>`).join('')}</div>`;
}

// Progress as an XP bar (worlds that use it hide the dots; others hide the bar).
const xpBar = (n, total) => (total > 1 ? `<span class="xp"><span class="xp-track"><i style="width:${Math.round((n / total) * 100)}%"></i></span><b>${n}/${total}</b></span>` : '');

// ---------------------------------------------------------------- COVER STYLES v2 (refrences/ + new examples)
// Each returns the whole cover. Shared pieces: kicker / headline / sub via c.T, images via imageBox,
// tool marks via logo() (3D set when present). Field names are listed per style in DESIGN-SYSTEM §7.
const SPOTS = [ // default scatter positions (% of slide): around the edge, clear of the centred title
  { x: 4, y: 10, s: 250, r: -8 }, { x: 70, y: 6, s: 260, r: 6 }, { x: 74, y: 44, s: 230, r: -4 }, { x: 66, y: 74, s: 300, r: 5 },
  { x: 30, y: 71, s: 250, r: -6 }, { x: 0, y: 58, s: 280, r: 4 }, { x: 40, y: 2, s: 190, r: 10 }, { x: 4, y: 34, s: 180, r: -12 },
];
// the person slot: their cut-out, or a soft silhouette until the photo exists
const personBox = (s, k) => (s.image ? imageBox(s.image, `${k}.image`, { cls: 'cutout', fit: 'contain', hint: 'Drop a cut-out PNG', adj: s, field: 'image' })
  : `<div class="imgbox cutout empty silhouette" data-img="${k}.image" data-hint="Drop a cut-out PNG (no background)">${SILHOUETTE}</div>`);
const tileMark = (t) => (t && /[/.]/.test(t) && !/^[a-z0-9.+-]+$/i.test(t) ? `<img class="ic-img lg-3d" src="/${esc(t)}" alt="">` : logo(t).mark);

function coverV2(style, s, c) {
  const k = c.k;
  const corner = (cls, f) => (s[f] ? `<span class="cv-corner ${cls}" data-k="${k}.${f}">${md(s[f])}</span>` : '');
  const corners = corner('tl', 'label') + corner('tr', 'label_r') + corner('bl', 'foot') + corner('br', 'foot_r');
  const tag = s.tag ? `<span class="float-tag" data-k="${k}.tag"><i class="sq"></i>${md(s.tag)}</span>` : '';

  // Wellbeing "7 biomarkers": text column left (bold line, light line), picture bleeding off the right edge.
  if (style === 'split') {
    return `<div class="cover cv-split ${s.side === 'left' ? 'img-left' : ''}" style="${colorVars(c.brand, s.color)}">
      <div class="sp-text">${c.T('kicker', 'kicker')}${c.T('headline', 'h-cover fit')}${c.T('sub', 'cv-sub')}
        <span class="sp-arrow">${icon('arrow-right', 'regular')}</span></div>
      <div class="sp-img">${imageBox(s.image, `${k}.image`, { fit: s.fit || 'cover', pos: s.position, hint: 'Drop an image (it bleeds off the edge)', adj: s, field: 'image' })}</div>
      ${corners}</div>`;
  }

  // Wellbeing "boosters vs killers": word on top, a circle cut in two (A over B), word underneath.
  if (style === 'vs') {
    const a = s.a || {}, b = s.b || {};
    const half = (x, f, cls) => `<div class="vs-half ${cls}" style="${colorVars(c.brand, x.color)}">${imageBox(x.image, `${k}.${f}.image`, { fit: x.fit || 'contain', hint: 'Drop an image', adj: x, field: 'image' })}</div>`;
    return `<div class="cover cv-vs">
      ${c.T('kicker', 'kicker')}
      <div class="vs-word top fit" data-k="${k}.a.text">${md(a.text || 'Option *A*')}</div>
      <div class="vs-disc" data-el="${k}.disc">${half(a, 'a', 'top')}${half(b, 'b', 'bot')}<span class="vs-chip">${esc(s.joiner || 'vs')}</span></div>
      <div class="vs-word bot fit" data-k="${k}.b.text">${md(b.text || 'Option *B*')}</div>
      ${corners}</div>`;
  }

  // Wellbeing "B12 menu": centred title, objects scattered round the edge, each with a small label.
  if (style === 'scatter') {
    const items = (s.items || []).map((it, i) => {
      const x = typeof it === 'string' ? { image: it } : it; const d = SPOTS[i % SPOTS.length];
      const pos = `left:${x.x ?? d.x}%;top:${x.y ?? d.y}%;width:${x.size ?? d.s}px;height:${x.size ?? d.s}px;--r:${x.rot ?? d.r}deg`;
      const pic = x.tool ? tileMark(x.tool) : imageBox(x.image, `${k}.items.${i}.image`, { cls: 'obj', fit: 'contain', hint: '', adj: x, field: 'image' });
      return `<div class="sc-item" data-el="${k}.items.${i}" style="${pos}">${pic}${x.label ? `<span class="sc-label" data-k="${k}.items.${i}.label">${md(x.label)}</span>` : ''}</div>`;
    }).join('');
    return `<div class="cover cv-scatter">${items}
      <div class="sc-text">${c.T('kicker', 'kicker')}${c.T('headline', 'h-cover fit')}${c.T('sub', 'cv-sub')}</div>${corners}${tag}</div>`;
  }

  // theonlyworkshop / aiwithanushka: title, sub, then two app tiles joined by × or →, optional mockup.
  if (style === 'pair') {
    const tiles = (s.pair || ['claude', 'whatsapp']).map((t, i) => {
      const l = typeof t === 'string' && !/[/]/.test(t) ? logo(t) : { mark: tileMark(t), title: '' };
      return `${i ? `<span class="pr-join">${esc(s.joiner || '×')}</span>` : ''}<span class="pr-tile" data-el="${k}.pair.${i}"><span class="pr-box">${l.mark}</span>${s.labels ? `<b>${esc(l.title)}</b>` : ''}</span>`;
    }).join('');
    return `<div class="cover cv-pair">
      <div class="cv-text">${c.T('kicker', 'kicker')}${c.T('headline', 'h-cover fit')}${c.T('sub', 'cv-sub')}</div>
      <div class="pr-row">${tiles}</div>
      ${s.visual ? `<div class="pr-vis vis-area">${c.V(s.visual)}</div>` : ''}${corners}</div>`;
  }

  // aiagently "How to Build WHATSAPP AI AGENT (FREE)": brand-colour ground, script kicker, giant caps
  // line with the app tile inline, a caps subline, then the person filling the lower half.
  if (style === 'banner') {
    return `<div class="cover cv-banner" style="${colorVars(c.brand, s.color)}">
      <div class="bn-glow"></div>
      <div class="cv-text">${c.T('kicker', 'bn-kicker')}
        <div class="bn-line">${s.tool ? `<span class="bn-tile" data-el="${k}.tool">${tileMark(s.tool)}</span>` : ''}${c.T('headline', 'h-cover fit')}</div>
        ${c.T('tagline', 'bn-sub')}</div>
      <div class="cv-stage person">${personBox(s, k)}
        ${s.logos ? `<div class="orbit">${s.logos.map((t, i) => `<span class="orb o${i}" data-el="${k}.logos.${i}">${tileMark(t)}</span>`).join('')}</div>` : ''}${tag}</div>
      ${s.visual ? `<div class="bn-vis vis-area">${c.V(s.visual)}</div>` : ''}</div>`;
  }

  // aiagently "4 Every Business need these AI Agents": the count inline, two-line title beside it,
  // the person centred below with 3D app icons floating round them.
  if (style === 'count') {
    return `<div class="cover cv-count" style="${colorVars(c.brand, s.color)}">
      <div class="cn-head"><span class="cn-num" data-k="${k}.number">${esc(s.number ?? '4')}</span><div class="cn-words">${c.T('kicker', 'cn-kicker')}${c.T('headline', 'h-cover fit')}</div></div>
      <div class="cv-stage person">${personBox(s, k)}
        ${s.logos ? `<div class="orbit">${s.logos.map((t, i) => `<span class="orb o${i}" data-el="${k}.logos.${i}">${tileMark(t)}</span>`).join('')}</div>` : ''}${tag}</div></div>`;
  }

  // theaiagents "best Guide to setup Hermes Agent in 5 Minutes": a tool lockup, a stacked title in mixed
  // sizes, the person centred, tool pills wired to them, a checklist card, a pill line at the bottom.
  if (style === 'guide') {
    const chips = (s.chips || []).map((t, i) => { const l = logo(t); return `<span class="gd-chip c${i}" data-el="${k}.chips.${i}">${l.mark}<b>${esc(l.title)}</b></span>`; }).join('');
    return `<div class="cover cv-guide">
      <div class="cv-text">${s.tool ? `<span class="gd-lock" data-el="${k}.tool">${logo(s.tool).mark}<b>${esc(s.tool_label || logo(s.tool).title)}</b></span>` : ''}${c.T('kicker', 'kicker')}${c.T('headline', 'h-cover fit')}</div>
      <div class="cv-stage person">${personBox(s, k)}
        <div class="gd-chips">${chips}</div>
        ${s.checklist ? `<div class="gd-card" data-el="${k}.checklist">${s.checklist.map((t, i) => `<div><i>${icon('check-circle', 'fill')}</i><span data-k="${k}.checklist.${i}">${md(t)}</span></div>`).join('')}</div>` : ''}
      </div>
      ${s.tag ? `<div class="gd-pill" data-k="${k}.tag">${md(s.tag)}</div>` : ''}</div>`;
  }
  return null;
}

// ---------------------------------------------------------------- COVER
// style: person | scene | object | number | type
function cover(s, c) {
  const style = s.style || (s.image ? 'person' : 'type');
  const k = c.k;
  const v2 = coverV2(style, s, c); if (v2) return v2;
  const tag = s.tag ? `<span class="float-tag" data-k="${k}.tag"><i class="sq"></i>${md(s.tag)}</span>` : '';
  const note = s.note ? `<span class="note n-cover" data-k="${k}.note">${md(s.note)}</span>` : '';
  const badge = s.badge ? `<span class="sticker" data-k="${k}.badge">${md(s.badge)}</span>` : '';
  const chipRow = s.chips ? chips(s.chips, 'cv-chips') : '';
  let stage = '';
  if (style === 'person') {
    stage = `<div class="cv-stage person" style="${colorVars(c.brand, s.color)}">
      <div class="tray">${s.texture ? `<img class="tex" src="/${esc(s.texture)}" alt="">` : ''}</div>
      ${s.image ? imageBox(s.image, `${k}.image`, { cls: `cutout ${s.fill ? 'filled' : ''}`, fit: s.fill ? 'cover' : 'contain', hint: 'Drop a cut-out PNG', adj: s, field: 'image' }) : `<div class="imgbox cutout empty silhouette" data-img="${k}.image" data-hint="Drop a cut-out PNG (no background)">${SILHOUETTE}</div>`}
      ${s.logos ? `<div class="orbit">${s.logos.map((t, i) => `<span class="orb o${i}" data-el="${k}.logos.${i}">${logo(t).mark}</span>`).join('')}</div>` : ''}
      ${tag}${note}
    </div>`;
  } else if (style === 'scene') {
    stage = `<div class="cv-stage scene">${imageBox(s.image, `${k}.image`, { hint: 'Drop a scene image', pos: s.position, adj: s, field: 'image' })}${tag}${note}</div>`;
  } else if (style === 'object') {
    stage = `<div class="cv-stage object" style="${colorVars(c.brand, s.color || 'cobalt')}"><div class="disc"></div>${imageBox(s.image, `${k}.image`, { cls: 'obj', fit: 'contain', hint: 'Drop an object PNG', adj: s, field: 'image' })}${tag}${note}</div>`;
  } else if (style === 'number') {
    // Photo-led handles (rules.cover: person) keep a cut-out slot beside the number, even before the photo exists.
    const img = s.image ? imageBox(s.image, `${k}.image`, { cls: 'obj', fit: 'contain', adj: s, field: 'image' })
      : c.brand.rules?.cover === 'person' ? `<div class="imgbox obj cutout empty silhouette" data-img="${k}.image" data-hint="Drop a cut-out PNG (no background)">${SILHOUETTE}</div>` : '';
    stage = `<div class="cv-stage number" style="${colorVars(c.brand, s.color)}"><span class="giant" data-k="${k}.number">${esc(s.number ?? '5')}</span>${img}${tag}${note}</div>`;
  }
  return `<div class="cover cv-${style}">
    <div class="cv-text">
      ${c.T('kicker', 'kicker')}
      ${c.T('headline', 'h-cover fit')}
      ${c.T('tagline', 'cv-tagline')}
      ${c.T('sub', 'cv-sub')}
      ${chipRow}
    </div>
    ${stage}${badge}
    ${s.stats ? `<div class="cv-stats" data-el="${k}.stats">${s.stats.map((x, i) => `<span><small>${esc(x.label)}</small><b data-k="${k}.stats.${i}.value">${md(x.value)}</b></span>`).join('')}</div>` : ''}
  </div>`;
}

const SILHOUETTE = `<svg viewBox="0 0 400 500" class="sil"><circle cx="200" cy="150" r="92"/><path d="M40 500c0-110 72-200 160-200s160 90 160 200z"/></svg>`;

// ---------------------------------------------------------------- STATEMENT (slide-2 workhorse)
function statement(s, c) {
  return `<div class="stack st ${s.align === 'center' ? 'center' : ''} ${s.size ? 'sz-' + s.size : ''} ${s.visual ? '' : 'novis'}">
    ${c.T('kicker', 'kicker')}
    ${meta(s, c)}
    ${c.T('headline', 'h-xl fit')}
    ${c.T('body', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : ''}
    ${c.T('note', 'note')}
    ${info(s, c)}
    ${c.T('footer', 'foot-line')}
  </div>`;
}

// ---------------------------------------------------------------- STEP
function step(s, c) {
  const n = s.n ?? c.stepNo;
  const total = c.stepTotal;
  const dots = total > 1 ? `<span class="dots">${Array.from({ length: total }, (_, i) => `<i class="${i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}"></i>`).join('')}</span>` : '';
  return `<div class="stack step ${s.visual ? '' : 'novis'}">
    <span class="ghost-num">${pad2(n)}</span>
    <div class="step-head" data-label="${esc(s.label || c.lex('step', 'Step'))} · ${n} of ${total}"><span class="pill-step" data-n="${pad2(n)}">${esc(s.label || c.lex('step', 'Step'))} ${c.num(n).replace(/^0/, '')}</span>${dots}${xpBar(n, total)}</div>
    ${meta(s, c)}
    ${c.T('kicker', 'kicker')}
    ${c.T('title', 'h-lg fit')}
    ${c.T('body', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : ''}
    ${c.T('note', 'note')}
    ${info(s, c)}
  </div>`;
}

// ---------------------------------------------------------------- ITEM (numbered list)
function item(s, c) {
  const n = s.n ?? c.itemNo;
  const mark = s.tool ? logo(s.tool).mark : icon(s.icon || 'sparkle');
  // the big picture on a visual-less item slide may use the 3D set; the small head mark stays Phosphor
  const hero = s.tool ? mark : icon(s.icon || 'sparkle', 'bold', { three: true });
  return `<div class="stack item ${s.visual ? '' : 'novis'}" style="${colorVars(c.brand, s.color || cycleColor(c.brand, n - 1))}">
    <div class="item-head"><span class="num">${c.num(n)}</span><span class="tile big">${mark}</span>${s.label || c.lex('item', null) ? `<span class="pill-c" data-k="${c.k}.label">${md(s.label || `${c.lex('item')} ${c.num(n)}`)}</span>` : ''}</div>
    ${meta(s, c)}
    ${c.T('kicker', 'kicker')}
    ${c.T('name', 'h-lg fit')}
    ${c.T('what', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : `<div class="hero-mark" data-el="${c.k}.mark"><span class="tile">${hero}</span></div>`}
    ${s.example ? `<div class="example"><span class="lbl">${esc(s.example_label || 'Example')}</span><div data-k="${c.k}.example">${md(s.example)}</div></div>` : ''}
    ${s.tags ? `<div class="tagrow">${s.tags.map((t, i) => `<span class="tg" data-k="${c.k}.tags.${i}">${md(t)}</span>`).join('')}</div>` : ''}
    ${c.T('note', 'note')}
    ${info(s, c)}
  </div>`;
}

// ---------------------------------------------------------------- Q&A (persona clone exchange)
function qa(s, c) {
  return `<div class="stack qa-l novis">
    ${c.T('kicker', 'kicker')}
    <div class="q-wrap"><span class="who">${esc(s.asker || 'Me')}</span><div class="q" data-k="${c.k}.q">${md(s.q)}</div></div>
    <div class="a-card">
      <div class="a-head">${s.avatar ? imageBox(s.avatar, `${c.k}.avatar`, { cls: 'av', fit: 'cover', adj: s, field: 'avatar' }) : `<span class="av letter">${esc((s.persona || 'AI')[0])}</span>`}
        <div><b data-k="${c.k}.persona">${md(s.persona || 'AI clone')}</b><span class="status"><i class="sq live"></i>${esc(s.status || 'AI clone · replying')}</span></div></div>
      <div class="a fit" data-k="${c.k}.a">${md(s.a)}</div>
    </div>
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- EXCHANGE (a labelled two-voice exchange)
// The "attack" slide: someone tries something on the Double, the Double answers. Each bubble carries a
// small caps label (who's speaking). messages: [{ who, text, side: left|right }]. Pair with `bg: cobalt`.
function exchange(s, c) {
  const msgs = s.messages || [];
  return `<div class="stack exchange">
    ${s.kicker ? `<span class="ex-tag" data-k="${c.k}.kicker"><i></i>${md(s.kicker)}</span>` : ''}
    ${c.T('headline', 'h-lg fit')}
    <div class="ex-thread">${msgs.map((m, i) => `
      <div class="ex-msg ${m.side === 'left' || (!m.side && i % 2) ? 'left' : 'right'} ${m.tone ? 'tone-' + esc(m.tone) : ''}">
        <span class="ex-who" data-k="${c.k}.messages.${i}.who">${md(m.who || '')}</span>
        <div class="ex-text" data-k="${c.k}.messages.${i}.text">${md(m.text)}</div>
      </div>`).join('')}
    </div>
    ${c.T('verdict', 'ex-verdict')}
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- PROMPT
function prompt(s, c) {
  const n = s.n ?? c.itemNo;
  return `<div class="stack prompt-l ${s.preview ? '' : 'novis'} ${s.rarity ? 'rar-' + esc(s.rarity) : ''}">
    <div class="item-head"><span class="pill-step">${esc(s.label || c.lex('prompt', 'Prompt'))} ${c.num(n)}</span>${s.rarity ? `<span class="rarity">${esc(s.rarity)}</span>` : ''}${s.tool ? `<span class="tool sm">${logo(s.tool).mark}<b>${esc(logo(s.tool).title)}</b></span>` : ''}</div>
    ${meta(s, c)}
    ${c.T('title', 'h-lg fit')}
    <div class="prompt-card"><div class="pc-head"><span>Copy this prompt</span>${icon('copy')}</div><div class="pc-body fit" data-k="${c.k}.prompt">${md(s.prompt)}</div></div>
    ${s.preview ? `<div class="preview"><span class="lbl">${esc(s.preview_label || 'Example output')}</span>${c.V(s.preview, 'preview')}</div>` : ''}
    ${c.T('tip', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- VERSUS
function versus(s, c) {
  const sides = s.sides || [s.a, s.b].filter(Boolean);
  const mark = (v) => v === 'good' || v === true ? `<span class="verdict good">${icon('check', 'bold')}</span>` : v === 'bad' || v === false ? `<span class="verdict bad">${icon('x', 'bold')}</span>` : v ? `<span class="verdict meh">${icon('minus', 'bold')}</span>` : '';
  return `<div class="stack versus">
    ${c.T('criterion', 'crit')}
    ${s.ask ? `<div class="vs-ask"><span class="who">${esc(s.asker || 'Customer')}</span><div class="bub" data-k="${c.k}.ask">${md(s.ask)}</div></div>` : c.T('headline', 'h-lg fit')}
    <div class="vs n${sides.length} ${sides.some((x) => x.avatar) ? 'has-av' : ''}">${sides.map((sd, i) => `
      <div class="side ${sd.verdict === 'good' || sd.verdict === true ? 'win' : ''}" style="${colorVars(c.brand, sd.color)}">
        ${sd.avatar ? `<img class="sd-av" src="/${esc(sd.avatar)}" alt="">` : ''}<div class="sd-head">${sd.tool ? logo(sd.tool).mark : sd.icon ? icon(sd.icon) : ''}<b data-k="${c.k}.${s.sides ? 'sides.' + i : i ? 'b' : 'a'}.label">${md(sd.label)}</b>${mark(sd.verdict)}</div>
        <div class="sd-text" data-k="${c.k}.${s.sides ? 'sides.' + i : i ? 'b' : 'a'}.text">${md(sd.text)}</div>
      </div>${i < sides.length - 1 ? '<span class="vs-mid">vs</span>' : ''}`).join('')}
    </div>
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- SCORECARD
function scorecard(s, c) {
  const cell = (v) => v === true || v === 'yes' ? `<span class="verdict good">${icon('check')}</span>` : v === false || v === 'no' ? `<span class="verdict bad">${icon('x')}</span>` : md(v);
  return `<div class="stack score">
    ${c.T('kicker', 'kicker')}
    ${c.T('headline', 'h-lg fit')}
    <div class="sc-table" style="--cols:${s.cols.length}">
      <div class="sc-row th"><span></span>${s.cols.map((h, i) => `<span class="${i === s.winner ? 'win' : ''}">${md(h)}</span>`).join('')}</div>
      ${s.rows.map((r) => `<div class="sc-row"><span class="crit-c">${md(r[0])}</span>${r.slice(1).map((v, i) => `<span class="${i === s.winner ? 'win' : ''}">${cell(v)}</span>`).join('')}</div>`).join('')}
    </div>
    ${c.T('verdict', 'lede verdict-line')}
  </div>`;
}

// ---------------------------------------------------------------- QUIZ (guess → reveal)
function quiz(s, c) {
  const reveal = !!s.reveal;
  return `<div class="stack quiz ${reveal ? 'revealed' : ''}">
    ${c.T('kicker', 'kicker')}
    ${c.T('headline', 'h-lg fit')}
    <div class="opts n${s.options.length}">${s.options.map((o, i) => `
      <div class="opt ${reveal ? (o.is === 'AI' || o.correct ? 'is-ai' : 'is-human') : ''}">
        <span class="letter">${esc(o.label || 'ABC'[i])}</span>
        ${reveal ? `<span class="answer">${esc(o.is || (o.correct ? 'AI' : 'Human'))}</span>` : `<span class="qmark">?</span>`}
        <div class="otext" data-k="${c.k}.options.${i}.text">${md(o.text)}</div>
        ${reveal && o.why ? `<div class="why" data-k="${c.k}.options.${i}.why">${md(o.why)}</div>` : ''}
      </div>`).join('')}
    </div>
    ${c.T('prompt', 'quiz-prompt')}
  </div>`;
}

// ---------------------------------------------------------------- FLOW (trigger → agent → action)
function flow(s, c) {
  const KIND = { trigger: 'Trigger', agent: 'Agent', action: 'Action', result: 'Result' };
  return `<div class="stack flow-l">
    ${c.T('stage', 'crit')}
    ${c.T('headline', 'h-lg fit')}
    <div class="nodes">${s.nodes.map((n, i) => `
      ${i ? '<span class="conn"></span>' : ''}
      <div class="fnode k-${n.kind || 'agent'}" style="${colorVars(c.brand, n.color || cycleColor(c.brand, i))}">
        <span class="tile">${n.tool ? logo(n.tool).mark : icon(n.icon || 'lightning')}</span>
        <div><span class="kind">${esc(KIND[n.kind] || n.kind || 'Step')}</span><b data-k="${c.k}.nodes.${i}.title">${md(n.title)}</b>${n.sub ? `<span class="sub" data-k="${c.k}.nodes.${i}.sub">${md(n.sub)}</span>` : ''}</div>
      </div>`).join('')}
    </div>
    ${s.result ? `<div class="result-pill"><i class="sq live"></i><span data-k="${c.k}.result">${md(s.result)}</span></div>` : ''}
  </div>`;
}

// ---------------------------------------------------------------- ROSTER card (one team member)
function roster(s, c) {
  return `<div class="stack roster" style="${colorVars(c.brand, s.color || cycleColor(c.brand, (c.itemNo || 1) - 1))}">
    <div class="rc-hero">
      ${imageBox(s.avatar, `${c.k}.avatar`, { cls: 'rc-av', fit: 'contain', hint: 'Drop an avatar', adj: s, field: 'avatar' })}
      <span class="status-chip"><i class="sq live"></i>${esc(s.status || 'Online')}</span>
    </div>
    ${c.T('role', 'kicker')}
    ${c.T('name', 'h-lg fit')}
    ${c.T('what', 'lede')}
    <div class="rc-grid">
      ${s.handles ? `<div class="rc-box"><span class="lbl">Handles</span>${s.handles.map((h, i) => `<div class="ck">${icon('check-circle', 'fill')}<span data-k="${c.k}.handles.${i}">${md(h)}</span></div>`).join('')}</div>` : ''}
      <div class="rc-side">
        ${s.kpi ? `<div class="rc-kpi"><b data-k="${c.k}.kpi.value">${md(s.kpi.value)}</b><span data-k="${c.k}.kpi.label">${md(s.kpi.label)}</span></div>` : ''}
        ${s.tools ? `<div class="rc-box"><span class="lbl">Tools</span>${chips(s.tools, 'sm')}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- ORG chart
function org(s, c) {
  return `<div class="stack org">
    ${c.T('kicker', 'kicker')}
    ${c.T('headline', 'h-lg fit')}
    <div class="org-top">${imageBox(s.top?.image, `${c.k}.top.image`, { cls: 'org-av me', fit: 'cover', hint: 'You' })}<b data-k="${c.k}.top.name">${md(s.top?.name || 'Me')}</b><span>${esc(s.top?.role || 'Founder')}</span></div>
    <div class="org-line" style="--n:${s.members.length}"></div>
    <div class="org-members n${s.members.length}">${s.members.map((m, i) => `
      <div class="om" style="${colorVars(c.brand, m.color || cycleColor(c.brand, i))}">
        ${imageBox(m.image, `${c.k}.members.${i}.image`, { cls: 'om-av', fit: 'contain', hint: '' })}
        <b data-k="${c.k}.members.${i}.name">${md(m.name)}</b><span data-k="${c.k}.members.${i}.role">${md(m.role || '')}</span>
      </div>`).join('')}
    </div>
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- GRID (mega resource wall)
function grid(s, c) {
  const cols = s.columns || (s.items.length > 12 ? 4 : 3);
  return `<div class="stack grid-l">
    <div class="cat-bar"><span data-k="${c.k}.category">${md(s.category || 'Category')}</span><b>${s.items.length}</b></div>
    ${c.T('headline', 'h-md fit')}
    <div class="mega" style="--cols:${cols}">${s.items.map((it, i) => {
      const x = typeof it === 'string' ? { name: it } : it;
      return `<div class="mg ${x.pick ? 'pick' : ''}">${x.tool || x.logo ? logo(x.tool || x.logo).mark : icon(x.icon || 'puzzle-piece')}<b data-k="${c.k}.items.${i}.name">${md(x.name)}</b>${x.use ? `<span data-k="${c.k}.items.${i}.use">${md(x.use)}</span>` : ''}</div>`;
    }).join('')}</div>
  </div>`;
}

// ---------------------------------------------------------------- QUOTE
function quote(s, c) {
  return `<div class="stack quote-l">
    ${c.T('kicker', 'kicker')}
    <span class="qmarks">“</span>
    ${c.T('quote', 'h-quote fit')}
    <div class="by">${s.avatar ? imageBox(s.avatar, `${c.k}.avatar`, { cls: 'av', fit: 'cover', adj: s, field: 'avatar' }) : ''}<div><b data-k="${c.k}.by">${md(s.by || '')}</b>${c.T('role', 'by-role', 'span')}</div></div>
  </div>`;
}

// ---------------------------------------------------------------- STAT (results / the maths)
function stat(s, c) {
  return `<div class="stack stat-l">
    ${c.T('kicker', 'kicker')}
    ${c.T('headline', 'h-lg fit')}
    <div class="stats n${s.stats.length}">${s.stats.map((st, i) => `
      <div class="stt" style="${colorVars(c.brand, st.color || (i === s.stats.length - 1 ? null : null))}">
        <b data-k="${c.k}.stats.${i}.value">${md(st.value)}</b><span data-k="${c.k}.stats.${i}.label">${md(st.label)}</span>
      </div>`).join('')}</div>
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : ''}
    ${c.T('body', 'lede')}
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- RECAP (the save slide)
function recap(s, c) {
  return `<div class="stack recap">
    <div class="save-flag">${icon('bookmark-simple', 'fill')}<span>${esc(s.flag || 'Save this')}</span></div>
    ${c.T('headline', 'h-lg fit')}
    <div class="rc-items n${s.items.length}">${s.items.map((it, i) => {
      const x = typeof it === 'string' ? { name: it } : it;
      return `<div class="ri" style="${colorVars(c.brand, x.color || cycleColor(c.brand, i))}"><span class="num">${pad2(i + 1)}</span><span class="tile">${x.tool ? logo(x.tool).mark : icon(x.icon || 'sparkle')}</span><b data-k="${c.k}.items.${i}.name">${md(x.name)}</b></div>`;
    }).join('')}</div>
    ${c.T('note', 'note')}
  </div>`;
}

// ---------------------------------------------------------------- NEWS
function news(s, c) {
  return `<div class="stack news">
    <div class="masthead"><b data-k="${c.k}.masthead">${md(s.masthead || 'AI Drop')}</b><span class="date">${esc(s.date || '')}</span>${s.breaking ? `<span class="breaking">${esc(s.breaking === true ? 'Breaking' : s.breaking)}</span>` : ''}</div>
    ${s.source ? `<span class="tool src">${logo(s.source).mark}<b>${esc(logo(s.source).title)}</b></span>` : ''}
    ${c.T('headline', 'h-lg fit')}
    ${s.tldr ? `<div class="tldr"><span class="lbl">TL;DR</span>${s.tldr.map((t, i) => `<div class="tl"><i class="sq"></i><span data-k="${c.k}.tldr.${i}">${md(t)}</span></div>`).join('')}</div>` : ''}
    ${c.T('body', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : '<div class="spacer"></div>'}
  </div>`;
}

// ---------------------------------------------------------------- LIST (bullets / numbered rows)
function list(s, c) {
  return `<div class="stack list-l">
    ${c.T('kicker', 'kicker')}
    ${c.T('headline', 'h-lg fit')}
    ${c.T('body', 'lede')}
    <div class="rows ${s.numbered === false ? '' : 'numbered'}">${s.items.map((it, i) => {
      const x = typeof it === 'string' ? { title: it } : it;
      return `<div class="lrow" style="${colorVars(c.brand, x.color)}"><span class="n">${x.icon ? icon(x.icon) : pad2(i + 1)}</span><div><b data-k="${c.k}.items.${i}.title">${md(x.title)}</b>${x.text ? `<span data-k="${c.k}.items.${i}.text">${md(x.text)}</span>` : ''}</div></div>`;
    }).join('')}</div>
    ${c.T('footer', 'foot-line')}
  </div>`;
}

// ---------------------------------------------------------------- CTA
function cta(s, c) {
  const style = s.style || (s.keyword ? 'comment' : 'question');
  if (CTA_STYLES[style]) return CTA_STYLES[style](s, c);
  // Low-effort ask (research: for new accounts, save/like prompts often beat comment asks).
  if (style === 'save') {
    return `<div class="stack cta cta-s novis center">
      <div class="save-ic">${icon('bookmark-simple', 'fill')}</div>
      ${c.T('headline', 'h-xl fit')}
      ${c.T('sub', 'lede center')}
      <div class="follow">${c.brandMark}<span>${md(s.follow || `Follow ${c.brand.handle || ''} for more`)}</span></div>
    </div>`;
  }
  if (style === 'question') {
    return `<div class="stack cta cta-q">
      ${c.T('kicker', 'kicker')}
      ${c.T('headline', 'h-xl fit')}
      ${s.answers ? `<div class="answers">${s.answers.map((a, i) => `<span data-k="${c.k}.answers.${i}">${md(a)}</span>`).join('')}</div>` : ''}
      ${c.T('sub', 'lede')}
      <div class="spacer"></div>
      <div class="follow">${c.brandMark}<span>Follow ${esc(c.brand.handle || '')} ${esc(s.follow || 'for more')}</span></div>
    </div>`;
  }
  return `<div class="stack cta cta-c">
    ${c.T('headline', 'cta-top')}
    <div class="kw-line"><span class="kw-c">Comment</span><span class="kw" data-k="${c.k}.keyword">${esc(s.keyword || 'GUIDE')}</span></div>
    ${c.T('sub', 'lede center')}
    <div class="vis-area">${s.visual ? c.V(s.visual) : c.V({ doc: { title: s.doc_title || c.post.title, label: s.doc_label } })}</div>
    <div class="follow">${c.brandMark}<span>${md(s.follow || `Follow ${c.brand.handle || ''} for more`)}</span></div>
  </div>`;
}

// ---------------------------------------------------------------- LAW (a numbered principle: Codex world)
function law(s, c) {
  const n = s.n ?? c.itemNo;
  return `<div class="stack law-l ${s.visual ? '' : 'novis'}">
    <span class="law-num">${esc(s.label || c.lex('law', 'Law'))} ${c.num(n).replace(/^0/, '')}</span>
    ${c.T('law', 'h-law fit')}
    ${c.T('gloss', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : ''}
    ${c.T('source', 'law-src')}
    ${c.T('note', 'note')}
  </div>`;
}

export const LAYOUTS = { ...EDITORIAL, cover, statement, step, item, qa, exchange, prompt, versus, scorecard, quiz, flow, roster, org, grid, quote, stat, recap, news, list, cta, law };
