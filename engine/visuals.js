// "Visuals": the picture half of a slide. Any content layout accepts `visual:` with ONE of these keys:
//   image   – screenshot/photo/felt render, optional frame: browser | phone | plain | felt
//   rows    – icon-spine card of instructions (aiagently style)
//   chat    – phone with a WhatsApp / iMessage / Instagram / call thread
//   code    – terminal window
//   tools   – big logo row: Claude + n8n + WhatsApp
//   table   – compact data table with highlighted chips
//   flow    – horizontal pipeline of nodes
//   cards   – 2–3 side-by-side cards (lanes, options, before/after)
//   checklist – ticked list
//   doc     – a guide/document mockup (for CTAs)
import { md, esc, logo, icon, colorVars, cycleColor } from './core.js';

/**
 * An image slot. `adj` is the object that holds the image field; it may also carry
 * <field>_x / <field>_y (px offset), <field>_zoom (scale) and <field>_pos (object-position),
 * which the studio writes when you drag or zoom an image.
 */
export function imageBox(src, key, { cls = '', hint = 'Drop an image', fit = 'cover', pos, adj, field } = {}) {
  const a = adj && field ? adj : {};
  const x = a[`${field}_x`] || 0, y = a[`${field}_y`] || 0, z = a[`${field}_zoom`] || 1;
  const p = a[`${field}_pos`] || pos;
  const style = `object-fit:${fit};${p ? `object-position:${esc(p)};` : ''}${x || y || z !== 1 ? `transform:translate(${x}px,${y}px) scale(${z});` : ''}`;
  const img = src ? `<img src="/${esc(src)}" alt="" style="${style}" draggable="false" onerror="this.parentNode.classList.add('broken')">` : '';
  return `<div class="imgbox ${cls} ${src ? '' : 'empty'}" data-img="${key}" data-hint="${esc(hint)}">${img}</div>`;
}

function chips(tools, extra = '') {
  return `<div class="tools ${extra}">${(tools || []).map((t) => { const l = logo(t); return `<span class="tool">${l.mark}<b>${esc(l.title)}</b></span>`; }).join('')}</div>`;
}
export { chips };

const V = {
  image(v, c, k) {
    const frame = v.frame || 'plain';
    const box = imageBox(v.image, `${k}.image`, { fit: v.fit || (frame === 'felt' ? 'contain' : 'cover'), hint: v.hint || 'Drop a screenshot', pos: v.position, adj: v, field: 'image' });
    if (frame === 'browser') return `<div class="vz-browser"><div class="bar"><i></i><i></i><i></i>${v.url ? `<span class="url">${esc(v.url)}</span>` : ''}</div>${box}</div>`;
    if (frame === 'phone') return `<div class="vz-phone"><div class="notch"></div>${box}</div>`;
    if (frame === 'felt') return `<div class="vz-felt">${box}</div>`;
    if (frame === 'bleed') return `<div class="vz-bleed ${v.side === 'left' ? 'left' : ''}">${box}</div>`;
    return `<div class="vz-plain">${box}</div>`;
  },

  rows(v, c, k) {
    return `<div class="vz-rows">${v.rows.map((r, i) => {
      const row = typeof r === 'string' ? { text: r } : r;
      return `<div class="row">
        <span class="spine">${row.tool ? logo(row.tool).mark : icon(row.icon || 'circle')}</span>
        <div class="rt">
          <div class="t" data-k="${k}.rows.${i}.text">${md(row.text)}</div>
          ${row.sub ? `<div class="s" data-k="${k}.rows.${i}.sub">${md(row.sub)}</div>` : ''}
          ${row.code ? `<code data-k="${k}.rows.${i}.code">${esc(row.code)}</code>` : ''}
        </div>
        ${row.tag ? `<span class="tag" data-k="${k}.rows.${i}.tag">${md(row.tag)}</span>` : ''}
      </div>`;
    }).join('')}</div>`;
  },

  // Chat apps, faithful to the real light-mode UIs. One self-contained kit (wa-*) so skins can't distort it.
  // chat: { app: whatsapp | imessage | instagram | call, name, status, avatar, time, frame: phone, messages: [...] }
  // message kinds: text (default) · voice · card/event · buttons/slots · image · system/date · typing
  chat(v, c, k) {
    const ch = v.chat; const app = ch.app || 'whatsapp';
    const initial = esc((ch.name || '?').replace(/[^A-Za-z0-9]/g, '')[0] || '?');
    const avatar = ch.avatar ? `<img class="wa-av" src="/${esc(ch.avatar)}" alt="">` : `<span class="wa-av">${initial}</span>`;
    const ticks = `<i class="wa-ticks">${icon('checks', 'bold')}</i>`;
    if (app === 'call') {
      return `<div class="wa-call ${v.frame === 'phone' || ch.frame === 'phone' ? 'in-phone' : ''}">
        <div class="wa-call-top"><span>${icon('lock-simple', 'fill')} End-to-end encrypted</span></div>
        ${avatar}<b data-k="${k}.chat.name">${md(ch.name || 'Incoming call')}</b><span class="wa-call-st" data-k="${k}.chat.status">${md(ch.status || 'Calling…')}</span>
        <div class="wa-bigwave">${'<i></i>'.repeat(24)}</div>
        ${ch.transcript ? `<div class="wa-transcript" data-k="${k}.chat.transcript">${md(ch.transcript)}</div>` : ''}
        <div class="wa-callbtns"><span>${icon('speaker-high', 'fill')}</span><span>${icon('video-camera', 'fill')}</span><span>${icon('microphone-slash', 'fill')}</span><span class="end">${icon('phone-disconnect', 'fill')}</span></div>
      </div>`;
    }
    const msgs = (ch.messages || []).map((m, i) => {
      const who = m.from === 'me' || m.from === 'out' ? 'out' : 'in';
      const kk = `${k}.chat.messages.${i}`;
      const meta = `<span class="wa-meta">${esc(m.time || '')}${who === 'out' && app === 'whatsapp' ? ticks : ''}</span>`;
      const tail = (i === 0 || (ch.messages[i - 1] && (ch.messages[i - 1].from === 'me' || ch.messages[i - 1].from === 'out' ? 'out' : 'in') !== who)) ? 'tail' : '';
      switch (m.kind) {
        case 'system': case 'date':
          return `<div class="wa-date" data-k="${kk}.text">${md(m.text)}</div>`;
        case 'typing':
          return `<div class="wa-msg in tail wa-typing"><i></i><i></i><i></i></div>`;
        case 'voice':
          return `<div class="wa-msg ${who} ${tail} wa-voice"><span class="wa-play">${icon('play', 'fill')}</span><span class="wa-wave">${'<i></i>'.repeat(30)}</span><span class="wa-vmeta"><small>${esc(m.duration || '0:14')}</small>${meta}</span></div>`;
        case 'image':
          return `<div class="wa-msg ${who} ${tail} wa-img"><img src="/${esc(m.image)}" alt="">${m.text ? `<span data-k="${kk}.text">${md(m.text)}</span>` : ''}${meta}</div>`;
        case 'card': case 'event':
          return `<div class="wa-msg ${who} ${tail} wa-card"><div class="wa-card-in"><span class="wa-card-ic">${icon(m.icon || 'calendar-check', 'fill')}</span><div><b data-k="${kk}.title">${md(m.title)}</b><span data-k="${kk}.text">${md(m.text || '')}</span></div></div>${m.action ? `<div class="wa-card-act">${esc(m.action)}</div>` : ''}${meta}</div>`;
        case 'buttons': case 'slots': {
          const opts = m.options || [];
          return `<div class="wa-buttons ${who}">${opts.map((o, j) => `<span class="${j === m.selected ? 'sel' : ''}">${icon(m.kind === 'slots' ? 'clock' : 'arrow-bend-up-left')} ${esc(o)}</span>`).join('')}</div>`;
        }
        default:
          return `<div class="wa-msg ${who} ${tail}"><span class="wa-text" data-k="${kk}.text">${md(m.text)}</span>${meta}</div>`;
      }
    }).join('');
    const right = app === 'whatsapp' ? `${icon('video-camera')}${icon('phone')}${icon('dots-three-vertical', 'bold')}` : app === 'imessage' ? icon('video-camera') : `${icon('phone')}${icon('video-camera')}`;
    const composer = app === 'whatsapp'
      ? `<div class="wa-compose"><span class="wa-input">${icon('smiley')}<em>Message</em>${icon('paperclip')}${icon('camera')}</span><span class="wa-mic">${icon('microphone', 'fill')}</span></div>`
      : `<div class="wa-compose"><span class="wa-input">${icon(app === 'instagram' ? 'camera' : 'plus')}<em>${app === 'imessage' ? 'iMessage' : 'Message…'}</em>${icon('microphone')}</span></div>`;
    const body = `<div class="wa app-${app}">
      <div class="wa-head">${icon('caret-left', 'bold')}${avatar}<div class="wa-who"><b data-k="${k}.chat.name">${md(ch.name || 'Your Double')}${ch.verified !== false && app === 'whatsapp' && /business|clinic|studio|dental|homes|salon/i.test(ch.name || '') ? `<i class="wa-verified">${icon('seal-check', 'fill')}</i>` : ''}</b><span data-k="${k}.chat.status">${md(ch.status || 'online')}</span></div><span class="wa-icons">${right}</span></div>
      <div class="wa-thread">${ch.time ? `<div class="wa-date">${esc(ch.time)}</div>` : ''}${msgs}</div>
      ${composer}
    </div>`;
    if (v.frame === 'phone' || ch.frame === 'phone') return `<div class="wa-phone"><div class="wa-status"><b>9:41</b><span>${icon('cell-signal-full', 'fill')}${icon('wifi-high', 'bold')}${icon('battery-full', 'fill')}</span></div><div class="wa-island"></div>${body}</div>`;
    return body;
  },

  code(v, c, k) {
    return `<div class="vz-code"><div class="bar"><i></i><i></i><i></i><span>${esc(v.title || 'terminal')}</span></div><pre data-k="${k}.code">${esc(v.code)}</pre></div>`;
  },

  tools(v, c, k) {
    return `<div class="vz-tools">${v.tools.map((t, i) => { const l = logo(t); return `${i ? `<span class="plus">${esc(v.join || '+')}</span>` : ''}<span class="big"><span class="tile">${l.mark}</span><b>${esc(l.title)}</b></span>`; }).join('')}</div>`;
  },

  table(v, c, k) {
    const t = v.table;
    return `<div class="vz-table"><div class="tr th">${t.cols.map((h) => `<span>${esc(h)}</span>`).join('')}</div>${t.rows.map((r, i) => `<div class="tr">${r.map((cell, j) => `<span class="${j === (t.highlight ?? -1) ? 'hl' : ''}" data-k="${k}.table.rows.${i}.${j}">${md(cell)}</span>`).join('')}</div>`).join('')}</div>`;
  },

  flow(v, c, k) {
    return `<div class="vz-flow">${v.flow.map((n, i) => {
      const node = typeof n === 'string' ? { label: n } : n;
      const mark = node.tool ? logo(node.tool).mark : icon(node.icon || 'circle');
      return `${i ? '<span class="arr">' + icon('arrow-right') + '</span>' : ''}<span class="node" style="${colorVars(c.brand, node.color || cycleColor(c.brand, i))}"><span class="tile">${mark}</span><b data-k="${k}.flow.${i}.label">${md(node.label)}</b></span>`;
    }).join('')}</div>`;
  },

  cards(v, c, k) {
    return `<div class="vz-cards n${v.cards.length}">${v.cards.map((cd, i) => `<div class="cd" style="${colorVars(c.brand, cd.color || cycleColor(c.brand, i))}">
      ${cd.label ? `<span class="lbl" data-k="${k}.cards.${i}.label">${md(cd.label)}</span>` : ''}
      ${cd.icon ? `<span class="tile">${icon(cd.icon)}</span>` : ''}
      <div class="t" data-k="${k}.cards.${i}.title">${md(cd.title)}</div>
      ${cd.text ? `<div class="s" data-k="${k}.cards.${i}.text">${md(cd.text)}</div>` : ''}
    </div>`).join('')}</div>`;
  },

  checklist(v, c, k) {
    return `<div class="vz-check">${v.checklist.map((x, i) => `<div class="ck">${icon('check-circle', 'fill')}<span data-k="${k}.checklist.${i}">${md(x)}</span></div>`).join('')}</div>`;
  },

  doc(v, c, k) {
    const d = v.doc;
    return `<div class="vz-doc"><div class="pg p3"></div><div class="pg p2"></div><div class="pg p1">
      <span class="dlbl">${esc(d.label || 'THE COMPLETE GUIDE')}</span>
      <b data-k="${k}.doc.title">${md(d.title || 'Guide')}</b>
      ${(d.lines || ['', '', '', '', '']).map((l) => l ? `<span class="ln t">${md(l)}</span>` : '<span class="ln"></span>').join('')}
    </div></div>`;
  },
};

// ---------------------------------------------------------------- UI KITS (coded, so text stays editable)
Object.assign(V, {
  // Claude desktop app: sidebar + conversation. claude: { project, messages: [{from: me|claude, text}] }
  claude(v, c, k) {
    const cl = v.claude;
    return `<div class="ui-claude">
      ${cl.sidebar === false ? '' : `<aside><div class="cl-logo">${logo('claude').mark}<b>Claude</b></div>
        <span class="cl-nav">${icon('plus')} New chat</span><span class="cl-nav on">${icon('folder-simple')} Projects</span><span class="cl-nav">${icon('squares-four')} Artifacts</span>
        <span class="cl-sec">Recents</span>${(cl.recents || ['Sales follow-ups', 'Clinic FAQ bot', 'Weekly report']).map((r) => `<span class="cl-rec">${esc(r)}</span>`).join('')}</aside>`}
      <main>${cl.project ? `<div class="cl-proj" data-k="${k}.claude.project">${md(cl.project)}</div>` : ''}
        <div class="cl-thread">${(cl.messages || []).map((m, i) => m.from === 'me'
          ? `<div class="cl-me" data-k="${k}.claude.messages.${i}.text">${md(m.text)}</div>`
          : `<div class="cl-ai">${logo('claude').mark}<div data-k="${k}.claude.messages.${i}.text">${md(m.text)}</div></div>`).join('')}</div>
        <div class="cl-input"><span>${esc(cl.placeholder || 'Reply to Claude…')}</span><i>${icon('arrow-up')}</i></div>
      </main></div>`;
  },

  // The Double dashboard: a live agent with capability chips and a status feed.
  double(v, c, k) {
    const d = v.double;
    const caps = d.capabilities || ['knowledge', 'personality', 'voice', 'channels', 'actions'];
    const CAP = { knowledge: 'grape', personality: 'bubblegum', voice: 'sky', channels: 'cobalt', actions: 'tangerine' };
    return `<div class="ui-double">
      <div class="dbl-head">${d.avatar ? `<img class="dbl-av" src="/${esc(d.avatar)}" alt="">` : `<span class="dbl-av">${esc((d.name || 'D')[0])}</span>`}
        <div><b data-k="${k}.double.name">${md(d.name || 'Your Double')}</b><span class="pix"><i class="sq live"></i>${esc(d.status || 'Live · answering')}</span></div>
        <span class="dbl-mark">${icon('dots-three')}</span></div>
      <div class="dbl-caps">${caps.map((cp) => `<span class="cap" style="${colorVars(c.brand, CAP[cp] || cp)}"><i class="sq"></i>${esc(cp)}</span>`).join('')}</div>
      <div class="dbl-feed">${(d.feed || []).map((f, i) => `<div class="fd"><i class="sq" style="background:${f.color ? (c.brand.palette?.[f.color]?.[0] || f.color) : 'var(--live)'}"></i><span data-k="${k}.double.feed.${i}.text">${md(f.text || f)}</span>${f.time ? `<small>${esc(f.time)}</small>` : ''}</div>`).join('')}</div>
      ${d.stats ? `<div class="dbl-stats">${d.stats.map((s, i) => `<div><b data-k="${k}.double.stats.${i}.value">${md(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>` : ''}
    </div>`;
  },

  // n8n-style workflow canvas: nodes: [tool | {tool, label}], optional title
  n8n(v, c, k) {
    const nodes = v.n8n.nodes || v.n8n;
    return `<div class="ui-n8n"><div class="n8-bar"><span>${esc(v.n8n.title || 'Workflow')}</span><span class="n8-act"><i class="sq live"></i>Active</span></div>
      <div class="n8-canvas">${nodes.map((n, i) => { const x = typeof n === 'string' ? { tool: n } : n; const l = x.tool ? logo(x.tool) : { mark: icon(x.icon || 'lightning'), title: x.label };
        return `${i ? '<span class="n8-wire"></span>' : ''}<div class="n8-node ${i === 0 ? 'trig' : ''}"><span class="n8-box">${l.mark}</span><b>${esc(x.label || l.title)}</b></div>`; }).join('')}</div></div>`;
  },

  // Gmail-style inbox: gmail: [{from, subject, tag, unread}]
  gmail(v, c, k) {
    return `<div class="ui-gmail"><div class="gm-bar">${logo('gmail').mark}<span class="gm-search">${icon('magnifying-glass')} Search mail</span></div>
      ${v.gmail.map((m, i) => `<div class="gm-row ${m.unread ? 'unread' : ''}"><span class="gm-from" data-k="${k}.gmail.${i}.from">${md(m.from)}</span><span class="gm-subj" data-k="${k}.gmail.${i}.subject">${md(m.subject)}</span>${m.tag ? `<span class="gm-tag">${esc(m.tag)}</span>` : ''}<small>${esc(m.time || '')}</small></div>`).join('')}</div>`;
  },

  // Google Sheets-style grid: sheet: {title, cols, rows}
  sheet(v, c, k) {
    const s = v.sheet;
    return `<div class="ui-sheet"><div class="sh-bar">${logo('googlesheets').mark}<b>${esc(s.title || 'Leads')}</b></div>
      <div class="sh-grid" style="--cols:${s.cols.length}"><span class="sh-c hd"></span>${s.cols.map((h, j) => `<span class="sh-c hd">${String.fromCharCode(65 + j)}</span>`).join('')}
      <span class="sh-c rn">1</span>${s.cols.map((h) => `<span class="sh-c th">${esc(h)}</span>`).join('')}
      ${s.rows.map((r, i) => `<span class="sh-c rn">${i + 2}</span>${r.map((cell, j) => `<span class="sh-c ${s.new && i === s.rows.length - 1 ? 'new' : ''}" data-k="${k}.sheet.rows.${i}.${j}">${md(cell)}</span>`).join('')}`).join('')}</div></div>`;
  },

  // Lock-screen notifications: notify: [{app, title, text, time}]
  notify(v, c, k) {
    return `<div class="ui-notify">${v.notify.map((n, i) => { const l = logo(n.app || 'whatsapp');
      return `<div class="nt">${n.app ? `<span class="nt-ic">${l.mark}</span>` : ''}<div><b><span data-k="${k}.notify.${i}.title">${md(n.title || l.title)}</span><small>${esc(n.time || 'now')}</small></b><span data-k="${k}.notify.${i}.text">${md(n.text)}</span></div></div>`; }).join('')}</div>`;
  },
});

// theaiagents signature: tool tiles (left) → centre mockup → feature cards (right), joined by dashed lines.
V.hub = (v, c, k) => {
  const h = v.hub;
  const centerKind = Object.keys(V).find((kind) => kind !== 'hub' && h.center && h.center[kind] !== undefined);
  return `<div class="vz-hub">
    <div class="hub-tools">${(h.tools || []).map((t) => { const l = logo(t); return `<span class="hub-tool">${l.mark}<b>${esc(l.title)}</b></span>`; }).join('')}</div>
    <div class="hub-center">${centerKind ? V[centerKind](h.center, c, `${k}.hub.center`) : ''}</div>
    <div class="hub-feats">${(h.features || []).map((f, i) => `<div class="hub-feat"><span class="hub-ic">${icon(f.icon || 'sparkle')}</span><div><b data-k="${k}.hub.features.${i}.title">${md(f.title)}</b>${f.text ? `<span data-k="${k}.hub.features.${i}.text">${md(f.text)}</span>` : ''}</div></div>`).join('')}</div>
  </div>`;
};

// Bureau world: a staff ID badge. badge: { name, role, dept, no, photo, color, since }
V.badge = (v, c, k) => {
  const b = v.badge;
  return `<div class="ui-badge" style="${colorVars(c.brand, b.color || 'cobalt')}">
    <span class="bd-hole"></span>
    <div class="bd-dept">${esc(b.dept || 'Department')}</div>
    <div class="bd-photo">${b.photo ? `<img src="/${esc(b.photo)}" alt="">` : ''}</div>
    <b class="bd-name" data-k="${k}.badge.name">${md(b.name || 'Name')}</b>
    <span class="bd-role" data-k="${k}.badge.role">${md(b.role || '')}</span>
    <div class="bd-foot"><span>Staff ${esc(b.no || '#001')}</span><span>${esc(b.since || 'Since 2026')}</span></div>
    <div class="bd-bar">${'<i></i>'.repeat(30)}</div>
  </div>`;
};

// Bureau world: an inter-office memo. memo: { title, to, from, re, date, body, stamp }
V.memo = (v, c, k) => {
  const m = v.memo;
  return `<div class="ui-memo">
    <div class="mm-title">${esc(m.title || 'Inter-office memo')}</div>
    ${[['To', m.to], ['From', m.from], ['Re', m.re], ['Date', m.date]].filter(([, x]) => x).map(([l, x]) => `<div class="mm-row"><span>${l}</span><b data-k="${k}.memo.${l.toLowerCase()}">${md(x)}</b></div>`).join('')}
    <div class="mm-body" data-k="${k}.memo.body">${md(m.body || '')}</div>
    ${m.stamp ? `<span class="mm-stamp">${esc(m.stamp)}</span>` : ''}
  </div>`;
};

/** Render a visual object. k = data-k prefix (e.g. "slides.3.visual"). */
export function visual(v, c, k) {
  if (!v) return '';
  if (typeof v === 'string') v = { image: v };
  for (const kind of Object.keys(V)) if (v[kind] !== undefined) return `<div class="visual vk-${kind}">${V[kind](v, c, k)}${v.caption ? `<div class="vcap" data-k="${k}.caption">${md(v.caption)}</div>` : ''}</div>`;
  return '';
}
