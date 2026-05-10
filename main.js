// Venice Biennale 2026 — Financing Map
// ------------------------------------------

const METHOD_COLOR = {
  open_call: '#2a7a3a',
  panel: '#2a5d8f',
  ministerial: '#b91c1c',
  nonprofit: '#8a5a18',
  other: '#888'
};

const FUNDER_COLOR = {
  individual: '#d97706',
  corporate: '#2a5d8f',
  foundation: '#2a7a3a',
  gallery: '#b91c1c'
};

const fmtUsd = n => {
  if (n == null) return null;
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
  return '$' + n;
};

let DATA = [];
let SORT_KEY = 'country';
let SORT_DIR = 'asc';
let FILTER_TEXT = '';
let FILTER_VENUE = '';
let FILTER_METHOD = '';

// ------------------------------------------
// Boot
// ------------------------------------------
async function boot() {
  try {
    const res = await fetch('data/pavilions.json');
    DATA = await res.json();
  } catch (e) {
    console.error('Failed to load pavilions.json', e);
    document.getElementById('pavilion-tbody').innerHTML =
      `<tr><td colspan="8" style="padding: 2em; text-align: center; color: var(--accent);">
        Could not load pavilions.json. Open <code>index.html</code> via a local server (<code>python3 -m http.server</code>) rather than file://.
      </td></tr>`;
    return;
  }

  // Derive funder counts for sorting/sizing
  DATA.forEach(p => {
    p.funder_count = (p.private_funders?.length || 0) + (p.public_funding_sources?.length || 0);
  });

  renderMaps();
  renderTable();
  renderGraph();
  wireUpControls();
}

// ------------------------------------------
// Maps
// ------------------------------------------
function renderMaps() {
  drawGiardini();
  drawArsenale();
  drawOffsite();
}

function drawGiardini() {
  const svg = document.getElementById('map-giardini');
  svg.innerHTML = giardiniBaseSVG();

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'pavilion-nodes');
  svg.appendChild(g);

  DATA.filter(p => p.venue === 'Giardini').forEach(p => placeNode(p, g));
}

function drawArsenale() {
  const svg = document.getElementById('map-arsenale');
  svg.innerHTML = arsenaleBaseSVG();

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'pavilion-nodes');
  svg.appendChild(g);

  DATA.filter(p => p.venue === 'Arsenale').forEach(p => placeNode(p, g));
}

function drawOffsite() {
  const svg = document.getElementById('map-offsite');
  svg.innerHTML = offsiteBaseSVG();

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'pavilion-nodes');
  svg.appendChild(g);

  DATA.filter(p => p.venue === 'off-site').forEach(p => placeNode(p, g));
}

function placeNode(p, parent) {
  if (!p.coords) return;
  const ns = 'http://www.w3.org/2000/svg';
  const r = nodeRadius(p);
  const color = METHOD_COLOR[p.selection_method] || METHOD_COLOR.other;

  const group = document.createElementNS(ns, 'g');
  group.setAttribute('class', 'pavilion-node');
  group.setAttribute('data-id', p.id);
  group.setAttribute('transform', `translate(${p.coords.x}, ${p.coords.y})`);

  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('r', r);
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', '#111');
  circle.setAttribute('stroke-width', '0.5');
  circle.setAttribute('opacity', '0.85');
  group.appendChild(circle);

  const label = document.createElementNS(ns, 'text');
  label.setAttribute('class', 'pavilion-label');
  label.setAttribute('y', r + 4);
  label.textContent = abbreviateCountry(p.country);
  group.appendChild(label);

  group.addEventListener('click', () => openDetail(p));
  group.addEventListener('mouseenter', () => quickTooltip(p, group));
  group.addEventListener('mouseleave', clearTooltip);

  parent.appendChild(group);
}

function nodeRadius(p) {
  if (p.total_budget_amount_usd) {
    // log scale: $200k = 4, $2M = 8, $10M = 14
    return Math.min(20, Math.max(4, Math.sqrt(p.total_budget_amount_usd / 10_000)));
  }
  // fallback: count of named donors
  return Math.min(14, Math.max(3, 3 + (p.funder_count || 0) * 0.8));
}

function abbreviateCountry(c) {
  if (!c) return '';
  if (c.length <= 12) return c;
  return c.substring(0, 11) + '…';
}

let tooltipEl = null;
function quickTooltip(p, group) {
  clearTooltip();
  const ns = 'http://www.w3.org/2000/svg';
  const t = document.createElementNS(ns, 'g');
  t.setAttribute('class', 'pavilion-tooltip');
  const r = nodeRadius(p);
  const txt = document.createElementNS(ns, 'text');
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('y', -r - 8);
  txt.setAttribute('font-family', 'JetBrains Mono, monospace');
  txt.setAttribute('font-size', '11');
  txt.setAttribute('fill', '#111');
  txt.setAttribute('font-weight', '600');
  txt.textContent = p.artist_name || p.country;
  t.appendChild(txt);
  group.appendChild(t);
  tooltipEl = t;
}
function clearTooltip() {
  if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
}

// ------------------------------------------
// Detail panel
// ------------------------------------------
function openDetail(p) {
  const panel = document.getElementById('detail-panel');
  const c = document.getElementById('detail-content');
  c.innerHTML = renderDetail(p);
  panel.setAttribute('aria-hidden', 'false');
  panel.scrollTop = 0;
}

function renderDetail(p) {
  const safe = (v, fallback = '<span class="empty">—</span>') => v ?? fallback;
  const li = items => items?.length
    ? `<ul class="funder-list">${items.map(f => `
        <li>
          <div class="funder-name">${escape(f.name)}${f.amount_usd ? ' · ' + fmtUsd(f.amount_usd) : ''}</div>
          <div class="funder-meta">${escape(f.type || '')}${f.sector ? ' · ' + escape(f.sector) : ''}</div>
          ${f.notes ? `<div style="font-size:0.85rem; color:var(--ink-soft); margin-top:0.2em;">${escape(f.notes)}</div>` : ''}
        </li>`).join('')}</ul>`
    : '<span style="color:var(--ink-faint); font-style:italic;">none disclosed</span>';

  const sources = p.sources?.length
    ? `<ul class="sources-list">${p.sources.map(s => `<li><a href="${escape(s)}" target="_blank" rel="noopener">${escape(s)}</a></li>`).join('')}</ul>`
    : '';

  const flags = p.red_flags?.length
    ? `<div class="red-flags"><h4>Red flags</h4><ul>${p.red_flags.map(f => `<li>${escape(f)}</li>`).join('')}</ul></div>`
    : '';

  return `
    <h3 class="country-name">${escape(p.country)}</h3>
    ${p.show_title ? `<div class="show-title">${escape(p.show_title)}</div>` : ''}
    <dl>
      <dt>Venue</dt><dd>${escape(p.venue)}${p.venue_label ? ' · ' + escape(p.venue_label) : ''}</dd>
      <dt>Artist</dt><dd>${escape(p.artist_name || '—')}${p.artist_born ? `<br><span style="font-size:0.85rem; color:var(--ink-soft);">born ${escape(p.artist_born)}${p.artist_based ? ', based ' + escape(p.artist_based) : ''}</span>` : ''}</dd>
      ${p.artist_gallery ? `<dt>Artist's gallery</dt><dd>${escape(p.artist_gallery)}</dd>` : ''}
      <dt>Curator</dt><dd>${escape(p.curator_name || '—')}${p.curator_affiliation ? `<br><span style="font-size:0.85rem; color:var(--ink-soft);">${escape(p.curator_affiliation)}</span>` : ''}</dd>
      <dt>Commissioner</dt><dd>${escape(p.commissioning_body || '—')}</dd>
      <dt>Selection method</dt><dd><span class="row-method-pill method-${p.selection_method || 'other'}">${escape(p.selection_method || 'other')}</span> ${p.selection_method_notes ? '<br><span style="font-size:0.85rem; color:var(--ink-soft);">' + escape(p.selection_method_notes) + '</span>' : ''}</dd>
      <dt>Total budget</dt><dd>${p.total_budget_amount_usd ? fmtUsd(p.total_budget_amount_usd) : (p.budget_estimate_range_usd ? '~' + escape(p.budget_estimate_range_usd) + ' (estimate)' : '<span style="color:var(--ink-faint); font-style:italic;">not disclosed</span>')}</dd>
      <dt>Public funding</dt><dd>${p.public_funding_sources?.length ? p.public_funding_sources.map(escape).join('; ') : '<span style="color:var(--ink-faint); font-style:italic;">not disclosed</span>'}</dd>
      <dt>Private funders</dt><dd>${li(p.private_funders)}</dd>
      ${p.reception_summary ? `<dt>Reception</dt><dd>${escape(p.reception_summary)}</dd>` : ''}
    </dl>
    ${flags}
    ${sources ? `<dt style="margin-top:1.5em;">Sources</dt><dd>${sources}</dd>` : ''}
  `;
}

function closeDetail() {
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'true');
}

// ------------------------------------------
// Table
// ------------------------------------------
function renderTable() {
  const tbody = document.getElementById('pavilion-tbody');
  let rows = DATA.slice();

  if (FILTER_TEXT) {
    const q = FILTER_TEXT.toLowerCase();
    rows = rows.filter(p => JSON.stringify(p).toLowerCase().includes(q));
  }
  if (FILTER_VENUE) rows = rows.filter(p => p.venue === FILTER_VENUE);
  if (FILTER_METHOD) rows = rows.filter(p => p.selection_method === FILTER_METHOD);

  rows.sort((a, b) => {
    let av = a[SORT_KEY], bv = b[SORT_KEY];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') {
      return SORT_DIR === 'asc' ? av - bv : bv - av;
    }
    av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
    return SORT_DIR === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  tbody.innerHTML = rows.map(p => {
    const td = (v, cls = '') => v
      ? `<td class="${cls}">${escape(v)}</td>`
      : `<td class="empty ${cls}"></td>`;
    return `
      <tr data-id="${p.id}">
        <td><strong>${escape(p.country)}</strong></td>
        <td>${escape(p.venue || '')}</td>
        ${td(p.artist_name)}
        ${td(p.curator_name)}
        ${td(p.commissioning_body)}
        <td>${p.selection_method ? `<span class="row-method-pill method-${p.selection_method}">${escape(p.selection_method)}</span>` : '<span class="empty"></span>'}</td>
        <td class="num">${p.total_budget_amount_usd ? fmtUsd(p.total_budget_amount_usd) : (p.budget_estimate_range_usd ? '~' + escape(p.budget_estimate_range_usd) : '')}</td>
        <td class="num">${p.funder_count || ''}</td>
      </tr>`;
  }).join('');

  document.querySelectorAll('#pavilion-table tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const p = DATA.find(x => x.id === tr.dataset.id);
      if (p) openDetail(p);
    });
  });

  document.querySelectorAll('#pavilion-table th[data-sort]').forEach(th => {
    th.removeAttribute('data-sort-active');
    if (th.dataset.sort === SORT_KEY) th.setAttribute('data-sort-active', SORT_DIR);
  });
}

// ------------------------------------------
// Donor / artist force-directed graph (D3)
// ------------------------------------------
function renderGraph() {
  if (!window.d3) return;
  const svg = d3.select('#donor-graph');
  svg.selectAll('*').remove();

  const w = 1200, h = 700;
  const nodes = [];
  const links = [];
  const idx = new Map();

  function ensure(id, props) {
    if (!idx.has(id)) {
      const n = { id, ...props };
      nodes.push(n);
      idx.set(id, n);
    }
    return idx.get(id);
  }

  DATA.forEach(p => {
    if (!p.country) return;
    const pn = ensure('p:' + p.id, { type: 'pavilion', label: p.country, country: p.country });

    if (p.artist_gallery && typeof p.artist_gallery === 'string') {
      // First gallery only for clarity
      const galleryName = p.artist_gallery.split(/;|,| and /)[0].trim();
      if (galleryName.length > 1) {
        const gn = ensure('g:' + galleryName.toLowerCase(), { type: 'gallery', label: galleryName });
        links.push({ source: pn.id, target: gn.id, kind: 'gallery' });
      }
    }

    (p.private_funders || []).forEach(f => {
      if (!f.name) return;
      const t = (f.type || 'other').toLowerCase();
      const key = t.includes('individual') ? 'individual'
                : t.includes('foundation') ? 'foundation'
                : t.includes('corporate') ? 'corporate'
                : t.includes('gallery') ? 'gallery'
                : 'corporate';
      const fn = ensure('f:' + f.name.toLowerCase(), { type: key, label: f.name });
      links.push({ source: pn.id, target: fn.id, kind: 'funder' });
    });
  });

  // Drop standalone nodes (no links) for clarity
  const linked = new Set();
  links.forEach(l => { linked.add(l.source); linked.add(l.target); });
  const filteredNodes = nodes.filter(n => linked.has(n.id));

  // Drop funder nodes that only connect to one pavilion (focus on cross-pavilion connections)
  const funderConn = new Map();
  links.forEach(l => {
    if (typeof l.target === 'string' && l.target.startsWith('f:')) {
      funderConn.set(l.target, (funderConn.get(l.target) || 0) + 1);
    }
  });

  const keepIds = new Set(filteredNodes.filter(n =>
    n.type === 'pavilion' || (funderConn.get(n.id) || 0) >= 2 || n.type === 'gallery'
  ).map(n => n.id));

  const finalNodes = filteredNodes.filter(n => keepIds.has(n.id));
  const finalLinks = links.filter(l => keepIds.has(l.source) && keepIds.has(l.target));

  // Drop pavilion nodes that have no surviving links
  const finalLinked = new Set();
  finalLinks.forEach(l => { finalLinked.add(l.source); finalLinked.add(l.target); });
  const trulyFinal = finalNodes.filter(n => finalLinked.has(n.id));

  if (trulyFinal.length === 0) return;

  const sim = d3.forceSimulation(trulyFinal)
    .force('link', d3.forceLink(finalLinks).id(d => d.id).distance(80).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-180))
    .force('center', d3.forceCenter(w/2, h/2))
    .force('collision', d3.forceCollide().radius(d => d.type === 'pavilion' ? 14 : 10));

  const link = svg.append('g').selectAll('line').data(finalLinks).enter().append('line')
    .attr('class', 'graph-link');

  const node = svg.append('g').selectAll('g').data(trulyFinal).enter().append('g')
    .style('cursor', 'pointer');

  node.append('circle')
    .attr('r', d => d.type === 'pavilion' ? 7 : 5)
    .attr('fill', d => d.type === 'pavilion' ? '#111'
      : d.type === 'individual' ? FUNDER_COLOR.individual
      : d.type === 'foundation' ? FUNDER_COLOR.foundation
      : d.type === 'gallery' ? FUNDER_COLOR.gallery
      : FUNDER_COLOR.corporate)
    .attr('stroke', '#111').attr('stroke-width', 0.5);

  node.append('text')
    .attr('class', 'graph-node-label')
    .attr('dx', 10).attr('dy', 4)
    .text(d => d.label.length > 28 ? d.label.substring(0, 27) + '…' : d.label);

  node.on('click', (e, d) => {
    if (d.type === 'pavilion') {
      const p = DATA.find(x => 'p:' + x.id === d.id);
      if (p) openDetail(p);
    }
  });

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  });

  node.call(d3.drag()
    .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
  );
}

// ------------------------------------------
// Controls
// ------------------------------------------
function wireUpControls() {
  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

  document.getElementById('table-search').addEventListener('input', e => {
    FILTER_TEXT = e.target.value;
    renderTable();
  });
  document.getElementById('venue-filter').addEventListener('change', e => {
    FILTER_VENUE = e.target.value;
    renderTable();
  });
  document.getElementById('method-filter').addEventListener('change', e => {
    FILTER_METHOD = e.target.value;
    renderTable();
  });

  document.querySelectorAll('#pavilion-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      if (SORT_KEY === th.dataset.sort) {
        SORT_DIR = SORT_DIR === 'asc' ? 'desc' : 'asc';
      } else {
        SORT_KEY = th.dataset.sort;
        SORT_DIR = 'asc';
      }
      renderTable();
    });
  });
}

// ------------------------------------------
// Helpers
// ------------------------------------------
function escape(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ------------------------------------------
// Map base SVGs (stylised schematics)
// ------------------------------------------
function giardiniBaseSVG() {
  return `
    <defs>
      <pattern id="paths-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 20 L40 20 M20 0 L20 40" stroke="#d8d2c2" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect class="venue-water" x="0" y="0" width="1000" height="700"/>
    <path class="venue-ground" d="M40 80 L960 80 L960 600 Q900 640 800 640 L200 640 Q100 640 40 600 Z"/>
    <path d="M40 80 L960 80 L960 600 Q900 640 800 640 L200 640 Q100 640 40 600 Z" fill="none" stroke="#a89e85" stroke-width="1.5"/>
    <text class="venue-region-label" x="500" y="110" text-anchor="middle">Giardini di Castello</text>
    <line x1="160" y1="180" x2="840" y2="180" stroke="#d8d2c2" stroke-dasharray="3,4" stroke-width="0.5"/>
    <line x1="160" y1="320" x2="840" y2="320" stroke="#d8d2c2" stroke-dasharray="3,4" stroke-width="0.5"/>
    <line x1="160" y1="460" x2="840" y2="460" stroke="#d8d2c2" stroke-dasharray="3,4" stroke-width="0.5"/>
    <text x="500" y="180" font-family="JetBrains Mono" font-size="9" fill="#a89e85" text-anchor="middle" dy="-4">main path</text>
  `;
}

function arsenaleBaseSVG() {
  return `
    <rect class="venue-water" x="0" y="0" width="1200" height="500"/>
    <path class="venue-ground" d="M30 100 L1170 100 L1170 360 L30 360 Z"/>
    <path d="M30 100 L1170 100 L1170 360 L30 360 Z" fill="none" stroke="#a89e85" stroke-width="1.5"/>
    <text class="venue-region-label" x="600" y="80" text-anchor="middle">Arsenale · Sale d'Armi · Corderie · Tese</text>
    <text class="venue-region-label" x="600" y="400" text-anchor="middle" font-size="9">Italy Pavilion · Tese delle Vergini →</text>
    <line x1="200" y1="100" x2="200" y2="360" stroke="#d8d2c2" stroke-dasharray="2,3" stroke-width="0.5"/>
    <line x1="400" y1="100" x2="400" y2="360" stroke="#d8d2c2" stroke-dasharray="2,3" stroke-width="0.5"/>
    <line x1="600" y1="100" x2="600" y2="360" stroke="#d8d2c2" stroke-dasharray="2,3" stroke-width="0.5"/>
    <line x1="800" y1="100" x2="800" y2="360" stroke="#d8d2c2" stroke-dasharray="2,3" stroke-width="0.5"/>
    <line x1="1000" y1="100" x2="1000" y2="360" stroke="#d8d2c2" stroke-dasharray="2,3" stroke-width="0.5"/>
  `;
}

function offsiteBaseSVG() {
  return `
    <rect class="venue-water" x="0" y="0" width="1200" height="350"/>
    <text class="venue-region-label" x="150" y="40" text-anchor="middle">Cannaregio</text>
    <text class="venue-region-label" x="400" y="40" text-anchor="middle">San Marco</text>
    <text class="venue-region-label" x="650" y="40" text-anchor="middle">Castello (off-site)</text>
    <text class="venue-region-label" x="900" y="40" text-anchor="middle">Dorsoduro / S. Polo</text>
    <text class="venue-region-label" x="1100" y="40" text-anchor="middle">Mestre</text>
    <path class="venue-ground" d="M30 70 L290 70 L290 300 L30 300 Z" />
    <path class="venue-ground" d="M310 70 L530 70 L530 300 L310 300 Z" />
    <path class="venue-ground" d="M550 70 L780 70 L780 300 L550 300 Z" />
    <path class="venue-ground" d="M800 70 L1030 70 L1030 300 L800 300 Z" />
    <path class="venue-ground" d="M1050 70 L1170 70 L1170 300 L1050 300 Z" />
    <path d="M30 70 L290 70 L290 300 L30 300 Z M310 70 L530 70 L530 300 L310 300 Z M550 70 L780 70 L780 300 L550 300 Z M800 70 L1030 70 L1030 300 L800 300 Z M1050 70 L1170 70 L1170 300 L1050 300 Z" fill="none" stroke="#a89e85" stroke-width="1"/>
  `;
}

boot();
