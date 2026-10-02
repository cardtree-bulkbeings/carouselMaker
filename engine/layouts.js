// Slide layouts. Each takes (slide, ctx) and returns inner HTML.
// ctx.T(field, cls, tag) renders an editable text field; ctx.V(visual) renders a visual.
// Formats (formats/F*.yaml) are just sequences of these layouts.
import { md, esc, logo, icon, colorVars, cycleColor } from './core.js';
import { visual, imageBox, chips } from './visuals.js';

const pad2 = (n) => String(n).padStart(2, '0');

// Footer info cards ("BUILD STACK", "WHO NEEDS THIS?"): slide-level `info: [{icon, title, text}]`.
function info(s, c) {
  if (!s.info) return '';
  return `<div class="info-cards n${s.info.length}">${s.info.map((f, i) => `<div class="ifc"><span class="ifc-ic">${icon(f.icon || 'stack')}</span><div><b data-k="${c.k}.info.${i}.title">${md(f.title)}</b><span data-k="${c.k}.info.${i}.text">${md(f.text || '')}</span></div></div>`).join('')}</div>`;
}

// ---------------------------------------------------------------- COVER
// style: person | scene | object | number | type
function cover(s, c) {
  const style = s.style || (s.image ? 'person' : 'type');
  const k = c.k;
  const tag = s.tag ? `<span class="float-tag" data-k="${k}.tag"><i class="sq"></i>${md(s.tag)}</span>` : '';
  const note = s.note ? `<span class="note n-cover" data-k="${k}.note">${md(s.note)}</span>` : '';
  const badge = s.badge ? `<span class="sticker" data-k="${k}.badge">${md(s.badge)}</span>` : '';
  const chipRow = s.chips ? chips(s.chips, 'cv-chips') : '';
  let stage = '';
  if (style === 'person') {
    stage = `<div class="cv-stage person" style="${colorVars(c.brand, s.color)}">
      <div class="tray">${s.texture ? `<img class="tex" src="/${esc(s.texture)}" alt="">` : ''}</div>
      ${s.image ? imageBox(s.image, `${k}.image`, { cls: 'cutout', fit: 'contain', hint: 'Drop a cut-out PNG', adj: s, field: 'image' }) : `<div class="imgbox cutout empty silhouette" data-img="${k}.image" data-hint="Drop a cut-out PNG (no background)">${SILHOUETTE}</div>`}
      ${s.logos ? `<div class="orbit">${s.logos.map((t, i) => `<span class="orb o${i}">${logo(t).mark}</span>`).join('')}</div>` : ''}
      ${tag}${note}
    </div>`;
  } else if (style === 'scene') {
    stage = `<div class="cv-stage scene">${imageBox(s.image, `${k}.image`, { hint: 'Drop a scene image', pos: s.position, adj: s, field: 'image' })}${tag}${note}</div>`;
  } else if (style === 'object') {
    stage = `<div class="cv-stage object" style="${colorVars(c.brand, s.color || 'cobalt')}"><div class="disc"></div>${imageBox(s.image, `${k}.image`, { cls: 'obj', fit: 'contain', hint: 'Drop an object PNG', adj: s, field: 'image' })}${tag}${note}</div>`;
  } else if (style === 'number') {
    stage = `<div class="cv-stage number" style="${colorVars(c.brand, s.color)}"><span class="giant" data-k="${k}.number">${esc(s.number ?? '5')}</span>${s.image ? imageBox(s.image, `${k}.image`, { cls: 'obj', fit: 'contain', adj: s, field: 'image' }) : ''}${tag}${note}</div>`;
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
  </div>`;
}

const SILHOUETTE = `<svg viewBox="0 0 400 500" class="sil"><circle cx="200" cy="150" r="92"/><path d="M40 500c0-110 72-200 160-200s160 90 160 200z"/></svg>`;

// ---------------------------------------------------------------- STATEMENT (slide-2 workhorse)
function statement(s, c) {
  return `<div class="stack st ${s.align === 'center' ? 'center' : ''} ${s.size ? 'sz-' + s.size : ''} ${s.visual ? '' : 'novis'}">
    ${c.T('kicker', 'kicker')}
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
    <div class="step-head"><span class="pill-step">${esc(s.label || 'Step')} ${n}</span>${dots}</div>
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
  return `<div class="stack item ${s.visual ? '' : 'novis'}" style="${colorVars(c.brand, s.color || cycleColor(c.brand, n - 1))}">
    <div class="item-head"><span class="num">${pad2(n)}</span><span class="tile big">${mark}</span>${s.label ? `<span class="pill-c" data-k="${c.k}.label">${md(s.label)}</span>` : ''}</div>
    ${c.T('kicker', 'kicker')}
    ${c.T('name', 'h-lg fit')}
    ${c.T('what', 'lede')}
    ${s.visual ? `<div class="vis-area">${c.V(s.visual)}</div>` : `<div class="hero-mark"><span class="tile">${mark}</span></div>`}
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

// ---------------------------------------------------------------- PROMPT
function prompt(s, c) {
  const n = s.n ?? c.itemNo;
  return `<div class="stack prompt-l ${s.preview ? '' : 'novis'}">
    <div class="item-head"><span class="pill-step">${esc(s.label || 'Prompt')} ${pad2(n)}</span>${s.tool ? `<span class="tool sm">${logo(s.tool).mark}<b>${esc(logo(s.tool).title)}</b></span>` : ''}</div>
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
    ${c.T('headline', 'h-lg fit')}
    <div class="vs n${sides.length}">${sides.map((sd, i) => `
      <div class="side ${sd.verdict === 'good' || sd.verdict === true ? 'win' : ''}" style="${colorVars(c.brand, sd.color)}">
        <div class="sd-head">${sd.tool ? logo(sd.tool).mark : sd.icon ? icon(sd.icon) : ''}<b data-k="${c.k}.${s.sides ? 'sides.' + i : i ? 'b' : 'a'}.label">${md(sd.label)}</b>${mark(sd.verdict)}</div>
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

export const LAYOUTS = { cover, statement, step, item, qa, prompt, versus, scorecard, quiz, flow, roster, org, grid, quote, stat, recap, news, list, cta };
