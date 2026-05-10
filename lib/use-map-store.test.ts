import { describe, expect, it } from "vitest";
import type { MapFilters, Pavilion } from "./types";
import { filterPavilions } from "./use-map-store";

const baseFilters: MapFilters = {
  venue: "all",
  selectionMethod: "all",
  redFlagsOnly: false,
  search: "",
  budgetRange: [0, 10000000],
};

const pavilions: Pavilion[] = [
  {
    id: "at",
    country: "Austria",
    pavilion_name: "Austria Pavilion",
    venue: "Giardini",
    venue_label: "Giardini 12",
    coords: { x: 100, y: 100 },
    pavilion_owner: "Owner",
    artist_name: "Alice",
    artist_born: "1970, Vienna, Austria",
    artist_based: "Vienna",
    artist_gallery: "Gallery A",
    show_title: "Floodline",
    curator_name: "Curator A",
    curator_affiliation: "Museum A",
    commissioning_body: "Body A",
    commissioning_body_type: "public",
    selection_method: "open_call",
    selection_method_notes: "",
    total_budget_disclosed: false,
    total_budget_amount_usd: null,
    budget_estimate_range_usd: null,
    public_funding_amount_usd: null,
    public_funding_sources: [],
    private_funders: [{ name: "Funder One", type: "foundation", amount_usd: null, sector: "arts", notes: "" }],
    reception_summary: "",
    red_flags: [],
    sources: [],
    grid_ref: "Giardini 12",
  },
  {
    id: "uk",
    country: "United Kingdom",
    pavilion_name: "UK Pavilion",
    venue: "Arsenale",
    venue_label: "Arsenale 2",
    coords: { x: 200, y: 220 },
    pavilion_owner: "Owner",
    artist_name: "Bob",
    artist_born: "1975, London, UK",
    artist_based: "London",
    artist_gallery: "Gallery B",
    show_title: "Signal",
    curator_name: "Curator B",
    curator_affiliation: "Museum B",
    commissioning_body: "Body B",
    commissioning_body_type: "public",
    selection_method: "panel",
    selection_method_notes: "",
    total_budget_disclosed: true,
    total_budget_amount_usd: 500000,
    budget_estimate_range_usd: null,
    public_funding_amount_usd: 100000,
    public_funding_sources: ["Gov"],
    private_funders: [{ name: "Blue Sponsor", type: "corporate", amount_usd: 50000, sector: "finance", notes: "" }],
    reception_summary: "",
    red_flags: ["flag"],
    sources: [],
    grid_ref: "Arsenale 2",
  },
];

describe("filterPavilions", () => {
  it("treats null budget as 0 for budget filtering", () => {
    const result = filterPavilions(pavilions, { ...baseFilters, budgetRange: [1, 10000000] }, null);
    expect(result.map((p) => p.id)).toEqual(["uk"]);
  });

  it("applies combined venue, method and red flag filters", () => {
    const result = filterPavilions(
      pavilions,
      {
        ...baseFilters,
        venue: "Arsenale",
        selectionMethod: "panel",
        redFlagsOnly: true,
      },
      null
    );
    expect(result.map((p) => p.id)).toEqual(["uk"]);
  });

  it("searches across funder names", () => {
    const result = filterPavilions(pavilions, { ...baseFilters, search: "blue sponsor" }, null);
    expect(result.map((p) => p.id)).toEqual(["uk"]);
  });
});
