"use client";

import { create } from "zustand";
import type {
  Pavilion,
  PavilionFilters,
  VenueFilter,
  ContinentFilter,
  SelectionMethodFilter,
  BudgetTransparencyFilter,
  FlagSeverityFilter,
  FunderType,
  SortKey,
} from "./types";
import { getContinent } from "./continents";

interface PavilionState {
  pavilions: Pavilion[];
  selectedPavilionId: string | null;
  filters: PavilionFilters;
  sortKey: SortKey;
  shuffleSeed: number;
  setPavilions: (pavilions: Pavilion[]) => void;
  selectPavilion: (id: string | null) => void;
  setVenueFilter: (venue: VenueFilter) => void;
  setContinentFilter: (continent: ContinentFilter) => void;
  setSelectionMethodFilter: (method: SelectionMethodFilter) => void;
  setBudgetTransparency: (value: BudgetTransparencyFilter) => void;
  setFlagSeverity: (value: FlagSeverityFilter) => void;
  toggleFunderType: (type: FunderType) => void;
  setSearch: (search: string) => void;
  setSortKey: (key: SortKey) => void;
  reshuffle: () => void;
  resetFilters: () => void;
}

const defaultFilters: PavilionFilters = {
  venue: "all",
  continent: "all",
  selectionMethod: "all",
  funderTypes: [],
  budgetTransparency: "all",
  flagSeverity: "all",
  search: "",
};

export const usePavilionStore = create<PavilionState>((set) => ({
  pavilions: [],
  selectedPavilionId: null,
  filters: defaultFilters,
  sortKey: "random",
  shuffleSeed: 1,
  setPavilions: (pavilions) => set({ pavilions }),
  selectPavilion: (id) => set({ selectedPavilionId: id }),
  setVenueFilter: (venue) =>
    set((state) => ({ filters: { ...state.filters, venue } })),
  setContinentFilter: (continent) =>
    set((state) => ({ filters: { ...state.filters, continent } })),
  setSelectionMethodFilter: (method) =>
    set((state) => ({ filters: { ...state.filters, selectionMethod: method } })),
  setBudgetTransparency: (value) =>
    set((state) => ({ filters: { ...state.filters, budgetTransparency: value } })),
  setFlagSeverity: (value) =>
    set((state) => ({ filters: { ...state.filters, flagSeverity: value } })),
  toggleFunderType: (type) =>
    set((state) => {
      const current = state.filters.funderTypes;
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { filters: { ...state.filters, funderTypes: next } };
    }),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  setSortKey: (sortKey) => set({ sortKey }),
  reshuffle: () =>
    set((state) => ({
      sortKey: "random",
      shuffleSeed: state.shuffleSeed + 1,
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

// Mulberry32 — small fast deterministic PRNG, gives stable shuffle per seed.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useFilteredPavilions(input?: Pavilion[]): Pavilion[] {
  const filters = usePavilionStore((s) => s.filters);
  const sortKey = usePavilionStore((s) => s.sortKey);
  const shuffleSeed = usePavilionStore((s) => s.shuffleSeed);
  const storePavilions = usePavilionStore((s) => s.pavilions);
  const pavilions = input ?? storePavilions;

  const filtered = pavilions.filter((p) => {
    if (filters.venue !== "all" && p.venue !== filters.venue) return false;

    if (filters.continent !== "all") {
      if (getContinent(p.id) !== filters.continent) return false;
    }

    if (
      filters.selectionMethod !== "all" &&
      p.selection_method !== filters.selectionMethod
    )
      return false;

    if (filters.budgetTransparency === "disclosed" && !p.total_budget_disclosed)
      return false;
    if (filters.budgetTransparency === "undisclosed" && p.total_budget_disclosed)
      return false;

    if (filters.flagSeverity === "red" && p.red_flags.length === 0) return false;
    if (filters.flagSeverity === "clean" && p.red_flags.length > 0) return false;

    if (filters.funderTypes.length > 0) {
      const hasMatch = p.private_funders.some((f) =>
        filters.funderTypes.includes(f.type)
      );
      if (!hasMatch) return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        p.country,
        p.artist_name,
        p.curator_name,
        p.show_title,
        ...p.private_funders.map((f) => f.name),
        ...p.public_funding_sources,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchableText.includes(searchLower)) return false;
    }

    return true;
  });

  if (sortKey === "random") {
    return shuffle(filtered, shuffleSeed);
  }

  return [...filtered].sort((a, b) => {
    switch (sortKey) {
      case "budget_desc":
        return (b.total_budget_amount_usd ?? -1) - (a.total_budget_amount_usd ?? -1);
      case "red_flags_desc":
        return b.red_flags.length - a.red_flags.length;
      case "private_funders_desc":
        return b.private_funders.length - a.private_funders.length;
      case "country":
      default:
        return a.country.localeCompare(b.country);
    }
  });
}
