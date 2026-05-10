"use client";

import { create } from "zustand";
import type {
  Pavilion,
  PavilionFilters,
  VenueFilter,
  SelectionMethodFilter,
  BudgetTransparencyFilter,
  FlagSeverityFilter,
  FunderType,
  SortKey,
} from "./types";

interface PavilionState {
  pavilions: Pavilion[];
  selectedPavilionId: string | null;
  filters: PavilionFilters;
  sortKey: SortKey;
  setPavilions: (pavilions: Pavilion[]) => void;
  selectPavilion: (id: string | null) => void;
  setVenueFilter: (venue: VenueFilter) => void;
  setSelectionMethodFilter: (method: SelectionMethodFilter) => void;
  setBudgetTransparency: (value: BudgetTransparencyFilter) => void;
  setFlagSeverity: (value: FlagSeverityFilter) => void;
  toggleFunderType: (type: FunderType) => void;
  setSearch: (search: string) => void;
  setSortKey: (key: SortKey) => void;
  resetFilters: () => void;
}

const defaultFilters: PavilionFilters = {
  venue: "all",
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
  sortKey: "country",
  setPavilions: (pavilions) => set({ pavilions }),
  selectPavilion: (id) => set({ selectedPavilionId: id }),
  setVenueFilter: (venue) =>
    set((state) => ({ filters: { ...state.filters, venue } })),
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
  resetFilters: () => set({ filters: defaultFilters }),
}));

export function useFilteredPavilions(input?: Pavilion[]): Pavilion[] {
  const filters = usePavilionStore((s) => s.filters);
  const sortKey = usePavilionStore((s) => s.sortKey);
  const storePavilions = usePavilionStore((s) => s.pavilions);
  const pavilions = input ?? storePavilions;

  const filtered = pavilions.filter((p) => {
    if (filters.venue !== "all" && p.venue !== filters.venue) return false;
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
