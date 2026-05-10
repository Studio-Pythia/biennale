# Venice Biennale 2026 — Financing Map

A static, single-page interactive about the financing-and-architecture of the 2026 Venice Art Biennale. Every state pavilion is a state op; the page documents who pays, who picks, who shows.

## Files

```
biennale-2026/
├── index.html        page structure: hero, essay, map, donor graph, table, methodology
├── style.css         all styling — vanilla, no preprocessor
├── main.js           ES module — SVG node placement, detail panel, table sort/filter, D3 force graph
├── data/
│   ├── pavilions.json  one row per pavilion (artist, curator, financing, sources)
│   └── donors.json     (optional, denormalised donor index — built at runtime in main.js)
├── assets/           (empty; SVG map schematics are inline in main.js)
├── vercel.json       static config + cache headers for /data/*
└── README.md         this file
```

## Run locally

```bash
cd /Users/russ/projects/biennale-2026
python3 -m http.server 8000
# then open http://localhost:8000
```

(Direct `file://` will fail because `main.js` uses `fetch()` for the JSON. Any local server will do.)

## Deploy to Vercel

From inside the folder:

```bash
vercel
# follow prompts — first time, link to a new project
# subsequent deploys: vercel --prod
```

Or drag the folder into the Vercel dashboard.

No build step; no framework. Vercel serves the static files directly.

## Editing the data

`data/pavilions.json` is a flat array of pavilion objects. Schema lives in `main.js` (`renderDetail` shows every consumed field). Sources are linked inline in each row.

Each pavilion node on the map needs `coords: { x, y }`. Coordinates are anchored to the SVG viewBoxes defined in `main.js`:
- Giardini: 1000 × 700
- Arsenale: 1200 × 500
- Off-site: 1200 × 350

Node size is derived from `total_budget_amount_usd` (log scale) or, fallback, the count of named funders.

## Sources

All claims are linked from per-pavilion source arrays. Where a budget is not disclosed, the cell is empty by design — opacity is part of the story.
