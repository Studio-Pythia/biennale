"use client";

import { create } from "zustand";
import type { Pavilion, MapFilters, VenueFilter, SelectionMethodFilter } from "./types";

interface MapState {
  pavilions: Pavilion[];
  selectedPavilionId: string | null;
  highlightedFunder: string | null;
  filters: MapFilters;
  setPavilions: (pavilions: Pavilion[]) => void;
  selectPavilion: (id: string | null) => void;
  highlightFunder: (funderName: string | null) => void;
  setVenueFilter: (venue: VenueFilter) => void;
  setSelectionMethodFilter: (method: SelectionMethodFilter) => void;
  setRedFlagsOnly: (value: boolean) => void;
  setSearch: (search: string) => void;
  setBudgetRange: (range: [number, number]) => void;
  resetFilters: () => void;
}

const defaultFilters: MapFilters = {
  venue: "all",
  selectionMethod: "all",
  redFlagsOnly: false,
  search: "",
  budgetRange: [0, 10000000],
};

export const useMapStore = create<MapState>((set) => ({
  pavilions: [],
  selectedPavilionId: null,
  highlightedFunder: null,
  filters: defaultFilters,
  setPavilions: (pavilions) => set({ pavilions }),
  selectPavilion: (id) => set({ selectedPavilionId: id }),
  highlightFunder: (funderName) => set({ highlightedFunder: funderName }),
  setVenueFilter: (venue) =>
    set((state) => ({ filters: { ...state.filters, venue } })),
  setSelectionMethodFilter: (method) =>
    set((state) => ({ filters: { ...state.filters, selectionMethod: method } })),
  setRedFlagsOnly: (value) =>
    set((state) => ({ filters: { ...state.filters, redFlagsOnly: value } })),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  setBudgetRange: (range) =>
    set((state) => ({ filters: { ...state.filters, budgetRange: range } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

export function useFilteredPavilions() {
  const { pavilions, filters, highlightedFunder } = useMapStore();

  return pavilions.filter((p) => {
    // Venue filter
    if (filters.venue !== "all" && p.venue !== filters.venue) return false;

    // Selection method filter
    if (
      filters.selectionMethod !== "all" &&
      p.selection_method !== filters.selectionMethod
    )
      return false;

    // Red flags filter
    if (filters.redFlagsOnly && p.red_flags.length === 0) return false;

    // Budget filter
    const budget = p.total_budget_amount_usd || 0;
    if (budget < filters.budgetRange[0] || budget > filters.budgetRange[1])
      return false;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        p.country,
        p.artist_name,
        p.curator_name,
        p.show_title,
        ...p.private_funders.map((f) => f.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!searchableText.includes(searchLower)) return false;
    }

    // Funder highlight (doesn't filter, just for reference)
    return true;
  });
}

export function getPavilionsByFunder(funderName: string, pavilions: Pavilion[]) {
  return pavilions.filter((p) =>
    p.private_funders.some(
      (f) => f.name.toLowerCase() === funderName.toLowerCase()
    )
  );
}
