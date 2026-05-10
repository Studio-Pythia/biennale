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
  drawVenice();
  drawDetail('map-giardini-detail', 'assets/giardini-detail.jpg', 'Giardini', 720, 720);
  drawDetail('map-arsenale-detail', 'assets/arsenale-detail.jpg', 'Arsenale', 720, 720);
}

function drawVenice() {
  const svg = document.getElementById('map-venice');
  svg.innerHTML = veniceBaseSVG();

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'pavilion-nodes');
  svg.appendChild(g);

  DATA.forEach(p => placeNode(p, g));
}

function drawDetail(svgId, imageHref, venueFilter, w, h) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = `
    <rect class="venue-water" x="0" y="0" width="${w}" height="${h}"/>
    <image href="${imageHref}" x="0" y="0" width="${w}" height="${h}"
           preserveAspectRatio="xMidYMid meet" onerror="this.remove()"/>
    <text class="venue-region-label" x="${w/2}" y="${h - 12}" text-anchor="middle" font-size="10" opacity="0.6">
      Save the ${venueFilter} detail map at assets/${venueFilter.toLowerCase()}-detail.jpg
    </text>
  `;
  // Detail-map nodes use detail_coords if present; otherwise we skip on this layer.
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'pavilion-nodes');
  svg.appendChild(g);
  DATA.filter(p => p.venue === venueFilter && p.detail_coords).forEach(p => {
    const tmp = { ...p, coords: p.detail_coords };
    placeNode(tmp, g);
  });
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
      <dt>Venue</dt><dd>${escape(p.venue)}${p.venue_label ? ' · ' + escape(p.venue_label) : ''}${p.grid_ref ? ` <span style="color:var(--ink-faint); font-family:var(--mono); font-size:0.8em;">[${escape(p.grid_ref)}]</span>` : ''}</dd>
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
// Map base SVG (stylised Venice silhouette)
// ------------------------------------------
function veniceBaseSVG() {
  return `
    <!-- water / lagoon -->
    <rect class="venue-water" x="0" y="0" width="1320" height="660"/>

    <!-- If assets/venice-map.jpg exists, use it as the base map (real Biennale 2026 map).
         The hand-drawn schematic below remains as a fallback when the image is absent. -->
    <image href="assets/venice-map.jpg" x="0" y="0" width="1320" height="660"
           preserveAspectRatio="xMidYMid slice" onerror="this.remove()"/>

    <!-- Mestre (mainland, top-right inset) -->
    <path class="venue-ground" d="M1230 130 L1320 130 L1320 280 L1240 280 L1230 130 Z"/>
    <path d="M1230 130 L1320 130 L1320 280 L1240 280 L1230 130 Z" fill="none" stroke="#a89e85" stroke-width="0.7"/>
    <text class="venue-region-label" x="1280" y="170" text-anchor="middle" font-size="10">Mestre</text>

    <!-- San Michele (cemetery island, NE) -->
    <path class="venue-ground" d="M620 60 L720 50 L740 80 L730 110 L680 120 L620 110 Z"/>
    <path d="M620 60 L720 50 L740 80 L730 110 L680 120 L620 110 Z" fill="none" stroke="#a89e85" stroke-width="0.7"/>
    <text class="venue-region-label" x="680" y="45" text-anchor="middle" font-size="10">San Michele</text>

    <!-- Venice main island: a single complex blob -->
    <path class="venue-ground" d="
      M60 280
      L80 220 L130 195 L210 175 L290 160 L370 145 L430 165
      L490 145 L530 160 L560 195 L600 170 L640 185 L680 165
      L720 180 L780 165 L850 175 L920 165 L1000 180 L1070 200
      L1110 230 L1130 270
      L1150 320 L1160 360 L1140 400 L1100 425 L1030 440
      L960 445 L880 450 L810 460 L740 465 L680 480 L620 488
      L560 495 L490 488 L420 488 L350 478 L290 472 L220 460
      L150 440 L90 410 L60 360 Z"/>
    <path d="
      M60 280
      L80 220 L130 195 L210 175 L290 160 L370 145 L430 165
      L490 145 L530 160 L560 195 L600 170 L640 185 L680 165
      L720 180 L780 165 L850 175 L920 165 L1000 180 L1070 200
      L1110 230 L1130 270
      L1150 320 L1160 360 L1140 400 L1100 425 L1030 440
      L960 445 L880 450 L810 460 L740 465 L680 480 L620 488
      L560 495 L490 488 L420 488 L350 478 L290 472 L220 460
      L150 440 L90 410 L60 360 Z" fill="none" stroke="#a89e85" stroke-width="1"/>

    <!-- Grand Canal as a thicker white S-curve -->
    <path d="M80 280 Q200 320 330 310 Q420 305 470 340 Q520 380 600 360 Q670 345 720 380 Q790 420 870 410 L1000 410"
          fill="none" stroke="#f6f3ec" stroke-width="6" stroke-linecap="round" opacity="0.85"/>

    <!-- internal canal hatching (suggestive, not literal) -->
    <g stroke="#e6e0cf" stroke-width="0.6" fill="none" opacity="0.7">
      <path d="M150 220 L180 280"/>
      <path d="M260 200 L290 270"/>
      <path d="M380 200 L410 290"/>
      <path d="M460 240 L500 320"/>
      <path d="M570 240 L590 330"/>
      <path d="M650 250 L680 360"/>
      <path d="M780 240 L810 360"/>
      <path d="M870 240 L900 380"/>
      <path d="M970 240 L990 380"/>
      <path d="M120 380 L260 410"/>
      <path d="M340 410 L520 440"/>
      <path d="M620 440 L800 450"/>
    </g>

    <!-- Arsenale (highlighted in accent) -->
    <path d="M955 270 L1085 270 L1095 290 L1085 310 L1100 330 L1100 360 L1085 380 L1010 390 L955 380 L955 340 L975 320 L955 295 Z"
          fill="rgba(185,28,28,0.14)" stroke="var(--accent)" stroke-width="2"/>
    <text class="venue-region-label" x="1020" y="262" text-anchor="middle" fill="var(--accent)" font-weight="600" font-size="11">Arsenale</text>

    <!-- Giardini (pentagon, highlighted) -->
    <path d="M1170 410 L1310 415 L1320 480 L1280 555 L1180 560 L1165 480 Z"
          fill="rgba(185,28,28,0.10)" stroke="var(--accent)" stroke-width="2"/>
    <text class="venue-region-label" x="1240" y="500" text-anchor="middle" fill="var(--accent)" font-weight="600" font-size="11">Giardini</text>

    <!-- San Giorgio Maggiore (small island below San Marco) -->
    <path class="venue-ground" d="M650 530 L740 530 L755 555 L730 575 L660 575 L645 555 Z"/>
    <path d="M650 530 L740 530 L755 555 L730 575 L660 575 L645 555 Z" fill="none" stroke="#a89e85" stroke-width="0.7"/>
    <text class="venue-region-label" x="700" y="560" text-anchor="middle" font-size="9">San Giorgio Maggiore</text>

    <!-- Giudecca (long thin southern island) -->
    <path class="venue-ground" d="M180 570 L860 555 L900 575 L850 605 L240 615 L170 600 Z"/>
    <path d="M180 570 L860 555 L900 575 L850 605 L240 615 L170 600 Z" fill="none" stroke="#a89e85" stroke-width="0.7"/>
    <text class="venue-region-label" x="500" y="595" text-anchor="middle" font-size="10">Giudecca</text>

    <!-- District labels on the main island -->
    <text class="venue-region-label" x="260" y="220" font-size="11" text-anchor="middle" opacity="0.7">Cannaregio</text>
    <text class="venue-region-label" x="500" y="265" font-size="11" text-anchor="middle" opacity="0.7">San Marco</text>
    <text class="venue-region-label" x="380" y="320" font-size="11" text-anchor="middle" opacity="0.7">San Polo</text>
    <text class="venue-region-label" x="320" y="430" font-size="11" text-anchor="middle" opacity="0.7">Dorsoduro</text>
    <text class="venue-region-label" x="820" y="420" font-size="11" text-anchor="middle" opacity="0.7">Castello</text>
    <text class="venue-region-label" x="500" y="385" font-size="9" text-anchor="middle" opacity="0.55" font-style="italic">Rialto</text>
    <text class="venue-region-label" x="610" y="430" font-size="9" text-anchor="middle" opacity="0.55" font-style="italic">Piazza San Marco</text>
    <text class="venue-region-label" x="180" y="320" font-size="9" text-anchor="middle" opacity="0.55" font-style="italic">Canal Grande</text>
  `;
}

boot();
