export interface Funder {
  name: string;
  type: "individual" | "foundation" | "corporate" | "gallery";
  amount_usd: number | null;
  sector: string;
  notes: string;
}

export interface Pavilion {
  id: string;
  country: string;
  pavilion_name: string;
  venue: "Giardini" | "Arsenale" | "Off-site";
  venue_label: string;
  coords: {
    x: number;
    y: number;
  };
  pavilion_owner: string;
  artist_name: string;
  artist_born: string;
  artist_based: string;
  artist_gallery: string;
  show_title: string;
  curator_name: string;
  curator_affiliation: string;
  commissioning_body: string;
  commissioning_body_type: string;
  selection_method: "open_call" | "panel" | "ministerial" | "invitation" | "unknown";
  selection_method_notes: string;
  total_budget_disclosed: boolean;
  total_budget_amount_usd: number | null;
  budget_estimate_range_usd: string | null;
  public_funding_amount_usd: number | null;
  public_funding_sources: string[];
  private_funders: Funder[];
  reception_summary: string;
  red_flags: string[];
  sources: string[];
  grid_ref: string;
}

export type VenueFilter = "all" | "Giardini" | "Arsenale" | "Off-site";
export type SelectionMethodFilter = "all" | "open_call" | "panel" | "ministerial" | "invitation";
export type BudgetTransparencyFilter = "all" | "disclosed" | "undisclosed";
export type FlagSeverityFilter = "all" | "red" | "clean";
export type ContinentFilter = "all" | "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";
export type FunderType = Funder["type"];
export type SortKey =
  | "random"
  | "country"
  | "budget_desc"
  | "red_flags_desc"
  | "private_funders_desc";

export interface PavilionFilters {
  venue: VenueFilter;
  continent: ContinentFilter;
  selectionMethod: SelectionMethodFilter;
  funderTypes: FunderType[];
  budgetTransparency: BudgetTransparencyFilter;
  flagSeverity: FlagSeverityFilter;
  search: string;
}
