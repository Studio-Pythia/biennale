"use client";

import { useMapStore } from "@/lib/use-map-store";
import type { VenueFilter, SelectionMethodFilter } from "@/lib/types";

const venueOptions: { value: VenueFilter; label: string; color: string }[] = [
  { value: "all", label: "All Venues", color: "#6b7280" },
  { value: "Giardini", label: "Giardini", color: "#22c55e" },
  { value: "Arsenale", label: "Arsenale", color: "#f97316" },
  { value: "Off-site", label: "Off-site", color: "#3b82f6" },
];

const selectionOptions: { value: SelectionMethodFilter; label: string }[] = [
  { value: "all", label: "All Methods" },
  { value: "open_call", label: "Open Call" },
  { value: "panel", label: "Panel" },
  { value: "ministerial", label: "Ministerial" },
  { value: "invitation", label: "Invitation" },
];

export function FilterBar() {
  const {
    filters,
    setVenueFilter,
    setSelectionMethodFilter,
    setRedFlagsOnly,
    setSearch,
    resetFilters,
    highlightedFunder,
    highlightFunder,
  } = useMapStore();

  const hasActiveFilters =
    filters.venue !== "all" ||
    filters.selectionMethod !== "all" ||
    filters.redFlagsOnly ||
    filters.search !== "";

  return (
    <div
      className="flex items-center gap-3 p-3 flex-wrap"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search country, artist, funder..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 text-sm rounded-lg w-64"
          style={{
            backgroundColor: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Venue Filter */}
      <div className="flex gap-1">
        {venueOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setVenueFilter(option.value)}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{
              backgroundColor:
                filters.venue === option.value ? `${option.color}20` : "transparent",
              border: `1px solid ${filters.venue === option.value ? option.color : "var(--border)"}`,
              color: filters.venue === option.value ? option.color : "var(--muted-foreground)",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Selection Method */}
      <select
        value={filters.selectionMethod}
        onChange={(e) =>
          setSelectionMethodFilter(e.target.value as SelectionMethodFilter)
        }
        className="px-3 py-1.5 text-xs rounded-lg"
        style={{
          backgroundColor: "var(--muted)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      >
        {selectionOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Red Flags Toggle */}
      <button
        onClick={() => setRedFlagsOnly(!filters.redFlagsOnly)}
        className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
        style={{
          backgroundColor: filters.redFlagsOnly ? "rgba(225, 29, 72, 0.2)" : "transparent",
          border: `1px solid ${filters.redFlagsOnly ? "var(--primary)" : "var(--border)"}`,
          color: filters.redFlagsOnly ? "var(--primary)" : "var(--muted-foreground)",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: filters.redFlagsOnly ? "var(--primary)" : "var(--muted-foreground)",
          }}
        />
        Red Flags Only
      </button>

      {/* Highlighted Funder Badge */}
      {highlightedFunder && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: "rgba(225, 29, 72, 0.1)",
            border: "1px solid var(--primary)",
          }}
        >
          <span className="text-xs" style={{ color: "var(--primary)" }}>
            Showing: {highlightedFunder}
          </span>
          <button
            onClick={() => highlightFunder(null)}
            className="hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--muted)] transition-colors"
          style={{
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
