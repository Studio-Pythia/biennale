# Venice Biennale 2026 — Financing Map

An interactive map about the financing and architecture of the 2026 Venice Art Biennale. Every state pavilion is a state op; the page documents who pays, who picks, who shows.

## Files

```
biennale/
├── app/                    Next.js App Router entrypoints and layout
├── components/             map + panel UI components
├── lib/                    data shaping, coordinates, state management
├── data/pavilions.json     pavilion dataset
├── public/images/          map image assets used by React Flow backgrounds
├── scripts/                helper scripts used to prepare data
└── README.md               this file
```

## Run locally

```bash
npm install
npm run dev
# then open http://localhost:3000
```

## Deploy to Vercel

From inside the folder:

```bash
vercel
# follow prompts — first time, link to a new project
# subsequent deploys: vercel --prod
```

Or drag the folder into the Vercel dashboard.

This project is a Next.js application and includes a standard build step (`npm run build`) for production deploys.

## Editing the data

`data/pavilions.json` is a flat array of pavilion objects. The TypeScript schema is defined in `lib/types.ts`. Sources are linked inline in each row.

Each pavilion entry includes `coords: { x, y }` and/or `grid_ref`, which are interpreted by `lib/data.ts` and `lib/venue-coordinates.ts` for map placement.

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
public/images/venice-map.jpg    # full Venice city map
public/images/giardini-map.jpg  # Giardini pavilion-block diagram
public/images/arsenale-map.jpg  # Arsenale walls diagram
```

The app renders fallback styling when image files are missing, so development can continue before all assets land.

## Scripts

`scripts/` contains the data-build helpers used to assemble `pavilions.json`:

- `merge_tier3.py` — appended the Tier 3 light-touch country research onto the Tier 1+2 deep-research seed.
- `remap_coords.py` — remapped the original three-zone schematic coordinates onto a unified 1320×660 viewBox for the single-Venice-silhouette layout.
- `add_grid_refs.py` — populated the `grid_ref` field from the Il Giornale dell'Arte / Allemandi guide.

Re-run any script in place: `python3 scripts/<name>.py`.
