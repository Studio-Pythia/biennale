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

## Reference data

Each pavilion entry includes a `grid_ref` field cross-checked against **Il Giornale dell'Arte / Allemandi 2026 Biennale Special Edition** (the official press-week paper guide), specifically the alphabetical Nations and Artists indexes plus the three reference maps:

- Full Venice city map with red+green numbered dots and an A-H × 1-6 grid
- Giardini detail map with pavilions numbered 1–29
- Arsenale detail map with venue zones numbered 1–6 (Corderie, Artiglierie, Sale d'Armi, Tese del Cinquecento, Padiglione Italia, Magazzino delle cisterne)

`grid_ref` examples:

- `"Giardini 12"` — Russia, on the Giardini diagram
- `"Arsenale 3"` — Sale d'Armi (long-lease tenants)
- `"42 D2"` — sequential off-site dot 42 at city-map cell D2 (Personal Structures cluster, Cannaregio)
- `"off the map"` — venue not in the printed grid (e.g. Guinea on San Servolo)

To use the reference maps as visual overlays, save them at:

```
assets/venice-map.jpg        # full Venice city map (hero)
assets/giardini-detail.jpg   # Giardini pavilion-block diagram
assets/arsenale-detail.jpg   # Arsenale walls diagram
```

The page falls back to a hand-drawn schematic and a placeholder note when the image files are missing, so it still functions before the assets land.

## Scripts

`scripts/` contains the data-build helpers used to assemble `pavilions.json`:

- `merge_tier3.py` — appended the Tier 3 light-touch country research onto the Tier 1+2 deep-research seed.
- `remap_coords.py` — remapped the original three-zone schematic coordinates onto a unified 1320×660 viewBox for the single-Venice-silhouette layout.
- `add_grid_refs.py` — populated the `grid_ref` field from the Il Giornale dell'Arte / Allemandi guide.

Re-run any script in place: `python3 scripts/<name>.py`.
